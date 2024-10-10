import React, { useState, useEffect } from 'react'
import { appDataStore } from '_STORES/AppData'
import { useCallApi, removeEmptyProperties } from '../../helpers'
import Pagination from '_COMPONENTS/NAVIGATION/Pagination/Pagination';
import Loader from '_COMPONENTS/GENERAL/Loader/Loader';
import Order from './Order';
import { Order as OrderType } from 'Types'
import { translate } from 'translation';
import './order.css'

export default function Orders() {

  const callApi = useCallApi()
  const [orders, setOrders] = useState<OrderType[] | null>(null);


  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_pages: null,
  })

  useEffect(() => {
    const controller = new AbortController();
    setOrders(_ => null)

    callApi(
      `${appDataStore.appData.w2p_client_rest_url}/orders`,
      { method: "get" },
      controller.signal,
      pagination,
    )
      .then(res => {
        if (res) {
          setOrders(_ => res.data.data)
          setPagination(prv => ({ ...prv, ...res.data.pagination }))
        }
      })
      .catch(error => console.log(error))

    return () => {
      controller.abort()
    }

  }, [pagination.page])

  useEffect(() => {
    console.log(orders);
  }, [orders])

  return (
    <>

      {orders
        ? <div style={{ overflowX: 'auto' }}>
          {orders.length
            ? <div>
              <div className='flex column'>
                <div className='w2p-order w2p-order-main-datas header-grid'>
                  <div className='strong-1' >{translate("Action")}</div>
                  <div className='strong-1'>{translate("Date")}</div>
                  <div className='strong-1'>{translate("Order id")}</div>
                  <div className='strong-1'>{translate("Customer")}</div>
                  <div className='strong-1'>{translate("Deal id")}</div>
                  <div className='strong-1'>{translate("State")}</div>
                </div>
                {
                  orders.map((order, index) => {
                    return <Order key={index} order={order} />
                  })
                }
              </div>
              <div className='m-t-10'>
                <Pagination
                  currentPage={pagination.page}
                  totalPage={pagination.total_pages ?? 0}
                  setCurrentPage={value => setPagination(prv => ({ ...prv, page: value }))}
                />
              </div>
            </div>
            : <h5 className='center'>{translate("There is no history to show.")}</h5>
          }
        </div>
        : <Loader className={'m-t-50'} />
      }
    </>


  )
}
