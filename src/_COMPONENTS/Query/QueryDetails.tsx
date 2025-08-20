import RenderIf from '_COMPONENTS/GENERAL/RenderIf';
import React from 'react';
import { translate } from 'translation';
import { Query } from 'Types';

export default function QueryDetails({ query }: { query: Query }) {

    return (
        <div className='flex'>
            <div className='flex-1 w2p-query-data' >
                <div className='mb-2 mb-6 pb-2 border-b font-semibold text-center'>{translate("Data for Pipedrive")}</div>
                {
                    query.payload.data.length
                        ? <div className='pb-6 border-b'>
                            <div className='mb-4 font-semibold'>{translate("Fields")}:</div>
                            {query.payload.data.map((data, index) => (
                                <div key={index}>
                                    <span className='font-medium'>{data.name}:</span>{" "}
                                    {typeof data.value === 'object'
                                        ? JSON.stringify(data.value)
                                        : String(data.value)}
                                </div>
                            ))}

                        </div>
                        : <div>{translate('No fields data to send.')}</div>
                }
                <RenderIf condition={!!query.payload.products?.length} >
                    <div className='mt-6 mb-4 font-semibold'>{translate("Products")}:</div>
                    <div>
                        {
                            query.payload.products?.length
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
                </RenderIf>
            </div>
            <div className='flex-1'>
                <div className='mb-6 pb-2 border-b font-semibold text-center'>{translate("Informations")}</div>
                <div className='pl-4 border-l'>
                    <div className='mb-6'>
                        <div>
                            <div className='strong-1'>{translate("Created at")}</div>
                            <div>{new Date(query.additional_data?.created_at).toLocaleString()}</div>
                        </div>
                        <RenderIf condition={!!query.additional_data?.sended_at}>
                            <div>
                                <div className='strong-1'>{translate("Sended at")}</div>
                                <div>{new Date(query.additional_data?.sended_at ?? '').toLocaleString()}</div>
                            </div>
                        </RenderIf>
                        <RenderIf condition={!!query.additional_data?.last_error}>
                            <div>
                                {/* <div className='strong-1'>{translate("Error occurred during the sending of the request")}</div> */}
                                <div className='text-red-700'>{query.additional_data.last_error}</div>
                            </div>
                        </RenderIf>
                    </div>

                    <RenderIf condition={!!query.additional_data?.traceback && Array.isArray(query.additional_data.traceback)}>
                        <div>
                            <div className='mb-4 pt-6 border-t font-semibold'>{translate("Traceback")}</div>
                            {query.additional_data.traceback
                                ?.sort((a, b) => {
                                    ''
                                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                                })
                                .map((trace, index) => {
                                    return <div key={index} className='m-b-10'>
                                        {trace.date
                                            ? <div className='strong-1'>{new Date(trace.date).toLocaleString()} : {translate(trace.step)}</div>
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

            </div>

        </div>
    )

}