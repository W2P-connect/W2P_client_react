import React, { FormEvent, useState } from 'react'
import Input from '../FORMS/INPUT/input/Input'
import { translate } from '../../translation'
import Select from '_COMPONENTS/FORMS/INPUT/select/Select'
import { MetaKeySources, Variable } from 'Types'
import { v4 as uuidv4 } from 'uuid';

interface Props {
    source?: MetaKeySources
    onSelect: (customMetaKey: Variable) => void
}

export default function CustomMetakeys({ onSelect, source }: Props) {

    const [metaKey, setMetaKey] = useState<Variable>({
        value: '',
        isCustomMetaKey: true,
        source: source ?? null,
        description: "",
        exemple: "",
        label: "",
        isFreeField: false,
        id: uuidv4()
    })

    const addMetaKey = (e: FormEvent) => {
        e.preventDefault()
        onSelect && onSelect({ ...metaKey, exemple: `{{${metaKey.value}}}`, source: sourceState })
    }

    const [sourceState, setSourceState] = useState(source)

    return (
        <div>
            <p>
                {translate("If you have set up custom meta_keys on your site, you can add them here")}
            </p>
            <form
                className='flex flex-end gap-1 mt-4'
                onSubmit={e => addMetaKey(e)}
            >
                <div className='w-60'>
                    <Select
                        options={[
                            {
                                id: 1,
                                value: "user",
                                label: "User",
                                description: "Select this if your custom meta is saved in user_meta table"
                            },
                            {
                                id: 2,
                                value: "order",
                                label: "Post",
                                description: "Select this if your custom meta is saved in post_meta table"
                            },
                        ]}
                        value={sourceState}
                        label='Metakey location'
                        onSelect={value => setSourceState(value as MetaKeySources)}

                    />
                </div>

                <div>
                    <div className='block text-sm font-medium leading-6 text-gray-900 mb-2'>MetaKey name</div>
                    <Input
                        value={metaKey.value}
                        onInput={(newValue) => setMetaKey(prv => ({ ...prv, value: newValue }))}
                        // label={translate("Custom meta key")}
                        required={true}
                    />
                </div>

                <option></option>
                <button
                    className='light-button'
                >
                    {translate("Add")}
                </button>
            </form>
        </div>
    )
}
