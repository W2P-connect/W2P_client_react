import React, { ReactNode } from 'react'
import { Hook } from 'Types'

export default function CustomHooksParameters({ hook }: { hook: Hook }) {

    let hookContent: ReactNode = <></>

    if (hook.key === "woocommerce_cart_updated") {
        hookContent = <div className='w2p-warning'>The cart update of a user on your site will not be synchronized with Pipedrive if the user is not logged in.</div>
    
        if(hook.category === "deal") {
            hookContent = <>
                {hookContent}
                Syncrnoniser automatiquement le contenu du panier woocommerce avec le deal Pipedrive
            </>
        }
    }

    return (
        <>
            {hookContent}
        </>
    )
}
