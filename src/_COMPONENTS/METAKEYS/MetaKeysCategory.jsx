import React from 'react'

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
                <div key={index}>
                    <h3>{subcategory.label}</h3>
                    <div className='meta-container'>
                        {subcategory.metaKeys.map((metaKey, index) =>
                            <div
                                key={index}
                                className="meta-key"
                                onClick={_ => onSelect && onSelect(metaKey)}>
                                <div className='meta-key-value'>{metaKey.label}</div>
                                <div className='meta-key-descritpion'>{metaKey.description}</div>
                                <div className='meta-key-example'>Example: {metaKey.example}</div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
