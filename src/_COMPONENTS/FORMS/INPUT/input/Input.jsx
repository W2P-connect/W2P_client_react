import React from 'react'
import './input.css'

export default function Input({
    label = '',
    value = '',
    onInput = null,
    style = {},
    required = false,
    disabled = false,
    list = null,
    customParameters = [],
    type = 'text',
    min = '0',
    step = '0.01',
    max = null,
    className = '',
    placeholder = '',
    onKeyDown = null,
}) {
    return (
        <div style={style} className={`w2p-input ${className} ${disabled && "disabled"}`}>
            <label>
                {label ?
                    <div className="w2p-input-label">
                        {label}
                        {required && <span className='required-star'>*</span>}
                    </div>
                    : null
                }
                <input
                    className={""}
                    value={value}
                    onInput={e => onInput
                        ? onInput(...customParameters, e.target.value)
                        : null}
                    required={required}
                    list={list} disabled={disabled}
                    min={min} max={max} step={step}
                    type={type}
                    placeholder={placeholder}
                    onKeyDown={e => onKeyDown && onKeyDown(e)}
                />
            </label>
        </div >
    )
}
