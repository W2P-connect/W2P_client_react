import React, { ReactNode, useEffect, useState } from 'react';
import './MetaKeysCategories.css'
import NavBar, { Item } from '../NAVIGATION/NavBar/NavBar';
import MetaKeysCategory from './MetaKeysCategory';
import CustomMetakeys from './CustomMetakeys';
import { appDataStore } from '_STORES/AppData';
import { MetaKeySources, Variable as VariableType } from 'Types';
import { translate } from 'translation';
import AddFreeField from './AddFreeField';
import { DropResult } from 'react-beautiful-dnd';
import VariableList from '_COMPONENTS/LOGICBLOCK/VariableList';
import { toJS } from 'mobx';
import { classNames } from 'helpers';

interface Props {
    source?: MetaKeySources
    onSelect: (variables: VariableType[]) => void
}

export default function MetaKeysCategories({ onSelect, source }: Props) {

    // console.log(source, 'appDataStore.appData.CONSTANTES.W2PCIFW_META_KEYS', toJS(appDataStore.appData.CONSTANTES.W2PCIFW_META_KEYS));


    const [currentCategory, setCurrentCategory] = useState<Item | null>(null)
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
        ...appDataStore.appData.CONSTANTES.W2PCIFW_META_KEYS
            .filter(category => !source
                ? true
                : category.allowedSource.includes(source)
            )
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
            value: <CustomMetakeys onSelect={addVariable} source={source} />
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
        <div className='relative flex flex-col h-full meta-keys-container'>
            <NavBar
                items={navBar}
            />
            <div className={
                classNames(
                    'flex-1 -auto p-2 max-h-[600px]',
                    currentCategory?.label === "Custom meta_key" ? "" : "overflow-y-auto",
                )}
            >
                {currentCategory ? currentCategory.value : null}
            </div>

            {
                variables.length
                    ? <div className='relative flex justify-between mt-4 pt-3 border-gray-300 border-t'>
                        <VariableList
                            variableArray={variables}
                            onUpdate={setVariables}
                        />
                        <button
                            onClick={selectVariables}
                            className='self-center m-l-10 strong-button'
                        >
                            {translate("Add")}
                        </button>
                    </div>
                    : null
            }
        </div >
    )

}