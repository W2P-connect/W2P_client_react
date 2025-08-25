import Input from '_COMPONENTS/FORMS/INPUT/input/Input'
import Select from '_COMPONENTS/FORMS/INPUT/select/Select'
import { appDataStore } from '_STORES/AppData'
import { hookStore } from '_STORES/Hooks'
import { classNames, updateIn, useCallPipedriveApi } from 'utils/helpers'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { translate } from 'translation'
import { Hook } from 'Types'
import { useLoadPipedriveUsers } from 'utils/pipedrive'
import InputCheckbox from '_COMPONENTS/FORMS/InputCheckbox/InputCheckbox'

function CreateActivity({ hook }: { hook: Hook }) {


    const callPipedriveApi = useCallPipedriveApi()

    const activityTypesOptions =
        [{
            id: 0,
            value: 'no_activity_type',
            label: translate('No activity type')
        }].concat(
            appDataStore.appData.parameters.pipedrive.activityTypes.map(type => ({
                id: type.id,
                value: type.key_string,
                label: type.name
            }))
        )

    const pipedriveUsersOptions =
        [{
            id: 0,
            value: 0,
            label: translate('No owner')
        }].concat(
            appDataStore.appData.parameters.pipedrive.users.map(user => ({
                id: user.id,
                value: user.id,
                label: user.name
            }))
        )

    const loadPipedriveUsers = useLoadPipedriveUsers()

    const loadActivityTypes = (e: React.FormEvent) => {
        callPipedriveApi("activityTypes", null, null, null, e)
            .then(res => {
                if (res) {
                    const newAppDataStore = appDataStore.appData
                    newAppDataStore.parameters.pipedrive.activityTypes = res.data.data
                    appDataStore.setAppData(newAppDataStore)
                }
            })
    }

    return (
        <div className='flex gap-4'>
            <div className='flex-1 pr-2 border-r'>
                <div className='mb-2 w-full'>
                    <div className='font-semibold'>Subject of the activity</div>
                    <Input
                        className='!w-full'
                        type='text'
                        value={hook.option.activity?.subject ?? `${hook.label} triggered`}
                        onInput={value =>
                            hookStore.updateHook(
                                hook.id,
                                updateIn(hook, ["option", "activity", "subject"], value)
                            )
                        }
                    />
                </div>

                <div>
                    <div className='font-semibold'>Notes</div>
                    <textarea
                        className='p-2 border border-[rgb(0, rounded-md w-full min-h-[100px] 0, 0, 0.12)]'
                        onChange={e => hookStore.updateHook(
                            hook.id,
                            updateIn(hook, ["option", "activity", "note"], e.target.value)
                        )}
                        defaultValue={hook.option.activity?.note ?? ''}
                    />

                    <p className='mt-2'>Activities are automatically linked to the related person, organization, and order that triggered the event</p>
                </div>
            </div>

            <div className='flex-1'>
                <div className='mb-2'>
                    <div className='font-semibold'>Activity type (optional)</div>
                    <div className='flex items-end gap-4 max-w-[500px]'>
                        <Select
                            className='flex-1'
                            options={activityTypesOptions}
                            onSelect={value =>
                                hookStore.updateHook(
                                    hook.id,
                                    updateIn(hook, ["option", "activity", "type"], value)
                                )
                            }
                            value={hook.option.activity?.type ?? activityTypesOptions[0]}
                            defaultOption={activityTypesOptions[0]}
                        />
                        <form onSubmit={e => loadActivityTypes(e)}>
                            <button
                                className='light-button'
                            >
                                {appDataStore.appData.parameters.pipedrive.activityTypes.length
                                    ? translate("Reload pipedrive's activity types")
                                    : translate("Load pipedrive's activity Type")
                                }
                            </button>
                        </form>
                    </div>
                </div>
                <div className='mb-2'>
                    <div className='font-semibold'>Owner (optional)</div>
                    <div className='flex items-end gap-4 max-w-[500px]'>
                        <Select
                            className='flex-1'
                            options={pipedriveUsersOptions}
                            onSelect={value =>
                                hookStore.updateHook(
                                    hook.id,
                                    updateIn(hook, ["option", "activity", "owner_id"], value)
                                )
                            }
                            value={hook.option.activity?.owner_id ?? pipedriveUsersOptions[0].value}
                        />
                        <form onSubmit={e => loadPipedriveUsers(e)}>
                            <button
                                className='light-button'
                            >
                                {appDataStore.appData.parameters.pipedrive.users.length
                                    ? translate("Reload pipedrive's users")
                                    : translate("Load pipedrive's users")
                                }
                            </button>
                        </form>
                    </div>
                </div>
                <div className='mt-4'>
                    <InputCheckbox
                        checked={hook.option.activity?.done ?? false}
                        onChange={value =>
                            hookStore.updateHook(
                                hook.id,
                                updateIn(hook, ["option", "activity", "done"], value)
                            )
                        }
                        label='Mark activity as done'
                    />

                    {/* <RenderIf condition={!hook.option.activity?.done}> */}
                    <div className='mt-2'>
                        <div className='font-semibold'>Due date</div>
                        <div className='flex items-center gap-2'>
                            <InputCheckbox
                                checked={hook.option.activity?.enable_due_date ?? false}
                                onChange={value => hookStore.updateHook(
                                    hook.id,
                                    updateIn(hook, ["option", "activity", "enable_due_date"], value)
                                )}
                            />
                            <div className={classNames(
                                "condition-maker transition-all duration-300 ease-in-out"
                                , hook.option.activity?.enable_due_date ? "opacity-100" : "opacity-50")
                            }>
                                <div>After </div>
                                <Input
                                    type='number'
                                    min='0'
                                    max='30'
                                    step='1'
                                    value={`${hook.option.activity?.due_date_value ?? 1}`}
                                    onInput={value =>
                                        hookStore.updateHook(
                                            hook.id,
                                            updateIn(hook, ["option", "activity", "due_date_value"], value)
                                        )
                                    }
                                />
                                <select
                                    value={hook.option.activity?.due_date_unit ?? "day"}
                                    onChange={e => hookStore.updateHook(
                                        hook.id,
                                        updateIn(hook, ["option", "activity", "due_date_unit"], e.target.value)
                                    )}
                                >
                                    <option value="day">{translate("DAY")}</option>
                                    <option value="week">{translate("WEEK")}</option>
                                    <option value="month">{translate("MONTH")}</option>
                                </select>
                                <div className='px-2'>at </div>
                                <Input
                                    type='time'
                                    step="60"
                                    value={hook.option.activity?.due_time ?? "09:00"}
                                    onInput={value =>
                                        hookStore.updateHook(
                                            hook.id,
                                            updateIn(hook, ["option", "activity", "due_time"], value)
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* </RenderIf> */}
                </div>
            </div>

        </div>
    )
}

export default observer(CreateActivity)