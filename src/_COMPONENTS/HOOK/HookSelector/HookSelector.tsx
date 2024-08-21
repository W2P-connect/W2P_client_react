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
    selector: (hook: Hook) => void;
    active: boolean;
}

const HookSelector = ({ preHook, category, selector, active }: Props) => {

    const hook: Hook = hookStore.getHookFromPreHook(preHook, category)

    const selectHook = (e: ReactMouseEvent<HTMLDivElement>, hook: Hook) => {
        const target = e.target as HTMLElement;
        if (
            target.className
            && !target.className.includes("w2p-checkbox")
            && hook.enabled
        ) {
            selector(hook)
        }
    }

    const updateHook = (key: keyof Hook, value: any) => {
        hookStore.updateHook(hook.id, { [key]: value });
    };


    return (
        <>{hook
            ? <div
                // onClick={e => selectHook(e, hook)}
                style={{
                    opacity: hook.enabled ? 1 : 0.4,
                    boxShadow: active && hook.enabled ? '0 0 20px 2px rgba(60,60,60, 0.12)' : '',
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
                    {hook.fields
                        .filter(field => field.enabled)
                        .map((field: HookField) => <li key={field.pipedriveFieldId} className='m-b-0'>
                            {field.pipedrive.name}
                        </li>)
                    }
                    <div className='subtext italic'>
                        {preHook.description}
                    </div>
                </div>
                <div
                    onClick={e => selectHook(e, hook)}
                    className='underline center pointer'>
                    {translate("Set up")}
                </div>
            </div>
            : null
        }</>
    )
}


export default observer(HookSelector)