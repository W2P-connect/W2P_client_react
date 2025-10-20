import React, { useEffect, useState } from 'react'
import { translate } from '../../translation'
import VariableBlock, { emptyBlock } from './VariableBlock'
import { v4 as uuidv4 } from 'uuid';
import "./logicBlock.css"
import { Block, FieldCondition, MetaKeySources } from 'Types';
import RenderIf from '_COMPONENTS/GENERAL/RenderIf';

interface Props {
    defaultLogicBlocks: Block[];
    setter: (logicBlock: Block[]) => void;
    fieldCondition: FieldCondition;
    source?: MetaKeySources;
}

export default function LogicBlocks({ defaultLogicBlocks, setter, fieldCondition, source }: Props) {

    const [logicBlocks, setLogicBlocks] = useState<Block[]>([{ ...emptyBlock, id: uuidv4() }])

    useEffect(() => {
        setter && setter(logicBlocks)
    }, [logicBlocks])

    useEffect(() => {
        defaultLogicBlocks && setLogicBlocks(defaultLogicBlocks)
    }, [])

    const updateBlock = (updatedBlock: Block) => {
        setLogicBlocks(prv => [...prv.map(block =>
            block.id === updatedBlock.id
                ? updatedBlock
                : block
        )])
    }

    const addNewLogicBlock = () => {
        setLogicBlocks(prv => [...prv, { ...emptyBlock, id: uuidv4() }])
    }

    const deleteBlock = (id: Block["id"]) => {
        setLogicBlocks(prv => prv.length > 1
            ? prv.filter(block => block.id !== id)
            : [{ ...emptyBlock, id: uuidv4() }])
    }

    const cantBeActive = (index: number) => {
        if (fieldCondition.logicBlock.enabled === false) {
            return index > 0
        } else {
            if (Number(fieldCondition.logicBlock.fieldNumber) === 1) {
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
                        style={{ opacity: cantBeActive(index) ? 0.5 : 1 }}
                        className='relative w-[100%]'
                    >
                        <VariableBlock
                            defautBlock={{ ...block, index: index }}
                            setter={updateBlock}
                            deleter={deleteBlock}
                            source={source}
                        />
                    </div>
                }
                )}
            </div>

            {fieldCondition?.logicBlock?.enabled && logicBlocks.length && logicBlocks[logicBlocks.length - 1].variables.length
                ? <button
                    type='button'
                    onClick={e => addNewLogicBlock()}
                    className='light-button'
                    style={{ fontSize: "14px" }}
                >
                    {translate("Add Fallback value if Previous value Doesn't Match Condition")}
                </button>
                : null
            }

        </div>
    )
}
