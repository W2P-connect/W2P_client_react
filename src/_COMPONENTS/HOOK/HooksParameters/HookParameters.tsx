import React from 'react'
import { translate } from 'translation'
import { Hook } from 'Types'
import CustomHooksParameters from './CustomHooksParameters'
import { hookStore } from '_STORES/Hooks'
import RenderIf from '_COMPONENTS/GENERAL/RenderIf'
import { updateIn } from 'utils/helpers'
import CreateActivity from './CreateActivity'
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.'

export default function HookParameters({ hook }: { hook: Hook }) {
    return (
        <>
            <h5 className='m-b-25'>{translate(`Parameter of the event : ${hook.label}`)}</h5>

            {/* C'est clairement la V2 : ajout d'une activité avec des infos */}
            <label className='flex items-center m-b-10 pointer'>
                <input
                    type='checkbox'
                    className='m-r-10'
                    onChange={e => hook &&
                        hookStore.updateHook(
                            hook.id,
                            updateIn(hook, ["option", "createActivity"], e.target.checked)
                        )}
                    checked={hook.option.createActivity ?? false}
                />
                <div>
                    <Tooltip
                        tooltipText={<div>
                            <p className='mb-1'>Example: When a new account is created (User Registration), you can automatically schedule an “Onboarding call” in Pipedrive. </p>
                            <p>By setting the due date to 2 days later at 09:00, your sales team receives a timely reminder to follow up, ensuring every new customer gets a smooth start.</p>
                        </div>}
                        mainText={translate('Add an activity when this event is triggered')} />
                </div>
            </label>

            <RenderIf condition={!!hook.option.createActivity}>
                <div className='bg-pipedriveMain-200/10 mb-4 p-2 border rounded-lg'>
                    <CreateActivity hook={hook} />
                </div>
            </RenderIf>

            <CustomHooksParameters hook={hook} />

        </>
    )
}
