import { useState } from 'react'
import './query.css'
import OpenableComponent from '../GENERAL/OpenableComponent/OpenableComponent'
import { translate } from '../../translation'
import { useCallApi } from '../../helpers'
import RenderIf from '../GENERAL/RenderIf'
import { Query as QueryType, QueryState } from 'Types'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { appDataStore } from '_STORES/AppData'
import QueryDetails from './QueryDetails'

export default function Query({ parentQuery }: { parentQuery: QueryType }) {

  const callApi = useCallApi()
  const { addNotification } = useNotification()

  const [query, setQuery] = useState<QueryType>(parentQuery)
  const [open, setOpen] = useState<boolean>(false)

  // useEffect(() => {
  //   setQuery(_ => parentQuery)
  // }, [])


  const getActionButton = (state: QueryState) => {
    if (state === "TODO" || state === 'ERROR') {
      return <button onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {
          state === "TODO"
            ? translate("Send")
            : translate("Retry")
        }
      </button>
    }
  }

  const sendQuery = (e: React.FormEvent) => {
    callApi(`
    ${appDataStore.appData.w2p_client_rest_url}/query/${query.id}/send`,
      { method: "PUT" },
      null,
      { direct_to_pipedrive: true },
      e)
      .then(res => {
        if (res?.data.data) {
          setQuery(_ => res.data.data)
          setOpen(_ => true)
          addNotification({
            error: res.data.data.success,
            content: res.data.message
          })
        } else {
          throw new Error("wrong API response answer")
        }
      })
      .catch(error => {
        error?.response?.data?.data && setQuery(_ => error?.response?.data?.data)
        console.log(error);
        addNotification({
          error: error?.response?.data?.success,
          content: error?.response?.data?.message
        })
      })
  }

  return (
    <form onSubmit={e => sendQuery(e)}>
      {query ? (
        <div
          className={`w2p-query pointer`}
          onClick={(e: React.MouseEvent) => {
            if (e.currentTarget.tagName.toUpperCase() !== 'BUTTON') {
              console.log(e.currentTarget);
              setOpen(prev => !prev);
            }
          }}>
          <div className='w2p-query-main-datas'>
            <div>{getActionButton(query.state)}</div>
            <div>{query.hook}</div>
            <div>{query.method}</div>
            <div>{query.category}</div>
            <div>{`${query.source} (${query.source_id})`}</div>
            <div>{query.target_id}</div>
            <div className={`w2p-query-label
                ${query.state === "DONE" ? 'success-label' : ''} 
                ${query.state === "SENDED" ? 'warning-label' : ''} 
                ${query.state === "TODO" ? 'warning-label' : ''} 
                ${query.state === "ERROR" ? 'error-label' : ''} 
                ${query.state === "INVALID" ? 'error-label' : ''} 
                ${query.state === "CANCELED" ? 'error-label' : ''} 
            `}>
              <div>{query.state}</div>
            </div>
          </div>
          <OpenableComponent stateOpen={open} label={false}>
            <div className='mt-2 p-2'>
              <div className="shadow-md py-2 px-3 rounded-md mt-2 bg-cover bg-center"
                style={{ backgroundImage: `url('${appDataStore.appData.build_url}/images/bg-grey.jpg')` }}
              >
                <QueryDetails query={query} />
              </div>
            </div>
          </OpenableComponent>
        </div>
      ) : null}
    </form>
  );

}