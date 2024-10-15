import RenderIf from '_COMPONENTS/GENERAL/RenderIf';
import React from 'react';
import { translate } from 'translation';
import { Query } from 'Types';

export default function QueryDetails({ query }: { query: Query }) {

    return (

        <div>
            <div className='first-query-details-sexion'>
                <div className='w2p-query-timelaps flex-1'>
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
                <div className='w2p-query-data flex-1' >
                    <div className='font-semibold mb-1'>{translate("Data for Pipedrive")}</div>
                    {
                        query.payload.data.length
                            ? query.payload.data.map((data, index) => (
                                <div key={index}>
                                    <span className='font-medium'>{data.name}:</span> {typeof data.value === 'object' ? JSON.stringify(data.value) : data.value}
                                </div>
                            ))
                            : <div>{translate('No valid data to send.')}</div>
                    }
                    <RenderIf condition={!!query.payload.products?.length} >
                        <div className='mb-1 mt-1 pt-1 border-t'>
                            {/* {translate("Products")} */}
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
                                                <div className="italic text-gray-500">
                                                    Commentaires: {product.comments}
                                                </div>
                                            </RenderIf>
                                        </div>
                                    ))
                                    : <div>{translate('No products to send.')}</div>
                            }
                        </div>
                    </RenderIf>
                </div>
            </div>
            <RenderIf condition={!!query.additional_data?.traceback && Array.isArray(query.additional_data.traceback)}>
                <div>
                    <div className='strong-1'>{translate("Trace back")}</div>
                    {query.additional_data.traceback
                        ?.sort((a, b) => {
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

    )

}