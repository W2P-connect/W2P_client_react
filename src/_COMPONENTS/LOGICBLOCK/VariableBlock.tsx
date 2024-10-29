import React, { useEffect, useState, useContext } from 'react'
import Variable from './Variable'
import { translate } from '../../translation'
import { PopupContext } from '../../_CONTEXT/PopupContext'
import MetaKeysCategories from '../METAKEYS/MetaKeysCategories'
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Block, Variable as VariableType } from 'Types'
import VariableList from './VariableList'
import { hookStore } from '_STORES/Hooks'

export const emptyBlock: Block = {
    variables: [],
    id: '',
    index: 0,
}

export const getBlockExemple = (block: Block) => {
    if (block.variables) {
        return block.variables.map((variable, index) =>
            `${variable.exemple ? variable.exemple : variable.value}${index !== (block.variables.length - 1) ? ' ' : ''}`
        )
    }
}

interface Props {
    defautBlock: Block;
    setter: (block: Block) => void;
    deleter?: (id: Block['id']) => void;
    showExemple?: boolean
}

export default function VariableBlock({ defautBlock, setter, deleter, showExemple = true }: Props) {

    const { addPopupContent, showPopup } = useContext(PopupContext)
    const [block, setBlock] = useState<Block>(emptyBlock)

    const selectedHook = hookStore.selectedHookId
    ? hookStore.getHook(hookStore.selectedHookId)
    : null

    useEffect(() => {
        defautBlock && setBlock(defautBlock)
    }, [])

    useEffect(() => {
        setter && setter(block)
    }, [block])

    const addVariables = (variables: VariableType[]) => {
        showPopup(false);
        setBlock(prvBlock => ({
            ...prvBlock,
            variables: [...prvBlock.variables, ...variables]
        }));
    };

    const deleteBlock = () => {
        if (window.confirm(translate("Are you sure you want to delete this custom block ?"))) {
            deleter && deleter(block.id)
        }
    }

    const updateVariables = (variables: VariableType[]) => {
        setBlock(prv => ({
            ...prv,
            variables: variables
        }));
    }

    const addElement = () => {
        addPopupContent(<MetaKeysCategories onSelect={addVariables} source={selectedHook?.source} />)
    }

    return (
        <div className='block-container'>
            <div className="flex">
                {deleter
                    ? <div
                        className='delete-block text-red-700'
                        onClick={_ => deleteBlock()}
                    >×</div>
                    : null}
                <div>
                    <div className='italic'>{block.index === 0
                        // ? translate("Preferred block")
                        ? null
                        : <span>{translate("Backup block")} {block.index}</span>
                    }
                    </div>
                    <div className='flex gap-1 items-center'>
                        <VariableList
                            variableArray={block.variables}
                            onUpdate={updateVariables}
                        />
                        {block.variables?.length
                            ? <div
                                className='add-new-field'
                                onClick={_ => addElement()}
                            >
                                {translate("Add new field")}
                            </div>
                            : null}
                    </div>
                    {block.variables?.length
                        ? null
                        : <div
                            className='center underline w-100-p pointer'
                            onClick={_ => addElement()}
                        >
                            {translate("Add a field")}
                        </div>}
                </div>
            </div>
            {
                showExemple ?
                    <div className='italic flex justify-end mt-1 text-xs text-gray-700'>
                        {getBlockExemple(block)}
                    </div>
                    : null
            }
        </div >
    );

}
