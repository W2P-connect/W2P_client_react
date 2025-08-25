import React from 'react'
import { translate } from 'translation'
import { Hook } from 'Types'
import CustomHooksParameters from './CustomHooksParameters'
import { hookStore } from '_STORES/Hooks'
import RenderIf from '_COMPONENTS/GENERAL/RenderIf'
import { deepCopy, updateIn } from 'utils/helpers'
import CreateActivity from './CreateActivity'
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.'
import { appDataStore } from '_STORES/AppData'

export default function HookParameters({ hook }: { hook: Hook }) {
    return (
        <>
            <h5 className='m-b-25 pt-4 font-semibold'>{translate(`Parameters of the event : ${hook.label}`)}</h5>

            <div className='pl-4 border-l'>
                <RenderIf condition={hook.key === "woocommerce_abandoned_cart"}>
                    <div className='flex items-center gap-2 mb-6'>
                        <div>A cart is considered as abadonned after</div>
                        <input
                            min={1}
                            max={99}
                            className='w-14'
                            value={appDataStore.appData.parameters.w2p.cart_duration ?? 2}
                            type="number"
                            onChange={e => {
                                const cart_duration = parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value) > 99 ? 99 : e.target.value
                                const newAppData = deepCopy(appDataStore.appData)
                                newAppData.parameters.w2p.cart_duration = cart_duration
                                appDataStore.setAppData(newAppData)
                            }}
                        />
                        <div>hours</div>
                    </div>
                </RenderIf>
                <label className='flex items-center mb-6 pointer'>
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
                            mainText={translate('Create an activity in Pipedrive when this event is triggered')} />
                    </div>
                </label>

                <RenderIf condition={!!hook.option.createActivity}>
                    <div className='bg-pipedriveMain-200/10 mb-4 p-2 border rounded-lg'>
                        <CreateActivity hook={hook} />
                    </div>
                </RenderIf>
            </div>

            <CustomHooksParameters hook={hook} />

        </>
    )
}
