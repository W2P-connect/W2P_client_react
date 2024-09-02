import React, { ReactNode, useState } from 'react';
import './MetaKeysCategories.css'
import NavBar from '../NAVIGATION/NavBar/NavBar';
import MetaKeysCategory from './MetaKeysCategory';
import CustomMetakeys from './CustomMetakeys';
import { appDataStore } from '_STORES/AppData';
import { MetaKey as MetaKeyType } from 'Types';
import { translate } from 'translation';
import MetaKey from './MetaKey';

export default function MetaKeysCategories({ onSelect }: { onSelect: (metaKeys: MetaKeyType[]) => void }) {


    const [currentCategory, setCurrentCategory] = useState<ReactNode | null>(null)
    const [metaKeys, setMetaKeys] = useState<MetaKeyType[]>([])

    const selectMetaKeys = () => {
        onSelect && onSelect(metaKeys)
    }

    const addMetaKey = (metaKey: MetaKeyType) => {
        setMetaKeys(prv => {
            if (metaKey.label !== prv[prv.length - 1]?.label) {
                return [...prv, metaKey]
            } else {
                return prv
            }
        })
    }

    const navBar = [
        ...appDataStore.appData.CONSTANTES.W2P_META_KEYS
            .map((category, index) => ({
                label: category.label,
                active: index === 0,
                onClick: setCurrentCategory,
                value: <MetaKeysCategory category={category} onSelect={addMetaKey} />
            })),
        {
            label: "Custom meta_key",
            onClick: setCurrentCategory,
            active: false,
            value: <CustomMetakeys onSelect={addMetaKey} />
        }
    ]

    return (
        <div className='meta-keys-container relative flex flex-col h-full'>
            <NavBar
                items={navBar}
            />
            <div className='flex-1 overflow-y-auto p-2 max-h-[600px]'>
                {currentCategory}
            </div>

            {metaKeys.length
                ? <div className='mt-4 flex justify-between relative border-t border-gray-300 pt-3'>
                    <div className='flex gap-1 flex-wrap'>
                        {metaKeys.map((metaKey, index) =>
                            <div key={index}>
                                <div className='meta-key' >
                                    <div className='meta-key-value'>{metaKey.label}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={selectMetaKeys}
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