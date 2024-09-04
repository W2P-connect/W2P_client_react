import React from 'react'
import MetaKey from '_COMPONENTS/METAKEYS/MetaKey'
export default function MetaKeysCategory({ category, onSelect }) {
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
                            <div key={index} onClick={_ => onSelect && onSelect(metaKey)}>
                                <MetaKey metaKey={metaKey} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
