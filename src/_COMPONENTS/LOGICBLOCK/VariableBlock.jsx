import React, { useEffect, useState, useContext } from 'react'
import Variable from './Variable'
import { translate } from '../../translation'
import { PopupContext } from '../../_CONTEXT/PopupContext'
import MetaKeysCategories from '../METAKEYS/MetaKeysCategories'
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const emptyBlock = {
    variables: [],
    id: 0,
    index: 0,
}

export const getBlockExemple = (block) => {
    if (block.variables) {
        return block.variables.map((variable, index) =>
            `${variable.example ? variable.example : variable.value}${index !== (block.variables.length - 1) ? ' ' : ''}`
        )
    } else {
        console.log(block);
    }
}

export default function VariableBlock({ defautBlock, setter, deleter }) {


    const { addPopupContent, showPopup } = useContext(PopupContext)
    const [block, setBlock] = useState(emptyBlock)

    useEffect(() => {
        defautBlock && setBlock(defautBlock)
    }, [])

    useEffect(() => {
        if (block.id && !block.variables.length) {
            console.log(block);
            // addElement()
        }
    }, [block])

    useEffect(() => {
        setter && setter(block)
    }, [block])

    const addMetaKeyElement = (metaKey) => {
        showPopup(false)
        setBlock(prvBlock => ({
            ...prvBlock,
            variables: [...prvBlock.variables, { ...metaKey, isFreeField: false, id: uuidv4() }]
        }))
    }

    const addFreeTextElement = () => {
        showPopup(false)
        setBlock(prvBlock => ({
            ...prvBlock,
            variables: [...prvBlock.variables, { value: '', isFreeField: true, id: uuidv4() }]
        }))
    }

    const deleteVariable = (id) => {
        setBlock(prv => ({
            ...prv,
            variables: prv.variables.filter(variable => variable.id !== id)
        }))
    }

    const deleteBlock = () => {
        if (window.confirm(translate("Are you sure you want to delete this custom block ?"))) {
            deleter(block.id)
        }
    }

    const updateVariable = (updatedVariable) => {
        setBlock(prv => ({
            ...prv,
            variables: prv.variables.map(
                variable => variable.id === updatedVariable.id
                    ? updatedVariable
                    : variable
            )
        }))
    }

    const addElement = () => {
        addPopupContent(
            <div className='flex align-center justify-center gap-1'>
                <button
                    type='button'
                    className='light-button'
                    onClick={_ => addFreeTextElement()}
                >
                    {translate("Free text")}
                </button>
                <button
                    type='button'
                    className='light-button'
                    onClick={_ => addPopupContent(<MetaKeysCategories onSelect={addMetaKeyElement} />)}
                >
                    {translate("variable field")}
                </button>
            </div>,
            "550px"
        )
    }

    const handleDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const variables = Array.from(block.variables);
        const [reorderedItem] = variables.splice(result.source.index, 1);
        variables.splice(result.destination.index, 0, reorderedItem);

        setBlock({
            ...block,
            variables: variables
        });
    };


    return (
        <div className='block-container'>
            <div className="flex">
                {deleter
                    ? <div
                        className='delete-block'
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
                    <div className='fields-container'>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="variableBlock" direction="horizontal">
                                {(provided) => (
                                    <div
                                        className='block-fields'
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {block.variables.map((variable, index) => (
                                            <Draggable key={variable.id} draggableId={variable.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <Variable
                                                            defautVariable={variable}
                                                            setter={updateVariable}
                                                            deleter={deleteVariable}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {block.variables.length
                                            ? <div
                                                type='button'
                                                className='add-new-field'
                                                onClick={_ => addElement()}
                                            >
                                                {translate("Add new field")}
                                            </div>
                                            : null}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                    {block.variables.length
                        ? null
                        : <div
                            className='center underline w-100-p pointer'
                            onClick={_ => addElement()}
                        >
                            {translate("Add a field")}
                        </div>}
                </div>
            </div>
            <div className='italic'>
                {getBlockExemple(block)}
            </div>
        </div>
    );

}
