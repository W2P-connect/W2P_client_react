import React, { useEffect, useState } from 'react'
import Input from '../FORMS/INPUT/input/Input'
import { translate } from '../../translation'

// const emptyField = {
//     value: '',
// }

export default function Variable({ defautVariable, setter, deleter }) {

    const [variable, setVariable] = useState({})

    useEffect(() => {
        defautVariable && setVariable(defautVariable)
    }, [])

    useEffect(() => {
        setter && setter(variable)
    }, [variable])

    const deleteVariable = () => {
        if (window.confirm(translate("Are you sure you want to delete this variable ?"))) {
            deleter(variable.id)
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
                        onInput={(value) => setVariable(prv => ({ ...prv, value: value }))}
                    />
                    : <div className='flex column'>
                        <div>
                            {variable.value}
                        </div>
                        {variable.example
                            ? <div className='italic subtext'>
                                {variable.example}
                            </div>
                            : null
                        }
                    </div>
                }
            </div>
        </>
    )
}
