import { useEffect, useState, useContext } from 'react'
import './query.css'
import OpenableComponent from '../GENERAL/OpenableComponent/OpenableComponent'
import { translate } from '../../translation'
import { useCallApi } from '../../helpers'
import RenderIf from '../GENERAL/RenderIf'
import { Query as QueryType, QueryState } from 'Types'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { appDataStore } from '_STORES/AppData'

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
            <div>{query.source_id}</div>
            <div>{query.target_id}</div>
            <div className={`w2p-query-label
                ${query.state === "DONE" ? 'success-label' : ''} 
                ${query.state === "SENDED" ? 'warning-label' : ''} 
                ${query.state === "TODO" ? 'warning-label' : ''} 
                ${query.state === "ERROR" ? 'error-label' : ''} 
                ${query.state === "INVALID" ? 'error-label' : ''} 
            `}>
              <div>{query.state}</div>
            </div>
          </div>
          <OpenableComponent stateOpen={open} label={false}>
            <div className={`w2p-query-details`}>
              <div className='first-query-details-sexion'>
                <div className='w2p-query-timelaps flex-1'>
                  <div>
                    <div className='strong-1'>{translate("Created at")}</div>
                    <div>{new Date(query.additional_datas?.created_at).toLocaleString()}</div>
                  </div>
                  <RenderIf condition={!!query.additional_datas?.sended_at}>
                    <div>
                      <div className='strong-1'>{translate("Sended at")}</div>
                      <div>{new Date(query.additional_datas?.sended_at ?? '').toLocaleString()}</div>
                    </div>
                  </RenderIf>
                  <RenderIf condition={!!query.additional_datas?.last_error}>
                    <div>
                      {/* <div className='strong-1'>{translate("Error occurred during the sending of the request")}</div> */}
                      <div className='text-red-700'>{query.additional_datas.last_error}</div>
                    </div>
                  </RenderIf>
                </div>
                {/* <div className='w2p-query-origin flex-1' >
                <div className='strong-1'>{translate("Data")}</div>
                <div>
                  {query.additional_datas.last_error}
                </div>
              </div> */}
                <div className='w2p-query-data flex-1' >
                  <div className='strong-1'>{translate("Data for Pipedrive")}</div>
                  {
                    Object.entries(query.payload.data).length
                      ? Object.entries(query.payload.data).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                        </div>
                      ))
                      : <div>{translate('No valid data to send.')}</div>
                  }
                  <div>
                    {query.additional_datas.last_error}
                  </div>
                </div>
              </div>
              <RenderIf condition={!!query.additional_datas?.traceback && Array.isArray(query.additional_datas.traceback)}>
                <div>
                  <div className='strong-1'>{translate("Trace back")}</div>
                  {query.additional_datas.traceback
                    ?.sort((a, b) => {
                      const parseMicrotime = (time: string): number => {
                        const parts = time.split(" ");
                        const seconds = parseFloat(parts[1]);
                        const microseconds = parseFloat(parts[0]);
                        return seconds + microseconds;
                      };

                      const timeA = parseMicrotime(a.time);
                      const timeB = parseMicrotime(b.time);

                      return timeA - timeB;
                    })
                    .map((trace, index) => {
                      var parts = trace.time?.split(" ") ?? null;
                      var seconds = parts ? parseFloat(parts[1]) : null;

                      return <div key={index} className='m-b-10'>
                        {seconds
                          ? <div className='strong-1'>{new Date(seconds * 1000).toLocaleString()} : {translate(trace.step)}</div>
                          : null
                        }
                        <div>
                          {trace.success ? "[Success]" : "[Error]"} {trace.message}
                        </div>
                      </div>
                    }
                    )
                  }
                </div>
              </RenderIf>
            </div>

          </OpenableComponent>
        </div>
      ) : null}
    </form>
  );

}