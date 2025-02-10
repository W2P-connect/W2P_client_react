import { Component, useEffect, useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { classNames } from 'helpers'


interface Option {
    id: number
    value: string
    label: string
    description?: string
}

interface SelectProps {
    options: Option[]
    onSelect?: (value: string) => void
    label?: string
    value?: string | null
    className?: string
}

/**
 * 
 * @param {Array} options array like [{id: number, value: string, label: string, description: string}]  description is optionnal
 * @returns {Component} react component 
 */

export default function Select({
    options = [],
    onSelect,
    label = '',
    value = null,
    className = "",
}: SelectProps) {
    const [selected, setSelected] = useState<Option | null>(null)

    useEffect(() => {
        if (value) {
            const option = options.find(option => option.value === value);
            if (option && option.value !== selected?.value) {
                selectOption(option);
            }
        } else if (options.length && options[0].value !== selected?.value) {
            selectOption(options[0]);
        }
    }, [value, options]);
    

    const selectOption = (option: Option | undefined) => {
        if (option) {
            setSelected(option)
            onSelect && onSelect(option.value)
        }
    }

    return (
        <Listbox value={selected} onChange={selectOption}>
            {({ open }) => (
                <div className={className}>
                    {label
                        ? <Label className="block font-medium text-gray-900 text-sm leading-6">{label}</Label>
                        : null
                    }
                    <div className="relative mt-2">
                        <ListboxButton className="relative bg-white shadow-sm py-1.5 pr-10 pl-3 ring-1 ring-gray-300 ring-inset w-full text-gray-900 sm:text-sm text-left sm:leading-6 pointer">
                            {selected?.label ?? selected?.value}
                            <span className="right-0 absolute inset-y-0 flex items-center ml-3 pr-2 pointer-events-none">
                                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </ListboxButton>

                        <Transition show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <ListboxOptions className="z-10 absolute bg-white ring-opacity-5 shadow-lg mt-1 p-1 rounded-md focus:outline-none ring-1 ring-black w-full max-h-56 overflow-auto sm:text-sm text-base">
                                {options.map((option, index) => (
                                    <ListboxOption
                                        key={index}
                                        className={({ focus }) =>
                                            classNames(
                                                focus ? 'bg-secondary text-white' : '',
                                                !focus ? 'text-gray-900' : '',
                                                'relative rounded cursor-default select-none py-2 pl-3'
                                            )
                                        }
                                        value={option}
                                    >
                                        {({ selected, focus }) => (
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span
                                                            className={classNames(
                                                                selected
                                                                    ? 'font-semibold'
                                                                    : 'font-semibold', 'block truncate'
                                                            )}
                                                        >
                                                            {option.label ?? option.value}
                                                        </span>
                                                    </div>

                                                    {selected ? (
                                                        <span
                                                            className={classNames(
                                                                focus ? 'text-white' : 'text-secondary',
                                                                'inset-y-0 right-0 flex items-center pr-2'
                                                            )}
                                                        >
                                                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className={classNames(
                                                    focus ? 'text-white' : 'text-fith',
                                                    'pr-9 text-sm'

                                                )}>{option.description}</div>
                                            </div>
                                        )}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Transition>
                    </div>
                </div>
            )}
        </Listbox>
    )
}
