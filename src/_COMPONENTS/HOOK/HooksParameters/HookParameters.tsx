import React from 'react'
import { translate } from 'translation'
import { Hook } from 'Types'
import CustomHooksParameters from './CustomHooksParameters'

export default function HookParameters({ hook }: { hook: Hook }) {
    return (
        <>
            <h5 className='m-b-25'>{translate(`Parameter of the event : ${hook.label}`)}</h5>

            {/* C'est clairement la V2 : ajout d'une activité avec des infos */}
            {/* <label className='pointer flex items-center m-b-10'>
            <input
            type='checkbox'
            className='m-r-10'
            onChange={e => hook && updateHook(hook.id, 'option.createActivity', e.target.checked)}
            checked={hook.option.createActivity ?? false}
            />
            <div>
            {translate('Add an activity when this event is triggered.')}
            <div className='subtext'>
            {translate(
                `An activity specifying the updated fields and the triggered event will be automatically added to the ${hook.category} on Pipedrive.`
                )}
                </div>
                </div>
                </label> */}

            <CustomHooksParameters hook={hook} />

        </>
    )
}
