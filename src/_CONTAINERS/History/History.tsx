import { useState, useEffect, useRef } from 'react'
import { useCallApi, removeEmptyProperties } from '../../helpers'
import Loader from '../../_COMPONENTS/GENERAL/Loader/Loader'
import Query from '../../_COMPONENTS/Query/Query'
import { translate } from '../../translation'
import Pagination from '../../_COMPONENTS/NAVIGATION/Pagination/Pagination'
import { appDataStore } from '_STORES/AppData'
import { Category, Query as QueryType } from 'Types'
import Input from '_COMPONENTS/FORMS/INPUT/input/Input'

export default function History() {

  const callApi = useCallApi()

  const [queries, setQueries] = useState<QueryType[] | null>(null)

  const [parameters, setParameters] = useState({
    state: "",
    category: "" as Category | "",
    method: "",
    hook: "",
    source: "",
    source_id: ""
  })

  const [parametersHasBeenUpdated, setParametersHasBeenUpdated] = useState(false)

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_pages: null,
    delay: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current)
    const controller = new AbortController();

    timeoutRef.current = setTimeout(() => {
      setQueries(_ => null)

      callApi(
        `${appDataStore.appData.W2PCIFW_client_rest_url}/queries`,
        { method: "get" },
        controller.signal,
        { ...removeEmptyProperties(parameters), ...pagination, time: new Date().getTime() },
      )
        .then(res => {
          if (res) {
            setQueries(_ => res.data.data)
            setPagination(prv => ({ ...prv, ...res.data.pagination }))
          }
        })
        .catch(error => console.log(error))
    }, pagination.delay ? 600 : 0)

    return () => {
      controller.abort()
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }

  }, [parametersHasBeenUpdated, pagination.page])

  useEffect(() => {
    setPagination(prv => ({ ...prv, page: 1 }))
    setParametersHasBeenUpdated(prv => !prv)
  }, [parameters])

  const fieldsCategory: Category[] = ["deal", "organization", "person"]

  return (
    <div>
      <div className='flex justify-between gap-2 mb-8'>
        <div className='flex gap-1'>
          <select
            value={parameters.hook}
            onChange={e => setParameters(prv => ({ ...prv, hook: e.target.value }))}>
            <option value={""}>{translate("All hooks")}</option>
            {appDataStore.appData.CONSTANTES.W2PCIFW_HOOK_LIST.map(hook =>
              <option key={hook.key} value={hook.label}>{hook.label}</option>
            )}
          </select>
          <select
            value={parameters.category}
            onChange={e => setParameters(prv => ({ ...prv, category: e.target.value as Category }))}>
            <option value={""}>{translate("All categories")}</option>
            {fieldsCategory.map(category =>
              <option key={category} value={category}>{category}</option>
            )}
          </select>
          <select
            value={parameters.state}
            onChange={e => setParameters(prv => ({ ...prv, state: e.target.value }))}>
            <option value={""}>{translate("All states")}</option>
            {appDataStore.appData.CONSTANTES.W2PCIFW_AVAIBLE_STATES.map(state =>
              <option key={state} value={state}>{state}</option>
            )}
          </select>
        </div>
        <div className='flex gap-1'>
          <select
            value={parameters.source}
            onChange={e => setParameters(prv => ({ ...prv, source: e.target.value }))}>
            <option value={""}>{translate("All sources")}</option>
            {appDataStore.appData.CONSTANTES.W2PCIFW_HOOK_SOURCES.map(source =>
              <option key={source} value={source}>{source}</option>
            )}
          </select>
          <Input
            value={parameters.source_id}
            placeholder={`${parameters.source || 'user, order or product'} id`}
            onInput={(value: string) => setParameters(prv => ({ ...prv, source_id: value }))}>
          </Input>
        </div>
      </div>
      {queries
        ? <div style={{ overflowX: 'auto' }}>
          {queries.length
            ? <div>
              <div className='flex column'>
                <div className='header-grid w2p-query w2p-query-main-datas'>
                  <div className='strong-1' >{translate("Action")}</div>
                  <div className='strong-1'>{translate("Hook")}</div>
                  <div className='strong-1'>{translate("Category")}</div>
                  <div className='strong-1'>{translate("Source")}</div>
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
                  totalPage={pagination.total_pages ?? 0}
                  setCurrentPage={(value, delay) => {
                    setPagination(prv => ({ ...prv, page: value, delay: delay }))
                  }}
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
