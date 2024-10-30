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
                                description: "Select this option if your custom meta is stored in the user_meta table, associated with individual users."
                            },
                            {
                                id: 2,
                                value: "order",
                                label: "Order",
                                description: "Select this option if your custom meta is stored in the wc_orders_meta or post_meta table, linked specifically to customer orders."
                            },
                            {
                                id: 3,
                                value: "product",
                                label: "Product",
                                description: "Select this option if your custom meta is stored in the post_meta table, linked specifically to WooCommerce products."
                            },
                        ]
                            .filter(option => {
                                if (source === option.value) {
                                    return true
                                }
                                return false
                            })
                        }
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
