import React, { useEffect, useState } from 'react'
import { translate } from '../../translation'
import VariableBlock, { emptyBlock } from './VariableBlock'
import { v4 as uuidv4 } from 'uuid';
import "./logicBlock.css"
import { LogicBlock } from 'Types';

interface Props {
    defaultLogicBlocks: LogicBlock;
    setter(logicBlock: LogicBlock)
}

export default function LogicBlocks({ defaultLogicBlocks, setter, fieldCondition }: Props) {

    const [logicBlocks, setLogicBlocks] = useState([{ ...emptyBlock, id: uuidv4() }])

    useEffect(() => {
        setter && setter(logicBlocks)
    }, [logicBlocks])

    useEffect(() => {
        defaultLogicBlocks && setLogicBlocks(defaultLogicBlocks)
    }, [])

    const updateBlock = (updatedBlock) => {
        setLogicBlocks(prv => [...prv.map(block =>
            block.id === updatedBlock.id
                ? updatedBlock
                : block
        )])
    }

    const addNewLogicBlock = () => {
        setLogicBlocks(prv => [...prv, { ...emptyBlock, id: uuidv4() }])
    }

    const deleteBlock = (id) => {
        setLogicBlocks(prv => prv.length > 1
            ? prv.filter(block => block.id !== id)
            : [{ ...emptyBlock, id: uuidv4() }])
    }

    const cantBeActive = (block, index) => {
        if (fieldCondition.enabled === false) {
            return index > 0
        } else {
            if (Number(fieldCondition.fieldNumber) === 1) {
                const trueIndex = logicBlocks.findIndex(block => block?.variables?.some(variable => variable.isFreeField))

                return trueIndex !== -1 && index > trueIndex
                    ? true
                    : false
            } else {
                return false
            }
        }
    }

    return (
        <div>
            <div className='logic-blocks-container'>
                {logicBlocks.map((block, index) => {
                    return <div key={block.id}
                        style={{ opacity: cantBeActive(block, index) ? 0.5 : 1 }}
                        className='w-[100%]'
                    >
                        <VariableBlock
                            defautBlock={{ ...block, index: index }}
                            setter={updateBlock}
                            deleter={deleteBlock}
                        />
                    </div>
                }
                )}
            </div>

            {logicBlocks.length && logicBlocks[logicBlocks.length - 1].variables.length
                ? <button
                    type='button'
                    onClick={e => addNewLogicBlock()}
                    className='light-button'
                    style={{ fontSize: "14px" }}
                >
                    {translate("Add Backup Block if Previous Block Doesn't Match Condition")}
                </button>
                : null
            }

        </div>
    )
}
