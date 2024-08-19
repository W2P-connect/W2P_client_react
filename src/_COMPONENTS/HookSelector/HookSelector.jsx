import { useState, useEffect, useContext } from 'react'
import './hookSlector.css'
import { useHookSelector } from '../../_CONTAINERS/Parameters/parametersHelpers'
import set from 'lodash/set.js';
import InputCheckbox from '../FORMS/InputCheckbox/InputCheckbox';
import { AppDataContext } from '../../_CONTEXT/appDataContext';
import { translate } from '../../translation';

export default function HookSelector({ parentHook, category, selector, active }) {

    const [hook, setHook] = useState()
    const [fields, setFields] = useState([])

    const { appData } = useContext(AppDataContext)
    const { setOptionHook, getHookFromParent } = useHookSelector()

    useEffect(() => {
        const paramHook = getHookFromParent(parentHook, category)
        setHook(_ => paramHook)
        setFields(paramHook.fields.filter(field => field.enabled))
    }, [parentHook, appData.parameters.pipedrive[`${category}Fields`]])

    useEffect(() => {
        console.log("hookList.length", appData.parameters.w2p.hookList.length);
    }, [appData.parameters.w2p.hookList])


    useEffect(() => {
        if (hook) {
            setOptionHook(hook)
        }
    }, [hook])

    const updateHook = (keyPath, value) => {
        setHook(prevHook => {
            const newHook = { ...prevHook };
            set(newHook, keyPath, value);
            selector(newHook)
            return newHook;
        });
    }

    const selectHook = (e, hook) => {
        if (
            e.target.className
            && !e.target.className.includes("w2p-checkbox")
            && hook.enabled
        ) {
            selector(hook)
        }
    }

    // console.log(hook);

    return (
        <>{hook
            ? <div
                // onClick={e => selectHook(e, hook)}
                style={{
                    opacity: hook.enabled ? 1 : 0.4,
                    boxShadow: active && hook.enabled ? '0 0 20px 2px rgba(60,60,60, 0.12)' : null,
                }}
                className={`flex-1 border-1 hook-selector flex-col space-between`}
            >
                <div>
                    <div className='flex-center'>
                        <InputCheckbox
                            checked={hook.enabled}
                            onChange={(bool) => updateHook("enabled", bool)}
                        />
                        <div className='hook-label'>{parentHook.label}</div>
                    </div>
                    {fields
                        .filter(field => field.enabled)
                        .map((field) => <li key={field.id} className='m-b-0'>
                            {field.name}
                        </li>)
                    }
                    <div className='subtext italic'>
                        {parentHook.description}
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
