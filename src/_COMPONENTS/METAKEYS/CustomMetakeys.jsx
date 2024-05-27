import React, { useState } from 'react'
import Input from '../FORMS/INPUT/input/Input'
import { translate } from '../../translation'

export default function CustomMetakeys({ onSelect }) {

    const [metaKey, setMetaKey] = useState({
        value: '',
        isCustomMetaKey: true,
    })

    const addMetaKey = (e) => {
        e.preventDefault()
        onSelect && onSelect({ ...metaKey, example: `{{${metaKey.value}}}` })
    }

    return (
        <div>
            <p>
                {translate("If you have set up custom meta_keys on your site, you can add them here")}
            </p>
            <form
                className='flex flex-end gap-1'
                onSubmit={e => addMetaKey(e)}
            >
                <Input
                    value={metaKey.value}
                    onInput={(newValue) => setMetaKey(prv => ({ ...prv, value: newValue }))}
                    label={translate("Custom meta key")}
                    required={true}
                />
                <button
                    className='light-button'
                >
                    {translate("Add")}
                </button>
            </form>
        </div>
    )
}
