import React, { useEffect, useState } from 'react'
import Input from '../FORMS/INPUT/input/Input'
import { translate } from '../../translation'
import { Variable as VariableType } from 'Types'

interface Props {
    defautVariable?: VariableType;
    setter?: (variable: VariableType) => void;
    deleter?: (id: string) => void
}

const emptyVariable: VariableType = {
    id: '',
    isFreeField: false,
    exemple: '',
    value: '',
}

export default function Variable({ defautVariable, setter, deleter }: Props) {

    const [variable, setVariable] = useState<VariableType>(emptyVariable)

    useEffect(() => {
        defautVariable && setVariable(defautVariable)
    }, [])

    useEffect(() => {
        setter && setter(variable)
    }, [variable])

    const deleteVariable = () => {
        if (window.confirm(translate("Are you sure you want to delete this variable ?"))) {
            deleter && deleter(variable.id)
        }
    }

    return (
        <>
            <div className='variable-container border-1 box-shadow-1'>
                <div
                    className='delete-variable'
                    onClick={_ => deleteVariable()}
                >×</div>

                {variable.isFreeField
                    ? <Input
                        className='flat-input'
                        value={variable.value}
                        onInput={(value: string) => setVariable(prv => ({ ...prv, value: value }))}
                    />
                    : <div className='flex column'>
                        <div>
                            {variable.value}
                        </div>
                        {variable.exemple
                            ? <div className='italic subtext'>
                                {variable.exemple}
                            </div>
                            : null
                        }
                    </div>
                }
            </div>
        </>
    )
}
