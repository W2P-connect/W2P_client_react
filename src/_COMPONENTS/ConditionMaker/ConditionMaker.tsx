import React, { useEffect, useState } from 'react'
import { translate } from '../../translation'
import './coditionMaker.css'
import { FieldCondition } from 'Types'

/**
 * 
 * @param {object} condition value of the condition maker as Object 
 * @param {function} setter setter of the condition maker -> object 
 * @returns 
 */

const emptyConditionMaker: FieldCondition["logicBlock"] = {
    enabled: false,
    fieldNumber: 'ALL'
}

interface Props {
    logicBlockCondition: FieldCondition["logicBlock"];
    setter: (condition: FieldCondition["logicBlock"]) => void
}
export default function ConditionMaker({ logicBlockCondition, setter = () => { } }: Props) {

    const [conditionMaker, setConditionMaker] = useState<FieldCondition["logicBlock"]>(emptyConditionMaker)

    useEffect(() => {
        setConditionMaker({ ...emptyConditionMaker, ...logicBlockCondition })
    }, [])

    useEffect(() => {
        setter && setter(conditionMaker)
    }, [conditionMaker])

    return (
        <div className='condition-maker'>
            {conditionMaker
                ? <>
                    {conditionMaker.enabled
                        ? <div>{translate("Send to Pipedrive")}</div>
                        : null}
                    <select
                        value={`${conditionMaker.enabled}`}
                        onChange={e => setConditionMaker(prv => ({ ...prv, enabled: e.target.value === "true" }))}
                    >
                        <option value="false">{translate("ALWAYS")}</option>
                        <option value="true">{translate("ONLY IF")}</option>
                    </select>
                    {conditionMaker.enabled
                        ? <>
                            <select
                                value={conditionMaker.fieldNumber}
                                onChange={e => setConditionMaker(prv => ({ ...prv, fieldNumber: e.target.value as "ALL" | "1" }))}
                            >
                                <option value={"ALL"}>{translate("ALL VARIABLES LISTED")}</option>
                                <option value={"1"}>{translate("A LEAST ONE VARIABLE")}</option>
                            </select>
                            <div>{conditionMaker.fieldNumber === "1"
                                ? translate("of a field value is set")
                                : translate("of a field value are sets")
                            }</div>
                        </>
                        : <div>{translate("send to Pipedrive even if listed variables aren't set")}</div>
                    }
                </>
                : null
            }
        </div>
    )
}
