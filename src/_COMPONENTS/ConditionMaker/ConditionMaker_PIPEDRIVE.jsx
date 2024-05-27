import React, { useEffect, useState, useContext } from 'react'
import { translate } from '../../translation'
import './coditionMaker.css'
import { PopupContext } from '../../_CONTEXT/PopupContext'
import MetaKeysCategories from '../METAKEYS/MetaKeysCategories'
import { AppDataContext } from '../../_CONTEXT/appDataContext'

/**
 * 
 * @param {object} condition value of the condition maker as String 
 * @param {function} setter setter of the condition maker -> string 
 * @param {string} type type of the condition maker : number, string, date 
 * @returns 
 */

const emptyConditionMaker = {
    enabled: false,
    fieldNumber: "ALL"
}
export default function ConditionMaker({ condition, setter, type, options = [] }) {

    const [conditionMaker, setConditionMaker] = useState(emptyConditionMaker)

    const { addPopupContent, showPopup } = useContext(PopupContext)
    const { appData } = useContext(AppDataContext)

    useEffect(() => {
        setConditionMaker({ ...emptyConditionMaker, ...condition })
    }, [])

    useEffect(() => {
        setter && setter(conditionMaker)
    }, [conditionMaker])

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
        setConditionMaker(prv => ({ ...prv, value: `${prv.value} ${variable}` }))
    }

    return (
        <div className='condition-maker'>
            {conditionMaker
                ? <>
                    <select
                        value={`${conditionMaker.enabled}`}
                        onChange={e => setConditionMaker(prv => ({ ...prv, enabled: e.target.value === "true" }))}
                    >
                        <option value="false">{translate("ALWAIS")}</option>
                        <option value="true">{translate("IF PREVIOUS VALUE")}</option>
                    </select>
                    {conditionMaker.enabled
                        ? <>
                            {conditionMaker.condition !== "include"
                                ? <div>
                                    {translate("IS")}
                                </div>
                                : null}

                            <select
                                value={conditionMaker.condition}
                                onChange={e => setConditionMaker(prv => ({ ...prv, condition: e.target.value }))}
                            >
                                <option value={"=="}>{translate("EQUAL TO")}</option>
                                <option value={"!="}>{translate("NOT EQUAL TO")}</option>
                                <option value={"include"}>{translate("INCLUDE")}</option>
                                {type === "int"
                                    ? <>
                                        <option value={"<"}>{translate("LOWER THAN")}</option>
                                        <option value={"<="}>{translate("LOWER OR EQUAL THAN")}</option>
                                        <option value={">"}>{translate("MORE THAN")}</option>
                                        <option value={">="}>{translate("MORE OR EQUALTHAN")}</option>
                                    </>
                                    : null
                                }
                            </select>

                            <div>
                                {type === "enum" || type === "user" || type === "status"
                                    ? <select
                                        value={conditionMaker.value}
                                        onChange={e => setConditionMaker(prv => ({ ...prv, value: e.target.value }))}
                                    >
                                        {type === "user"
                                            ? appData.parameters.pipedrive.users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)
                                            : options.map(option => <option value={option.label}>{option.label}</option>)
                                        }
                                    </select>
                                    : null}
                                {type === "date" || type === "varchar" || type === "address"
                                    ? <div className='flex-center gap-1'>
                                        <input
                                            value={conditionMaker.value}
                                            onChange={e => setConditionMaker(prv => ({ ...prv, value: e.target.value }))}
                                            type={type === "date" ? "date" : "text"}
                                            placeholder='value'
                                            style={{ width: "325px" }}
                                        />
                                        <button type="button" onClick={() => showMetaKeyVariables()}>Insert variable</button>
                                    </div>
                                    : null}
                            </div>
                        </>
                        : null
                    }
                </>
                : null
            }
        </div>
    )
}
