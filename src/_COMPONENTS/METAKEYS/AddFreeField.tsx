import Input from '_COMPONENTS/FORMS/INPUT/input/Input'
import MainButton from '_COMPONENTS/GENERAL/MainButton/MainButton'
import React, { useState } from 'react'
import { translate } from 'translation'
import { Variable } from 'Types'
import { v4 as uuidv4 } from 'uuid';


interface Props {
    onSelect: (metaKey: Variable) => void
}
export default function AddFreeField({ onSelect }: Props) {

    const [variable, setVariable] = useState<Variable>({
        id: uuidv4(),
        exemple: "",
        isFreeField: true,
        value: "",
    })
    return (
        <div className=''>
            <div className="text-sm font-medium leading-6 text-gray-900 mb-3 ">
                {translate("You can enter your preferred text here to add it to the values sent to Pipedrive.")}
            </div>
            <div className='flex items-end gap-2'>
                <Input
                    className='flat-input !min-w-64'
                    value={variable.value}
                    placeholder='Your text here'
                    // widthFromValue={true}
                    onInput={(value: string) => setVariable(prv => ({
                        ...prv,
                        value: value,
                        exemple: value,
                    }))}
                />
                <MainButton
                    onClick={_ => onSelect(variable)}
                    className='py-2'
                    style={2}
                >
                    Add
                </MainButton>
            </div>
        </div>
    )
}
