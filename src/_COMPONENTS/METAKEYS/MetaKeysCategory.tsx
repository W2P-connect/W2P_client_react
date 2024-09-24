import React from 'react'
import MetaKey from '_COMPONENTS/METAKEYS/MetaKey'
import { MetaKey as MetaKeyType, MetaKeyCategory, Variable } from 'Types'
import { v4 as uuidv4 } from 'uuid';

interface Props {
    category: MetaKeyCategory,
    onSelect: (variable: Variable) => void
}
export default function MetaKeysCategory({ category, onSelect }: Props) {

    const addVariable = (metaKey: MetaKeyType) => {
        const newVariable = { ...metaKey, isFreeField: false, id: uuidv4() }
        onSelect(newVariable)
    }

    return (
        <div>
            {category.description ?
                <p>
                    {category.description}
                </p>
                : null
            }
            {category.toolTip ?
                <div className='w2p-instructions m-b-10'>
                    {category.toolTip}
                </div>
                : null
            }

            {category.subcategories.map((subcategory, index) => (
                <div key={index} className='mb-3'>
                    <h3 className='text-sm font-semibold'>{subcategory.label}</h3>
                    <div className='meta-container'>
                        {subcategory.metaKeys.map((metaKey, index) =>
                            <div key={index} onClick={_ => addVariable(metaKey)}>
                                <MetaKey metaKey={metaKey} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
