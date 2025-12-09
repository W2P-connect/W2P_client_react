import Input from '_COMPONENTS/FORMS/INPUT/input/Input'
import MainButton from '_COMPONENTS/GENERAL/MainButton/MainButton'
import MetaKey from './MetaKey'
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

    // Line break MetaKey
    const lineBreakMetaKey = {
        label: "Line Break",
        description: "Adds a line break (\\n) to the text",
        value: "line break",
        source: "w2p" as const
    }

    const addLineBreak = () => {
        const lineBreakVariable: Variable = {
            id: uuidv4(),
            isFreeField: false,
            value: "{{line break}}",
        }
        onSelect(lineBreakVariable)
    }

    return (
        <div className=''>
            <div className="mb-3 font-medium text-gray-900 text-sm leading-6">
                {translate("You can enter your preferred text here to add it to the values sent to Pipedrive.")}
            </div>
            <div className='flex items-end gap-2'>
                <Input
                    className='!min-w-64 flat-input'
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
                    onClick={_ => {
                        onSelect({ ...variable, id: uuidv4() })
                        setVariable({
                            id: uuidv4(),
                            exemple: "",
                            isFreeField: true,
                            value: "",
                        })
                    }}
                    className='py-2'
                    style={2}
                >
                    Add
                </MainButton>
            </div>

            {/* Line Break MetaKey */}
            <div className='mt-12'>
                <div className='mb-2 font-semibold text-sm'>Quick Actions</div>
                <div className='meta-container'>
                    <div onClick={addLineBreak} style={{ cursor: 'pointer' }}>
                        <MetaKey metaKey={lineBreakMetaKey} />
                    </div>
                </div>
            </div>
        </div>
    )
}
