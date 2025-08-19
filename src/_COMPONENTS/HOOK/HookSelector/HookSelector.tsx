import InputCheckbox from '../../FORMS/InputCheckbox/InputCheckbox';
import { translate } from '../../../translation';
import { observer } from 'mobx-react-lite';
import { Category, Hook, HookField, PreHook } from 'Types';
import { hookStore } from '_STORES/Hooks';
import { MouseEvent as ReactMouseEvent } from "react";
import RenderIf from '_COMPONENTS/GENERAL/RenderIf';
import { hookFieldStore } from '_STORES/HookField';

interface Props {
    preHook: PreHook;
    category: Category;
}

const HookSelector = ({ preHook, category }: Props) => {

    const hook: Hook = hookStore.getHookFromPreHook(preHook, category)

    const selectHook = (e: ReactMouseEvent<HTMLDivElement>, hook: Hook, enable: boolean = false) => {
        // const target = e.target as HTMLElement;
        if (hook.enabled || enable) {
            hookStore.selectHookId(hook.id)
        }
    }

    const updateHook = (key: keyof Hook, value: any) => {
        if (key === "enabled" && value === false && hook.id === hookStore.selectedHookId) {
            hookStore.selectHookId(null)
        }
        if (key === "enabled" && value === true) {
            hookStore.selectHookId(hook.id)
        }
        hookStore.updateHook(hook.id, { [key]: value });
    };


    return (
        <>{hook
            ? <div
                onClick={e => selectHook(e, hook, hook.enabled)}
                style={{
                    opacity: hook.enabled ? 1 : 0.4,
                    boxShadow: hook.id === hookStore.selectedHookId && hook.enabled
                        ? '0 0 20px 2px rgba(60,60,60, 0.12)'
                        : '',
                }}
                className={`border-1 hook-selector flex-col space-between rounded-xl px-2 py-1 cursor-pointer flex-auto max-w-[300px]`}
            >
                <div>
                    <div className='flex-center'>
                        <InputCheckbox
                            checked={hook.enabled}
                            onChange={(bool: boolean) => updateHook("enabled", bool)}
                        />
                        <div className='hook-label'>{preHook.label}</div>
                    </div>
                    <RenderIf condition={hook.fields.some(field => field.enabled)}>
                        <div className='flex flex-wrap gap-[4px] my-1'>
                            {hook.fields
                                .filter(field => field.enabled)
                                .sort((a, b) => a.pipedrive.name.length - b.pipedrive.name.length)
                                .map((field: HookField) => {
                                    return <div
                                        className='flex gap-1 bg-gray-100 shadow-sm px-2 py-[2px] border rounded-xl'
                                        key={field.id}>
                                        <div>
                                            <RenderIf condition={!hookFieldStore.hasValue(field)}>
                                                <div className="group inline-block relative">
                                                    <span
                                                        className="cursor-help select-none"
                                                        aria-describedby="no-value-tooltip"
                                                    >
                                                        ⚠️
                                                    </span>

                                                    <div
                                                        id="no-value-tooltip"
                                                        role="tooltip"
                                                        className="left-1/2 absolute bg-gray-900 opacity-0 group-hover:opacity-100 shadow-lg mt-2 px-2.5 py-1.5 rounded-md w-max max-w-xs text-white text-xs transition-opacity -translate-x-1/2 duration-150 pointer-events-none"
                                                    >
                                                        no value configured
                                                        <div className="-top-1 left-1/2 absolute bg-gray-900 w-2 h-2 rotate-45 -translate-x-1/2"></div>
                                                    </div>
                                                </div>
                                            </RenderIf>
                                            {field.pipedrive.name}
                                        </div>
                                    </div>
                                }
                                )
                            }
                        </div>
                    </RenderIf>
                </div>
                <div>
                    <div className='mt-1 min-w-0 max-w-[200px] overflow-hidden break-words subtext'>
                        {preHook.description}
                    </div>
                    <div
                        onClick={e => selectHook(e, hook)}
                        className='mt-1 underline center pointer'>
                        {translate("Set up")}
                    </div>
                </div>
            </div>
            : null
        }</>
    )
}


export default observer(HookSelector)