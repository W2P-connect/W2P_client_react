import './hookSlector.css'
import InputCheckbox from '../../FORMS/InputCheckbox/InputCheckbox';
import { translate } from '../../../translation';
import { observer } from 'mobx-react-lite';
import { Category, Hook, HookField, PreHook } from 'Types';
import { hookStore } from '_STORES/Hooks';
import { MouseEvent as ReactMouseEvent } from "react";

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
                className={`flex-1 border-1 hook-selector flex-col space-between`}
            >
                <div>
                    <div className='flex-center'>
                        <InputCheckbox
                            checked={hook.enabled}
                            onChange={(bool: boolean) => updateHook("enabled", bool)}
                        />
                        <div className='hook-label'>{preHook.label}</div>
                    </div>
                    <div className='flex flex-wrap gap-[4px] my-1'>
                        {hook.fields
                            .filter(field => field.enabled)
                            .sort((a, b) => a.pipedrive.name.length - b.pipedrive.name.length)
                            .map((field: HookField) =>
                                <div
                                    className='bg-gray-100 shadow-sm px-2 py-[2px] border rounded-xl'
                                    key={field.id}>
                                    {field.pipedrive.name}
                                </div>
                            )
                        }
                    </div>
                    <div className='italic subtext'>
                        {preHook.description}
                    </div>
                </div>
                <div
                    onClick={e => selectHook(e, hook)}
                    className='mt-1 underline center pointer'>
                    {translate("Set up")}
                </div>
            </div>
            : null
        }</>
    )
}


export default observer(HookSelector)