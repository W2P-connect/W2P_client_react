import React, { ReactNode, useState } from 'react';
import './MetaKeysCategories.css'
import NavBar from '../NAVIGATION/NavBar/NavBar';
import MetaKeysCategory from './MetaKeysCategory';
import CustomMetakeys from './CustomMetakeys';
import { appDataStore } from '_STORES/AppData';
import { Variable as VariableType } from 'Types';
import { translate } from 'translation';
import AddFreeField from './AddFreeField';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import Variable from '_COMPONENTS/LOGICBLOCK/Variable';
import VariableList from '_COMPONENTS/LOGICBLOCK/VariableList';

export default function MetaKeysCategories({ onSelect }: { onSelect: (variables: VariableType[]) => void }) {


    const [currentCategory, setCurrentCategory] = useState<ReactNode | null>(null)
    const [variables, setVariables] = useState<VariableType[]>([])

    const selectVariables = () => {
        onSelect && onSelect(variables)
    }

    const addVariable = (variable: VariableType) => {
        setVariables(prv => {
            if (variable.value !== prv[prv.length - 1]?.value) {
                return [...prv, variable]
            } else {
                return prv
            }
        })
    }

    const navBar = [
        {
            label: "Free text",
            onClick: setCurrentCategory,
            active: false,
            value: <AddFreeField onSelect={addVariable} />
        },
        ...appDataStore.appData.CONSTANTES.W2P_META_KEYS
            .map((category, index) => ({
                label: category.label,
                active: index === 0,
                onClick: setCurrentCategory,
                value: <MetaKeysCategory category={category} onSelect={addVariable} />
            })),
        {
            label: "Custom meta_key",
            onClick: setCurrentCategory,
            active: false,
            value: <CustomMetakeys onSelect={addVariable} />
        }
    ]


    const deleteVariable = (id: VariableType["id"]) => {
        console.log(id, variables);

        setVariables(prv => prv.filter(variable => variable.id !== id))
    }

    const updateVariable = (updatedVariable: VariableType) => {
        setVariables(prv => (prv.map(variable =>
            variable.id === updatedVariable.id ? updatedVariable : variable
        )));
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const newVariables = Array.from(variables);
        const [reorderedItem] = newVariables.splice(result.source.index, 1);
        newVariables.splice(result.destination.index, 0, reorderedItem);

        setVariables(prv => newVariables);
    };

    return (
        <div className='meta-keys-container relative flex flex-col h-full'>
            <NavBar
                items={navBar}
            />
            <div className='flex-1 overflow-y-auto p-2 max-h-[600px]'>
                {currentCategory}
            </div>

            {variables.length
                ? <div className='mt-4 flex justify-between relative border-t border-gray-300 pt-3'>
                    <VariableList
                        variableArray={variables}
                        onUpdate={setVariables}
                    />
                    <button
                        onClick={selectVariables}
                        className='strong-button m-l-10 self-center'
                    >
                        {translate("Add")}
                    </button>
                </div>
                : null
            }
        </div>
    )

}