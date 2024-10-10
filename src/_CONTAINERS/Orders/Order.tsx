import OpenableComponent from '_COMPONENTS/GENERAL/OpenableComponent/OpenableComponent'
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
                        error: res.data.data.success,
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
                    error: error?.response?.data?.success,
                    content: error?.response?.data?.message
                })
            })
    }

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
                        <>
                        </>
                    </OpenableComponent>
                </div>
            ) : null}
        </form>
    );

}
