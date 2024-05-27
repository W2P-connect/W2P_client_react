import React, { useState, useContext, useEffect } from 'react'
import { translate } from '../../translation'
import { isFieldTypeNumber } from '../../_CONTAINERS/Parameters/parametersHelpers'
import InputCheckbox from '../FORMS/InputCheckbox/InputCheckbox'
import Input from '../FORMS/INPUT/input/Input'
import { useCallPipedriveApi } from '../../helpers'
import { AppDataContext } from '../../_CONTEXT/appDataContext'
import TextEditor from '../FORMS/TextEditor/TextEditor'
import { PopupContext } from '../../_CONTEXT/PopupContext'
import MetaKeysCategories from '../METAKEYS/MetaKeysCategories'
import Skeleton from '../GENERAL/Skeleton/Skeleton'
import ConditionMaker from '../ConditionMaker/ConditionMaker'

/**
 * 
 * @param {Hook} hook required 
 * @param {Option} WP2Option required 
 * @returns 
 */
export default function W2PHook({ hook, option, setOption }) {

    const [currentHook, setCurrentHook] = useState(null)
    const [hookValue, setHookValue] = useState("")
    const [hookCondition, setHookCondition] = useState({})

    const { appData, setAppData } = useContext(AppDataContext)
    const { addPopupContent, showPopup } = useContext(PopupContext)

    const callPipedriveApi = useCallPipedriveApi()

    useEffect(() => {
        setCurrentHook(hook)
        setHookValue(hook.value)
        setHookCondition(hook.condition)
    }, [])

    useEffect(() => {
        if (currentHook) {
            setOption(prvOption => ({
                ...prvOption,
                hooks: option.hooks.map(hook => hook.name === currentHook.name
                    ? currentHook
                    : hook
                )
            }))
        }
    }, [currentHook])

    const toogleHook = (activate) => {
        setCurrentHook(hook => ({ ...hook, activated: activate }))
    }

    const selectOption = (id) => {
        if (option.field_type === "enum" || option.field_type === "user" || option.field_type === "status") {
            setCurrentHook(hook => ({ ...hook, value: [id] }))
        } else if (option.field_type === "set" || option.field_type === "visible_to") {
            currentHook.value.includes(id)
                ? setCurrentHook(hook => ({ ...hook, value: hook.value.filter(val => val.id !== id) }))
                : setCurrentHook(hook => ({ ...hook, value: [...hook.value, id] }))
        }
    }

    useEffect(() => {
        if (currentHook) {
            setCurrentHook(hook => ({ ...hook, value: hookValue }))
        }
    }, [hookValue])

    useEffect(() => {
        if (hookCondition) {
            setCurrentHook(hook => ({ ...hook, condition: hookCondition }))
        }
    }, [hookCondition])

    const updateHookValue = (value) => {
        setHookValue(value)
    }

    const showMetaKeyVariables = () => {
        addPopupContent({
            content: <MetaKeysCategories
                onSelect={insertVariable}
            />,
            width: "1220px"
        })
    }

    const insertVariable = (variable) => {
        showPopup(false)
        setHookValue(prvValue => prvValue ? `${prvValue} ${variable}` : variable)
    }

    return (
        <div>
            {currentHook
                ? <>
                    <div className='m-b-10'>
                        <InputCheckbox
                            checked={currentHook.activated}
                            onChange={toogleHook}
                            label={translate(`Assign custom value during the following event: <strong>${currentHook.label}</strong>`)}
                        />
                    </div>

                    {currentHook.activated
                        ? <div className='m-b-25 m-t-25 p-b-25'>
                            <div className='m-b-10'>
                                <ConditionMaker
                                    condition={hookCondition}
                                    setter={setHookCondition}
                                    type={option.field_type}
                                    option={option.options ?? []}
                                />
                            </div>

                            {/* <div className='strong-1 m-t-10 m-b-10'>Assigned value</div> */}
                            {/* FIELDTYPE ENUM OR SET */}
                            {(option.field_type === "enum" || option.field_type === "set" || option.field_type === "status")
                                ? option.options
                                    ? <div className='pipedrive-option-field-container'> {
                                        option.options.map((option, index) =>
                                            <div
                                                key={index}
                                                onClick={e => selectOption(option.id)}
                                                className={`pipedrive-option-field ${currentHook.value.includes(option.id) ? "selected" : ""}`}
                                                style={{ backgroundColor: option.color ? option.color : "white" }}
                                            >{option.label}</div>
                                        )
                                    }
                                    </div>
                                    : null
                                : null
                            }
                            {/* FIELDTYPE VARCHAR / ADRESS */}
                            {option.field_type === "varchar" || option.field_type === "address" || isFieldTypeNumber(option.field_type)
                                ? <div className='flex flex-center gap-1'>
                                    <Input
                                        placeholder={`Value for ${option.name} while ${currentHook.name}`}
                                        style={{ width: '100%', maxWidth: "460px" }}
                                        value={hookValue}
                                        type={isFieldTypeNumber(option.field_type) ? 'number' : 'text'}
                                        onInput={updateHookValue}
                                    />
                                    <button type="button" onClick={() => showMetaKeyVariables()}>Insert variable</button>
                                </div>
                                : null
                            }
                            {/* FIELDTYPE DATE */}

                            {option.field_type === "date"
                                ? <div className='flex flex-center gap-1'>
                                    <Input
                                        placeholder={`Value for ${option.name} while ${currentHook.name}`}
                                        style={{ width: '100%', maxWidth: "460px" }}
                                        value={hookValue}
                                        type={"date"}
                                        onInput={updateHookValue}
                                    />
                                    <button type="button" onClick={() => showMetaKeyVariables()}>Insert variable</button>
                                </div>
                                : null
                            }
                            {/* FIELDTYPE VISIBLE_TO / USER */}
                            {(option.field_type === "visible_to" || option.field_type === "user")
                                ? appData.parameters.pipedrive.users.length
                                    ? <div className='pipedrive-option-field-container'> {
                                        appData.parameters.pipedrive.users.map((user, index) =>
                                            <div
                                                key={index}
                                                onClick={e => selectOption(user.id)}
                                                className={`pipedrive-option-field ${currentHook.value.includes(user.id) ? "selected" : ""}`}
                                                style={{ backgroundColor: user.color ? user.color : "white" }}
                                            >{user.name}</div>
                                        )
                                    }
                                    </div>
                                    : <button
                                        type='button'
                                        className='light-button'
                                        onClick={e => loadPipedriveUsers(e)}
                                    >
                                        {translate("Load pipedrive's users")}
                                    </button>
                                : null
                            }

                        </div>
                        : null
                    }
                </>
                : <Skeleton />
            }
        </div>
    )
}