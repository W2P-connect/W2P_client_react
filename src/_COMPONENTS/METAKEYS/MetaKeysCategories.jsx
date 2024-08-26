import React, { useState } from 'react';
import './MetaKeysCategories.css'
import NavBar from '../NAVIGATION/NavBar/NavBar';
import MetaKeysCategory from './MetaKeysCategory';
import CustomMetakeys from './CustomMetakeys';
import { appDataStore } from '_STORES/AppData';

export default function MetaKeysCategories({ onSelect }) {


    const [currentCategory, setCurrentCategory] = useState(null)

    const selectMetaKey = (metaKey) => {
        onSelect && onSelect(metaKey)

    }

    const navBar = [
        ...appDataStore.appData.CONSTANTES.W2P_META_KEYS
            .map((category, index) => ({
                label: category.label,
                active: index === 0,
                onClick: setCurrentCategory,
                value: <MetaKeysCategory category={category} onSelect={selectMetaKey} />
            })),
        {
            label: "Custom meta_key",
            onClick: setCurrentCategory,
            value: <CustomMetakeys onSelect={selectMetaKey} />
        }
    ]

    return (
        <div className='meta-keys-container'>
            <NavBar
                items={navBar}
            />
            {currentCategory}
        </div>
    )

}