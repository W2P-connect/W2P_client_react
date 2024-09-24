import { useEffect, useState } from 'react';
import { Variable as VariableType } from 'Types';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import Variable from '_COMPONENTS/LOGICBLOCK/Variable';


interface Props {
    variableArray: VariableType[];
    onUpdate: (variables: VariableType[]) => void;
}
export default function VariableList({ variableArray, onUpdate }: Props) {

    const deleteVariable = (id: VariableType["id"]) => {
        onUpdate(variableArray.filter(variable => variable.id !== id));
    }

    const updateVariable = (updatedVariable: VariableType) => {
        onUpdate(variableArray.map(variable =>
            variable.id === updatedVariable.id ? updatedVariable : variable
        ));
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newVariables = Array.from(variableArray);
        const [reorderedItem] = newVariables.splice(result.source.index, 1);
        newVariables.splice(result.destination.index, 0, reorderedItem);

        onUpdate(newVariables);
    };

    return (
        <div>
            {variableArray.length
                ? <div className='flex relative'>
                    <div className='fields-container'>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="variableBlock" direction="horizontal">
                                {(provided) => (
                                    <div
                                        className='block-fields'
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {variableArray.map((variable, index) => (
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
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
                : null
            }
        </div>
    )
}