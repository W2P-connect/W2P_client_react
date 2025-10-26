import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import OpenableComponent from '_COMPONENTS/GENERAL/OpenableComponent/OpenableComponent'
import RenderIf from '_COMPONENTS/GENERAL/RenderIf'
import { useNotification } from '_CONTEXT/hook/contextHook'
import { appDataStore } from '_STORES/AppData'
import { classNames, useCallApi } from 'utils/helpers'
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
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);

        // Convertir FormData en objet
        const formValues: { [key: string]: any } = {};
        formData.forEach((value, key) => {
            formValues[key] = value;
        });
        formValues.direct_to_pipedrive = true;

        callApi(
            `${appDataStore.appData.w2pcifw_client_rest_url}/order/${orderState.id}/send`,
            { method: "PUT" },
            null,
            formValues,
            e
        )
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
                            setOpen(prev => !prev);
                        }
                    }}>
                    <div className='w2p-order-main-datas'>
                        <div>{getActionButton(orderState.state)}</div>
                        <div>
                            <div>{new Date(orderState.date_created.date).toLocaleDateString()}</div>
                            <div className='text-gray-600 text-sm'>{new Date(orderState.date_created.date).toLocaleTimeString()}</div>
                        </div>
                        <div>{orderState.id}</div>
                        <div>
                            <div>
                                {orderState.customer?.first_name || orderState.billing?.first_name} {orderState.customer?.last_name || orderState.billing?.last_name}
                            </div>
                            <div className='text-gray-600 text-sm'>
                                {orderState.customer?.user_email || orderState.billing?.email}
                            </div>
                        </div>

                        {lastDoneQuery?.target_id
                            ? <a
                                target='_blanck'
                                className='flex gap-[5px] underline'
                                href={`https://${appDataStore.appData.parameters.pipedrive.company_domain}.pipedrive.com/deal/${lastDoneQuery.target_id}`}
                            >
                                {orderState.deal_id}
                                <ArrowTopRightOnSquareIcon width={'15'} />
                            </a>
                            : <div></div>
                        }

                        <div className='flex justify-between'>
                            <div className={`w2p-query-label
                            ${orderState.state === "SYNCED" ? 'success-label' : ''} 
                            ${orderState.state === "SENDED" ? 'warning-label' : ''} 
                            ${orderState.state === "NOT SYNCED" ? 'warning-label' : ''} 
                            ${orderState.state === "NOT READY" ? 'warning-label' : ''} 
                            ${orderState.state === "ERROR" ? 'error-label' : ''}
                            ${orderState.state === "CANCELED" ? 'error-label' : ''}
                            `}>
                                <div>{orderState.state}</div>
                            </div>
                            <div className={classNames(open ? "rotate-90" : "rotate-0", 'transition')}><ChevronRightIcon width={'18px'} /></div>
                        </div>
                    </div>
                    <OpenableComponent stateOpen={open} label={false}>
                        <div className='mt-2 p-2' onClick={(e) => e.stopPropagation()}>
                            <div className="bg-cover bg-center shadow-md mt-2 px-3 py-2 rounded-md"
                                style={{ backgroundImage: `url('${appDataStore.appData.build_url}/images/bg-grey.jpg')` }}
                            >
                                {query
                                    ? <>
                                        <div className='pb-2 border-gray-200 border-b font-semibold text-center'>
                                            {orderState.state === "SYNCED"
                                                ? "Last synced data"
                                                : "Data to sync"
                                            }
                                        </div>
                                        <div className='flex'>
                                            <div className='flex-1'>
                                                <div className='mb-1 font-semibold'>{translate("Data for Pipedrive")}</div>
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
                                                <div className='mt-1 mb-1 pl-2 border-l'>
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
                                                                    <div className="text-gray-500 italic">
                                                                        Comments: {product.comments}
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
                                                <div className='mt-4 pb-2 border-gray-200 border-b font-semibold text-center'>Last synced data</div>
                                                <div className='flex'>
                                                    <div className='flex-1'>
                                                        <div className='mb-1 font-semibold'>{translate("Data for Pipedrive")}</div>
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
                                                        <div className='mt-1 mb-1 pl-2 border-l'>
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
                                                                            <div className="text-gray-500 italic">
                                                                                Comments: {product.comments}
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
                                    : <>
                                        <div className='font-semibold text-center'>
                                            No event has been triggered for this order yet (this may be because it was created before you installed W2P, or because no events are configured for orders). You can still send it to Pipedrive based on its current status.
                                        </div>
                                        <div className='flex justify-center mt-3'>
                                            <input name='create-query' defaultValue={"1"} hidden />
                                            <button
                                                className='bg-white'
                                                onClick={e => e.stopPropagation()} // Stop propagation here
                                            >
                                                {translate("Send to Pipedrive (based on current status)")}
                                            </button>
                                        </div>
                                    </>
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
