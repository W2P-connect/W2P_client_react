import React, { ReactNode } from 'react'
import { Hook } from 'Types'

export default function CustomHooksParameters({ hook }: { hook: Hook }) {

    let hookContent: ReactNode = <></>

    if (hook.key === "woocommerce_abandoned_cart") {
        hookContent = <div className='w2p-warning'>
            Cart updates on your site won’t be synchronized with Pipedrive unless the user is logged in.
        </div>

        // if (hook.category === "deal") {
        //     hookContent = <>
        //         <p className='bg-darkPurple opacity-70 mb-4 px-2 py-2 rounded-lg font-semibold text-white'>Automatically synchronize the WooCommerce cart contents with the Pipedrive deal</p>
        //         {hookContent}
        //     </>
        // }
    }

    return (
        <>
            {hookContent}
        </>
    )
}
