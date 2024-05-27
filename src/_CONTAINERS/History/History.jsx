import React, { useState, useEffect, useContext } from 'react'
import { useCallApi, removeEmptyProperties } from '../../helpers'
import { AppDataContext } from '../../_CONTEXT/appDataContext'
import Loader from '../../_COMPONENTS/GENERAL/Loader/Loader'
import Query from '../../_COMPONENTS/Query/Query'
import { translate } from '../../translation'
import Pagination from '../../_COMPONENTS/NAVIGATION/Pagination/Pagination'

export default function History() {

  const callApi = useCallApi()
  const { appData, fieldsCategory } = useContext(AppDataContext)
  const [queries, setQueries] = useState(null)
  const [parameters, setParameters] = useState({
    state: "",
    category: "",
    method: "",
    hook: "",
  })

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_pages: null,
  })

  useEffect(() => {
    const controller = new AbortController();

    setQueries(_ => null)

    callApi(
      `${appData.w2p_client_rest_url}/queries`,
      { method: "get" },
      controller.signal,
      { ...removeEmptyProperties(parameters), ...pagination },
    )
      .then(res => {
        setQueries(_ => res.data.data)
        setPagination(prv => ({ ...prv, ...res.data.pagination }))
      })
      .catch(error => console.log(error))

    return () => {
      controller.abort()
    }

  }, [parameters, pagination.page])


  console.log("queries", queries);
  console.log("parameters", parameters);

  return (
    <div>
      <div className='flex gap-1 m-b-25'>
        <select
          value={parameters.hook}
          onChange={e => setParameters(prv => ({ ...prv, hook: e.target.value }))}>
          <option value={""}>{translate("Filter by hook")}</option>
          {appData.CONSTANTES.W2P_HOOK_LIST.map(hook =>
            <option key={hook.key} value={hook.label}>{hook.label}</option>
          )}
        </select>
        <select
          value={parameters.category}
          onChange={e => setParameters(prv => ({ ...prv, category: e.target.value }))}>
          <option value={""}>{translate("Filter by category")}</option>
          {fieldsCategory.map(category =>
            <option key={category.slug} value={category.slug}>{category.slug}</option>
          )}
        </select>
        <select
          value={parameters.state}
          onChange={e => setParameters(prv => ({ ...prv, state: e.target.value }))}>
          <option value={""}>{translate("Filter by state")}</option>
          {appData.CONSTANTES.W2P_AVAIBLE_STATES.map(state =>
            <option key={state} value={state}>{state}</option>
          )}
        </select>
      </div>
      {queries
        ? <div style={{ overflowX: 'auto' }}>
          {queries.length
            ? <div>
              <div className='flex column'>
                <div className='w2p-query w2p-query-main-datas header-grid'>
                  <div className='strong-1' >{translate("Action")}</div>
                  <div className='strong-1'>{translate("Hook")}</div>
                  <div className='strong-1'>{translate("Method")}</div>
                  <div className='strong-1'>{translate("Category")}</div>
                  <div className='strong-1'>{translate("Source id")}</div>
                  <div className='strong-1'>{translate("Pipedrive id")}</div>
                  <div className='strong-1'>{translate("State")}</div>
                </div>
                {
                  queries.map((query, index) => {
                    return <Query key={index} parentQuery={query} />
                  })
                }
              </div>
              <div className='m-t-10'>
                <Pagination
                  currentPage={pagination.page}
                  totalPage={pagination.total_pages ?? null}
                  setCurrentPage={value => setPagination(prv => ({ ...prv, page: value }))}
                />
              </div>
            </div>
            : <h5 className='center'>{translate("There is no history to show.")}</h5>
          }
        </div>
        : <Loader className={'m-t-50'} />
      }
    </div>
  )
}
