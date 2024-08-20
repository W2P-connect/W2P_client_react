import React, { useState, useEffect } from 'react'
import { translate } from '../../../translation'
import { useCallPipedriveApi } from '../../../helpers'
import PipepdriveField from '_COMPONENTS/PIPEDRIVE/PipedriveField/PipepdriveField'
import { useHookSelector } from '../parametersHelpers'
import Datalist from '_COMPONENTS/FORMS/INPUT/datalist/Datalist'
import HookSelector from '_COMPONENTS/HookSelector/HookSelector'
import { priorityFieldsKey, unusableFieldsKey } from '../../../appConstante'
import { Category, Hook, PipedriveField } from 'Types'
import { useAppDataContext, useNotification } from '_CONTEXT/hook/contextHook'
import { AxiosResponse } from 'axios'
import { observer } from 'mobx-react-lite'
import { pipedriveFieldsStore, PipedriveFieldStore } from '_STORES/PipedriveFields'
import { hookFieldStore } from '_STORES/HookField'
import { hookStore } from '_STORES/Hooks'


const FieldCategory = ({ category }: { category: Category }) => {

  const callPipedriveApi = useCallPipedriveApi()

  const { saveParameters } = useAppDataContext()

  const { addNotification } = useNotification()

  const [searchField, setSearchField] = useState<string>("")
  const [pipedriveFieldsList, setPipedriveFieldsList] = useState<null | PipedriveField[]>(null)
  const [selectHook, setSelectHook] = useState<Hook | null>(null)

  const [hookToShow, setHookToShow] = useState<Hook | null>(null)

  const getCategoryFields = (e: React.FormEvent) => {
    callPipedriveApi(`${category}Fields`, null, null, null, e)
      .then((res: AxiosResponse<any, any> | null) => {
        if (!res?.data?.data) {
          throw Error("No data in Pipedrive response")
        }
        res.data.data.forEach((field: any) => {
          const newField = { ...field as PipedriveField, category: category }

          PipedriveFieldStore.isFieldValid(newField) && pipedriveFieldsStore.addPipedriveField({ ...field, category: category })
        });
      })

      .catch(error => {
        addNotification({
          error: true,
          content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
        })
      })
  }

  const categoryFields: PipedriveField[] = pipedriveFieldsStore.getCategoryFields(category)

  useEffect(() => {
    setPipedriveFieldsList(categoryFields)
  }, [categoryFields, category])

  useEffect(() => {
    if (searchField) {
      setPipedriveFieldsList(_ =>
        categoryFields
          .filter(field => field.name.includes(searchField))
      )
    } else {
      setPipedriveFieldsList(categoryFields)
    }
  }, [searchField])

  const selectHookToSetUp = (hook: Hook) => {
    setSelectHook(_ => hook)
  }

  useEffect(() => {
    if (selectHook) {
      const hook = hookStore.getHook(selectHook.id)
      if (hook) {
        setHookToShow(_ => hook)
      }
    }
  }, [selectHook?.id])


  /*********** checked ***********/

  const updateHook = (hookId: string, key: keyof Hook, value: any) => {
    hookStore.updateHook(hookId, { [key]: value });
  };


  return (
    <div key={category}>
      <form onSubmit={e => saveParameters(e)}>
        <div className='w2p-instructions'>
          <p>{translate(`Select the different events that will sync Woocommerce and wordpress informations to Pipedrive.`)}</p>
        </div>
        <div className='flex gap-1 w2p-wrap m-b-25 m-t-25'>
          {hookStore.preHooks
            .filter(hook => !hook?.disabledFor?.includes(category))
            .map(hook => {
              return <HookSelector key={hook.key} preHook={hook} selector={selectHookToSetUp} category={category} active={hookToShow?.key === hook.key} />
            })}
        </div>

        {hookToShow
          ? <div key={hookToShow.key}>
            {/* <div className='w2p-instructions'>
              <p>{translate(
                `Here you can load general and custom fields from Pipedrive ${category}s\
           to feed them with data from Woocommerce.`)}
                <br />
                {translate("Set the value to assign to the fields during various user events.")}
              </p>
            </div> */}
            {hookToShow.fields
              ? <div key={category}>
                <h5 className='m-b-25'>{translate(`Parameter of the event : ${hookToShow.label}`)}</h5>

                <label className='pointer flex items-center m-b-10'>
                  <input
                    type="checkbox"
                    className='m-r-10'
                    onChange={(e) => updateHook(
                      hookToShow.id,
                      "createActivity",
                      e.target.checked
                    )}
                    checked={hookToShow.createActivity ?? false}
                  />
                  <div>
                    {translate("Add an activity when this event is triggered.")}
                    <div className='subtext'>
                      {translate(`An activity specifying the updated fields and the triggered event will be automatically added to the ${hookToShow.category} on Pipedrive.`)}
                    </div>
                  </div>
                </label>

                <div className='m-b-25'>
                  <Datalist
                    label={translate("Search a field")}
                    placehoder={translate("Name, owner, email,...")}
                    items={categoryFields.map(field => ({ value: field.name, id: field.id }))}
                    value={searchField}
                    onInput={setSearchField}
                  />
                </div>
                {hookToShow.fields.length
                  ? <div className='flex column m-t-25 gap-1'>
                    {/* Priority fields */}
                    {hookToShow.fields
                      .filter(field => PipedriveFieldStore.isFieldValid(field.pipedrive))
                      .filter(field => priorityFieldsKey[category]?.includes(field.key))
                      .map(field =>
                        <PipepdriveField pipedriveFieldId={field.pipedriveFieldId} key={field.pipedriveFieldId} relatedHook={hookToShow} priority={true} />
                      )}
                    {/* other fields */}
                    {hookToShow.fields
                      .filter(field => !field.enabled)
                      .filter(field => !unusableFieldsKey.includes(field.key))
                      .filter(field => !priorityFieldsKey[category]?.includes(field.key))
                      .map(field =>
                        <PipepdriveField pipedriveFieldId={field.pipedriveFieldId} key={field.pipedriveFieldId} relatedHook={hookToShow} priority={false} />
                      )}
                  </div>
                  : <p>{searchField
                    ? translate("There is not field to show.")
                    : translate("You haven't loaded custom fields yet.")
                  }
                  </p>}
              </div>
              : null
            }
            <button
              type='button'
              onClick={e => getCategoryFields(e)}
              className='light-button m-t-25'
            >
              {pipedriveFieldsList?.length
                ? translate("Reload custom fields")
                : translate("Load custom fields")
              }
            </button>
          </div>
          : <h3 className='center m-t-25'>{translate("Select an event to configure it")}</h3>}
      </form>
    </div>
  )
}


export default observer(FieldCategory)