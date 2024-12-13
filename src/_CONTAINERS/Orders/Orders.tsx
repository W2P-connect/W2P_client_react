import { useState, useEffect, useRef } from 'react'
import { appDataStore } from '_STORES/AppData'
import { useCallApi } from '../../helpers'
import Pagination from '_COMPONENTS/NAVIGATION/Pagination/Pagination';
import Loader from '_COMPONENTS/GENERAL/Loader/Loader';
import Order from './Order';
import { Order as OrderType } from 'Types'
import { translate } from 'translation';
import './order.css'
import Input from '_COMPONENTS/FORMS/INPUT/input/Input';

export default function Orders() {

  const callApi = useCallApi()

  const [orders, setOrders] = useState<OrderType[] | null>(null);
  const [orderId, setOrderId] = useState<string>("");
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
      setOrders(_ => null)
      callApi(
        `${appDataStore.appData.w2p_client_rest_url}/orders`,
        { method: "get" },
        controller.signal,
        { ...pagination, orderId: orderId, time: new Date().getTime() },
      )
        .then(res => {
          if (res) {
            setOrders(_ => res.data.data)
            setPagination(prv => ({ ...prv, ...res.data.pagination }))
          }
        })
        .catch(error => console.log(error))
    }, pagination.delay ? 600 : 0)

    return () => {
      controller.abort()
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }

  }, [pagination.page, orderId])

  useEffect(() => {
    console.log(orders);
  }, [orders])

  return (
    <>
      <div className='mb-2'>
        <Input
          value={orderId}
          label='Order id'
          placeholder={`7235`}
          onInput={(value: string) => setOrderId(_ => (value))}>
        </Input>
      </div>
      {orders
        ? <div style={{ overflowX: 'auto' }}>
          {orders.length
            ? <div>
              <div className='flex column'>
                <div className='w2p-order-main-datas header-grid w2p-order'>
                  <div className='strong-1' >{translate("Action")}</div>
                  <div className='strong-1'>{translate("Date")}</div>
                  <div className='strong-1'>{translate("Order id")}</div>
                  <div className='strong-1'>{translate("Customer")}</div>
                  <div className='strong-1'>{translate("Deal id")}</div>
                  <div className='strong-1'>{translate("Sync state")}</div>
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
                  setCurrentPage={(value, delay) => {
                    setPagination(prv => ({ ...prv, page: value, delay: delay }))
                  }}
                />
              </div>
            </div>
            : <h5 className='center'>{translate("There is no order to show.")}</h5>
          }
        </div>
        : <Loader className={'m-t-50'} />
      }
    </>


  )
}
