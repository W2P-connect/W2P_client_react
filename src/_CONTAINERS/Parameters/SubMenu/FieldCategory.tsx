import React, { useState, useEffect } from 'react'
import { translate } from '../../../translation'
import { useCallPipedriveApi } from '../../../helpers'
import PipepdriveField from '../../../_COMPONENTS/PIPEDRIVE/PipedriveField/PipepdriveField'
import { useHookSelector, usePipedriveFields } from '../parametersHelpers'
import Datalist from '../../../_COMPONENTS/FORMS/INPUT/datalist/Datalist'
import HookSelector from '../../../_COMPONENTS/HookSelector/HookSelector'
import { priorityFieldsKey, unusableFieldsKey } from '../../../appConstante'
import { Category, Hook, PipedriveField } from 'Types'
import { useAppDataContext, useNotification } from '_CONTEXT/hook/contextHook'
import { AxiosResponse } from 'axios'

export default function FieldCategory({ category }: { category: Category }) {

  const callPipedriveApi = useCallPipedriveApi()

  const { formatPipedriveFields } = usePipedriveFields()

  const { appData, saveParameters, setAppData } = useAppDataContext()
  const { setOptionHook, getHook, getHookFromParent } = useHookSelector()
  const { addNotification } = useNotification()

  const [searchField, setSearchField] = useState<string>("")
  const [filedsList, setFieldsList] = useState<null | PipedriveField[]>(null)
  const [hookToShow, setHookToShow] = useState<Hook | null>(null)
  const [selectHook, setSelectHook] = useState<Hook | null>(null)

  const categoryFields: PipedriveField[] = appData.parameters.pipedrive[`${category}Fields`]

  const getCategoryFields = (e: React.FormEvent) => {
    callPipedriveApi(`${category}Fields`, null, null, null, e)
      .then((res: AxiosResponse) => {
        setAppData(prvAppData => {
          prvAppData.parameters.pipedrive[`${category}Fields`] = formatPipedriveFields(res.data.data)
          return { ...prvAppData }
        })
      }
      )
      .catch(error => {
        addNotification({
          error: true,
          content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
        })
      })
  }

  useEffect(() => {
    setFieldsList(categoryFields)
  }, [categoryFields, category])


  useEffect(() => {
    if (searchField) {
      setFieldsList(_ =>
        categoryFields
          .filter(field => field.name.includes(searchField))
      )
    } else {
      setFieldsList(categoryFields)
    }
  }, [searchField])

  const selectHookToSetUp = (hook: Hook) => {
    setSelectHook(_ => hook)
  }

  useEffect(() => {
    if (selectHook) {
      const hook = getHook(selectHook.id)
      if (hook) {
        setHookToShow(_ => hook)
      }
    }
  }, [selectHook?.id, appData])

  return (
    <div key={category}>
      <form onSubmit={e => saveParameters(e)}>
        <div className='w2p-instructions'>
          <p>{translate(`Select the different events that will sync Woocommerce and wordpress informations to Pipedrive.`)}</p>
        </div>
        <div className='flex gap-1 w2p-wrap m-b-25 m-t-25'>
          {appData.CONSTANTES.W2P_HOOK_LIST
            .filter(hook => !hook?.disabledFor?.includes(category))
            .map(hook => {
              return <HookSelector key={hook.key} parentHook={hook} selector={selectHookToSetUp} category={category} active={hookToShow?.key === hook.key} />
            }
            )}
        </div>

        {hookToShow && hookToShow.id
          ? <div key={hookToShow.key}>
            {/* <div className='w2p-instructions'>
              <p>{translate(
                `Here you can load general and custom fields from Pipedrive ${category}s\
           to feed them with data from Woocommerce.`)}
                <br />
                {translate("Set the value to assign to the fields during various user events.")}
              </p>
            </div> */}
            {filedsList
              ? <div key={category}>
                <h5 className='m-b-25'>{translate(`Parameter of the event : ${hookToShow.label}`)}</h5>

                <label className='pointer flex items-center m-b-10'>
                  <input
                    type="checkbox"
                    className='m-r-10'
                    onChange={(e) => setOptionHook({
                      ...hookToShow,
                      createActivity: e.target.checked
                    })}
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
                {filedsList.length
                  ? <div className='flex column m-t-25 gap-1'>
                    {/* Priority fields */}
                    {filedsList
                      .filter(field => !field.enabled)
                      .filter(field => priorityFieldsKey[category.toLowerCase()]?.includes(field.key))
                      .map(field =>
                        <PipepdriveField pipedriveFieldId={field.id} key={field.id} relatedHook={hookToShow} priority={true} />
                      )}
                    {/* other fields */}
                    {filedsList
                      .filter(field => !field.enabled)
                      .filter(field => !unusableFieldsKey.includes(field.key))
                      .filter(field => !priorityFieldsKey[category.toLowerCase()]?.includes(field.key))
                      .map(field =>
                        <PipepdriveField pipedriveFieldId={field.id} key={field.id} relatedHook={hookToShow} priority={false} />
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
              {filedsList?.length
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
