import React, { useState, useEffect, useMemo } from 'react'
import { translate } from '../../../translation'
import { updateNestedObject, useCallPipedriveApi } from '../../../helpers'
import Datalist from '_COMPONENTS/FORMS/INPUT/datalist/Datalist'
import HookSelector from '_COMPONENTS/HOOK/HookSelector/HookSelector'
import { Category, Hook, HookField as HookFieldType, PipedriveField } from 'Types'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { AxiosResponse } from 'axios'
import { observer } from 'mobx-react-lite'
import { pipedriveFieldsStore } from '_STORES/PipedriveFields'
import { hookFieldStore } from '_STORES/HookField'
import { hookStore } from '_STORES/Hooks'
import HookField from '_COMPONENTS/HOOK/HookField/HookField'
import { appDataStore } from '_STORES/AppData'
import { toJS } from 'mobx'


const FieldCategory = ({ category }: { category: Category }) => {

  const callPipedriveApi = useCallPipedriveApi()

  const { addNotification } = useNotification()

  const [searchField, setSearchField] = useState<string>("")

  const categoryFields = pipedriveFieldsStore.getCategoryFields(category);

  const filteredPipedriveFieldsList = searchField
    ? categoryFields.filter(field => field.name.includes(searchField))
    : categoryFields;

  const getCategoryFields = (e: React.FormEvent) => {
    if (hookStore.selectedHook) {
      callPipedriveApi(`${category}Fields`, null, null, null, e)
        .then((res: AxiosResponse<any, any> | null) => {
          if (!res?.data?.data) {
            throw Error("No data in Pipedrive response")
          }
          const fields: PipedriveField[] = res.data.data.map((field: PipedriveField) => {
            return { ...field as PipedriveField, category: category }
          });

          pipedriveFieldsStore.addPipedriveFields(fields)

          fields
            .filter(field => pipedriveFieldsStore.isFieldValid(field))
            .forEach(pipedriveField => {
              hookStore.selectedHook && hookFieldStore.getHookFieldFromPipedrive(hookStore.selectedHook.id, pipedriveField.id);
            })
            hookStore.refreshSelectedHook()
        })

        .catch(_ => {
          addNotification({
            error: true,
            content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
          })
        })
    }
  }

  const updateHook = (hookId: string, path: string, value: any) => {
    const hook = hookStore.getHook(hookId);
    if (hook) {
      const updatedHook = updateNestedObject(hook, path, value);
      hookStore.updateHook(hookId, updatedHook);
    }
  };

  console.log("hookStore.selectedHook", toJS(hookStore.selectedHook));


  return (
    <div key={category}>
      <div>
        <div className='w2p-instructions'>
          <p>{translate('Select the different events that will sync Woocommerce and WordPress informations to Pipedrive.')}</p>
        </div>
        <div className='flex gap-1 w2p-wrap m-b-25 m-t-25'>
          {appDataStore.appData.CONSTANTES.W2P_HOOK_LIST
            .filter(hook => !hook?.disabledFor?.includes(category))
            .map(hook => {
              return <HookSelector key={hook.key} preHook={hook} category={category} />;
            })}
        </div>

        {hookStore.selectedHook
          ? <div key={hookStore.selectedHook.id}>
            {filteredPipedriveFieldsList
              ? <div key={category}>
                <h5 className='m-b-25'>{translate(`Parameter of the event : ${hookStore.selectedHook.label}`)}</h5>

                <label className='pointer flex items-center m-b-10'>
                  <input
                    type='checkbox'
                    className='m-r-10'
                    onChange={e => hookStore.selectedHook && updateHook(hookStore.selectedHook.id, 'option.createActivity', e.target.checked)}
                    checked={hookStore.selectedHook.option.createActivity ?? false}
                  />
                  <div>
                    {translate('Add an activity when this event is triggered.')}
                    <div className='subtext'>
                      {translate(
                        `An activity specifying the updated fields and the triggered event will be automatically added to the ${hookStore.selectedHook.category} on Pipedrive.`
                      )}
                    </div>
                  </div>
                </label>

                <div className='m-b-25'>
                  <Datalist
                    label={translate('Search a field')}
                    placeholder={translate('Name, owner, email,...')}
                    items={filteredPipedriveFieldsList.map(field => ({ value: field.name, id: field.id }))}
                    value={searchField}
                    onInput={setSearchField}
                  />
                </div>
                {hookStore.selectedHook.fields.length ?
                  <div className='flex column m-t-25 gap-1'>
                    {/* Priority fields */}
                    {hookStore.selectedHook.fields
                      .filter(hookfield => hookFieldStore.isImportant(hookfield))
                      .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                    {/* other fields */}
                    {hookStore.selectedHook.fields
                      .filter(hookfield => hookFieldStore.isImportant(hookfield))
                      .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                  </div>
                  : <p>
                    {searchField
                      ? translate('There is no field to show.')
                      : translate("You haven't loaded custom fields yet.")}
                  </p>
                }
              </div>
              : null
            }
            <button type='button' onClick={e => getCategoryFields(e)} className='light-button m-t-25'>
              {categoryFields?.length
                ? translate('Reload custom fields')
                : translate('Load custom fields')}
            </button>
          </div>
          : <h3 className='center m-t-25'>{translate('Select an event to configure it')}</h3>
        }
      </div>
    </div>
  );
};

export default observer(FieldCategory);