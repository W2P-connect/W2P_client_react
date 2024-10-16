import OpenableComponent from '_COMPONENTS/GENERAL/OpenableComponent/OpenableComponent'
import RenderIf from '_COMPONENTS/GENERAL/RenderIf'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { appDataStore } from '_STORES/AppData'
import { useCallApi } from 'helpers'
import React, { useState } from 'react'
import { translate } from 'translation'
import { OrderState, Order as OrderType } from 'Types'

export default function Order({ order }: { order: OrderType }) {
    const callApi = useCallApi()
    const { addNotification } = useNotification()

    const [orderState, setOrderState] = useState<OrderType>(order)
    const [open, setOpen] = useState<boolean>(false)


    const getActionButton = (state: OrderState) => {
        if (state === "NOT SYNCED" || state === 'ERROR') {
            return <button onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                {
                    state === "NOT SYNCED"
                        ? translate("Send")
                        : translate("Retry")
                }
            </button>
        }
    }

    const sendOrder = (e: React.FormEvent) => {
        callApi(`
      ${appDataStore.appData.w2p_client_rest_url}/order/${orderState.id}/send`,
            { method: "PUT" },
            null,
            { direct_to_pipedrive: true },
            e)
            .then(res => {
                if (res?.data.data) {
                    setOrderState(_ => res.data.data)
                    setOpen(_ => true)
                    addNotification({
                        error: !res.data.success,
                        content: res.data.message
                    })
                } else {
                    throw new Error("wrong API response answer")
                }
            })
            .catch(error => {
                error?.response?.data?.data && setOrderState(_ => error?.response?.data?.data)
                console.log(error);
                addNotification({
                    error: !error?.response?.data?.success,
                    content: error?.response?.data?.message
                })
            })
    }

    const query = orderState.queries.length
        ? orderState.queries[0]
        : null

    const lastDoneQuery = orderState.queries.find(query => query.state === "DONE")

    return (
        <form onSubmit={e => sendOrder(e)}>
            {orderState ? (
                <div
                    className={`w2p-order pointer`}
                    onClick={(e: React.MouseEvent) => {
                        if (e.currentTarget.tagName.toUpperCase() !== 'BUTTON') {
                            console.log(e.currentTarget);
                            setOpen(prev => !prev);
                        }
                    }}>
                    <div className='w2p-order-main-datas'>
                        <div>{getActionButton(orderState.state)}</div>
                        <div>
                            <div>{new Date(orderState.date_created.date).toLocaleDateString()}</div>
                            <div className='text-sm text-gray-600'>{new Date(orderState.date_created.date).toLocaleTimeString()}</div>
                        </div>
                        <div>{orderState.id}</div>
                        <div>
                            <div>{orderState.customer?.first_name} {orderState.customer?.last_name}</div>
                            <div className='text-sm text-gray-600'>{orderState.customer?.user_email}</div>
                        </div>
                        <div>{`${orderState.deal_id}`}</div>
                        <div className={`w2p-query-label
                            ${orderState.state === "SYNCED" ? 'success-label' : ''} 
                            ${orderState.state === "NOT SYNCED" ? 'warning-label' : ''} 
                            ${orderState.state === "ERROR" ? 'error-label' : ''} 
                        `}>
                            <div>{orderState.state}</div>
                        </div>
                    </div>
                    <OpenableComponent stateOpen={open} label={false}>
                        <div className='mt-2 p-2'>
                            <div className="shadow-md py-2 px-3 rounded-md mt-2 bg-cover bg-center"
                                style={{ backgroundImage: "url('/images/bg-grey.jpg')" }}
                            >
                                {query
                                    ? <>
                                        <div className='text-center pb-2 font-semibold border-b border-gray-200'>
                                            {orderState.state === "SYNCED"
                                                ? "Last synced data"
                                                : "Data to sync"
                                            }
                                        </div>
                                        <div className='flex'>
                                            <div className='flex-1'>
                                                <div className='font-semibold mb-1'>{translate("Data for Pipedrive")}</div>
                                                {
                                                    query && query.payload.data.length
                                                        ? query.payload.data.map((data, index) => (
                                                            <div key={index}>
                                                                <span className='font-medium'>{data.name}:</span> {typeof data.value === 'object' ? JSON.stringify(data.value) : data.value}
                                                            </div>
                                                        ))
                                                        : <div>{translate('No valid data to send.')}</div>
                                                }
                                            </div>
                                            <div className='flex-1'>
                                                <div className='mb-1 mt-1 pl-2 border-l'>
                                                    {query?.payload.products?.length
                                                        ? query.payload.products.map((product, idx) => (

                                                            <div key={idx} className="mb-1">
                                                                <strong className="font-semibold">{product.name}:</strong>
                                                                <div>
                                                                    <span className="text-gray-600">
                                                                        Quantity: <span className="font-semibold">{product.quantity}</span>
                                                                    </span>
                                                                    <span className="ml-4 text-gray-600">
                                                                        Price: <span className="font-semibold">{(product.item_price * (1 - ((product.discount ?? 0) / 100))).toFixed(2)}<span dangerouslySetInnerHTML={{ __html: product.currency_symbol }} /></span>
                                                                    </span>
                                                                </div>
                                                                <RenderIf condition={!!product.comments}>
                                                                    <div className="italic text-gray-500">
                                                                        Commentaires: {product.comments}
                                                                    </div>
                                                                </RenderIf>
                                                            </div>
                                                        ))
                                                        : <div>{translate('No products to send.')}</div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <RenderIf condition={!!lastDoneQuery && orderState.state !== "SYNCED"} >
                                            <>
                                                <div className='text-center pb-2 mt-4 font-semibold border-b border-gray-200'>Last synced data</div>
                                                <div className='flex'>
                                                    <div className='flex-1'>
                                                        <div className='font-semibold mb-1'>{translate("Data for Pipedrive")}</div>
                                                        {
                                                            lastDoneQuery && lastDoneQuery.payload.data.length
                                                                ? lastDoneQuery.payload.data.map((data, index) => (
                                                                    <div key={index}>
                                                                        <span className='font-medium'>{data.name}:</span> {typeof data.value === 'object' ? JSON.stringify(data.value) : data.value}
                                                                    </div>
                                                                ))
                                                                : <div>{translate('No valid data to send.')}</div>
                                                        }
                                                    </div>
                                                    <div className='flex-1'>
                                                        <div className='mb-1 mt-1 pl-2 border-l'>
                                                            {lastDoneQuery?.payload.products?.length
                                                                ? lastDoneQuery.payload.products.map((product, idx) => (

                                                                    <div key={idx} className="mb-1">
                                                                        <strong className="font-semibold">{product.name}:</strong>
                                                                        <div>
                                                                            <span className="text-gray-600">
                                                                                Quantity: <span className="font-semibold">{product.quantity}</span>
                                                                            </span>
                                                                            <span className="ml-4 text-gray-600">
                                                                                Price: <span className="font-semibold">{(product.item_price * (1 - ((product.discount ?? 0) / 100))).toFixed(2)}<span dangerouslySetInnerHTML={{ __html: product.currency_symbol }} /></span>
                                                                            </span>
                                                                        </div>
                                                                        <RenderIf condition={!!product.comments}>
                                                                            <div className="italic text-gray-500">
                                                                                Commentaires: {product.comments}
                                                                            </div>
                                                                        </RenderIf>
                                                                    </div>
                                                                ))
                                                                : <div>{translate('No products to send.')}</div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        </RenderIf>
                                    </>
                                    : <div className='text-center font-semibold'>
                                        None of the events you've set up for the deals have been triggered for this order yet. Therefore, no data can be sent to Pipedrive.
                                    </div>
                                }
                            </div>
                        </div>
                    </OpenableComponent>
                </div>
            ) : null
            }
        </form >
    );

}
