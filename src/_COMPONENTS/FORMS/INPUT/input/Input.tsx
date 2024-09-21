import React, { useEffect, useRef } from 'react';
import './input.css';

interface InputProps {
    label?: string;
    value?: string;
    onInput?: (value: string, ...customParameters: any[]) => void;
    style?: React.CSSProperties;
    required?: boolean;
    disabled?: boolean;
    list?: string | null;
    customParameters?: any[];
    type?: string;
    min?: string;
    step?: string;
    max?: string | null;
    className?: string;
    placeholder?: string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    widthFromValue?: boolean
}

const Input: React.FC<InputProps> = ({
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
    widthFromValue = false
}) => {

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current && widthFromValue) {
            const inputWidth = value ? `calc(${value.length}ch + 0px)` : 'auto';
            inputRef.current.style.width = inputWidth;
            inputRef.current.style.paddingLeft = '0px';
            inputRef.current.style.paddingRight = '0px';
        }
    }, [value]);

    return (
        <div style={style} className={`w2p-input ${className} ${disabled && 'disabled'}`}>
            <label>
                {label ? (
                    <div className="w2p-input-label">
                        {label}
                        {required && <span className="required-star">*</span>}
                    </div>
                ) : null}
                <input
                    ref={inputRef}
                    className=""
                    value={value}
                    onInput={(e) =>
                        onInput ? onInput(e.currentTarget.value, ...customParameters) : null
                    }
                    required={required}
                    list={list || undefined}
                    disabled={disabled}
                    min={min}
                    max={max || undefined}
                    step={step}
                    type={type}
                    placeholder={placeholder}
                    onKeyDown={(e) => onKeyDown && onKeyDown(e)}
                />
            </label>
        </div>
    );
};

export default Input;