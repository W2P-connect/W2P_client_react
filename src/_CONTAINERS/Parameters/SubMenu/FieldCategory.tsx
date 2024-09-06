import React, { useEffect } from 'react'
import { translate } from '../../../translation'
import { useCallPipedriveApi } from '../../../helpers'
import HookSelector from '_COMPONENTS/HOOK/HookSelector/HookSelector'
import { Category, PipedriveField } from 'Types'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { AxiosResponse } from 'axios'
import { observer } from 'mobx-react-lite'
import { pipedriveFieldsStore } from '_STORES/PipedriveFields'
import { hookStore } from '_STORES/Hooks'
import { appDataStore } from '_STORES/AppData'
import HookFieldList from '_COMPONENTS/HOOK/HookField/HookFieldList'


const FieldCategory = ({ category }: { category: Category }) => {


  const callPipedriveApi = useCallPipedriveApi()

  const { addNotification } = useNotification()

  const categoryFields = pipedriveFieldsStore.getCategoryFields(category);

  const selectedHook = hookStore.selectedHookId
    ? hookStore.getHook(hookStore.selectedHookId)
    : null

  useEffect(() => {
    if (category !== selectedHook?.category) {
      hookStore.selectHookId(null)
    }
  }, [category, selectedHook])




  const getCategoryFields = (e: React.FormEvent) => {
    if (hookStore.selectedHookId) {
      callPipedriveApi(`${category}Fields`, null, null, null, e)
        .then((res: AxiosResponse<any, any> | null) => {
          if (!res?.data?.data) {
            throw Error("No data in Pipedrive response")
          }
          const fields: PipedriveField[] = res.data.data.map((field: PipedriveField) => {
            return { ...field as PipedriveField, category: category }
          });
          pipedriveFieldsStore.addPipedriveFields(fields)
          hookStore.updateHookFieldsFromPipedriveFields(fields)
        })

        .catch(error => {
          console.log(error);

          addNotification({
            error: true,
            content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
          })
        })
    }
  }



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

        {selectedHook
          ? <HookFieldList hook={selectedHook} />
          : <h3 className='center m-t-25'>{translate('Select an event to configure it')}</h3>
        }
      </div>

      <form onSubmit={e => getCategoryFields(e)}>
        <button className='light-button m-t-25'>
          {categoryFields?.length
            ? translate('Reload custom fields')
            : translate('Load custom fields')}
        </button>
      </form>

    </div>
  );
};

export default observer(FieldCategory);