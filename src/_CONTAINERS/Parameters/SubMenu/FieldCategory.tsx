import React, { useState, useEffect } from 'react'
import { translate } from '../../../translation'
import { updateNestedObject, useCallPipedriveApi } from '../../../helpers'
import Datalist from '_COMPONENTS/FORMS/INPUT/datalist/Datalist'
import HookSelector from '_COMPONENTS/HOOK/HookSelector/HookSelector'
import { Category, Hook, PipedriveField } from 'Types'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { AxiosResponse } from 'axios'
import { observer } from 'mobx-react-lite'
import { pipedriveFieldsStore } from '_STORES/PipedriveFields'
import { hookFieldStore } from '_STORES/HookField'
import { hookStore } from '_STORES/Hooks'
import HookField from '_COMPONENTS/HOOK/HookField/HookField'
import { appDataStore } from '_STORES/AppData'


const FieldCategory = ({ category }: { category: Category }) => {

  const callPipedriveApi = useCallPipedriveApi()

  const { addNotification } = useNotification()

  const [searchField, setSearchField] = useState<string>("")

  const getCategoryFields = (e: React.FormEvent) => {
    callPipedriveApi(`${category}Fields`, null, null, null, e)
      .then((res: AxiosResponse<any, any> | null) => {
        if (!res?.data?.data) {
          throw Error("No data in Pipedrive response")
        }
        const fields = res.data.data.map((field: any) => {
          return { ...field as PipedriveField, category: category }
        });

        pipedriveFieldsStore.addPipedriveFields(fields)
      })

      .catch(_ => {
        addNotification({
          error: true,
          content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
        })
      })
  }

  const categoryFields = pipedriveFieldsStore.getCategoryFields(category);

  const filteredPipedriveFieldsList = searchField
    ? categoryFields.filter(field => field.name.includes(searchField))
    : categoryFields;

  const updateHook = (hookId: string, path: string, value: any) => {
    const hook = hookStore.getHook(hookId);
    if (hook) {
      const updatedHook = updateNestedObject(hook, path, value);
      hookStore.updateHook(hookId, updatedHook);
    }
  };

  const selectedHook: Hook | null = hookStore.selectedHookId
    ? hookStore.getHook(hookStore.selectedHookId)
    : null;

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

        {selectedHook ? (
          <div key={selectedHook.id}>
            {filteredPipedriveFieldsList ? (
              <div key={category}>
                <h5 className='m-b-25'>{translate(`Parameter of the event : ${selectedHook.label}`)}</h5>

                <label className='pointer flex items-center m-b-10'>
                  <input
                    type='checkbox'
                    className='m-r-10'
                    onChange={e => updateHook(selectedHook.id, 'option.createActivity', e.target.checked)}
                    checked={selectedHook.option.createActivity ?? false}
                  />
                  <div>
                    {translate('Add an activity when this event is triggered.')}
                    <div className='subtext'>
                      {translate(
                        `An activity specifying the updated fields and the triggered event will be automatically added to the ${selectedHook.category} on Pipedrive.`
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
                {filteredPipedriveFieldsList.length ?
                  <div className='flex column m-t-25 gap-1'>
                    {/* Priority fields */}
                    {filteredPipedriveFieldsList
                      .filter(field => pipedriveFieldsStore.isFieldValid(field))
                      .map(pipedriveField => {
                        const hook = hookFieldStore.getHookFieldFromPipedrive(selectedHook.id, pipedriveField.id);
                        console.log("hook", hook);
                        return hook
                      })
                      .filter(
                        (hookfield): hookfield is NonNullable<typeof hookfield> =>
                          hookfield !== null && hookFieldStore.isImportant(hookfield)
                      )
                      .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                    {/* other fields */}
                    {filteredPipedriveFieldsList
                      .filter(field => pipedriveFieldsStore.isFieldValid(field))
                      .map(pipedriveField => {
                        return hookFieldStore.getHookFieldFromPipedrive(selectedHook.id, pipedriveField.id);
                      })
                      .filter(
                        (hookfield): hookfield is NonNullable<typeof hookfield> =>
                          hookfield !== null && !hookFieldStore.isImportant(hookfield)
                      )
                      .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                  </div>
                  : <p>
                    {searchField
                      ? translate('There is no field to show.')
                      : translate("You haven't loaded custom fields yet.")}
                  </p>
                }
              </div>
            ) : null}
            <button type='button' onClick={e => getCategoryFields(e)} className='light-button m-t-25'>
              {categoryFields?.length
                ? translate('Reload custom fields')
                : translate('Load custom fields')}
            </button>
          </div>
        ) : (
          <h3 className='center m-t-25'>{translate('Select an event to configure it')}</h3>
        )}
      </div>
    </div>
  );
};

export default observer(FieldCategory);