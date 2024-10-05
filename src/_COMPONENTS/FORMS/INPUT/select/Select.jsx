import { Component, useEffect, useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
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
    // required = false,
}) {
    const [selected, setSelected] = useState(null)


    useEffect(() => {
        if (value) {
            const option = options.find(option => option.value === value)
            selectOption(option ? option : options[0])
        } else {
            selectOption(options[0])
        }
    }, [])

    const selectOption = (option) => {
        setSelected(option)
        onSelect && onSelect(option.value)
    }

    return (
        <Listbox value={selected} onChange={selectOption}>
            {({ open }) => (
                <div className={className}>
                    {label
                        ? <Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Label>
                        : null
                    }
                    <div className="relative mt-2">
                        <ListboxButton className="pointer relative w-full bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6">
                            {selected?.label ?? selected?.value}
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </ListboxButton>

                        <Transition show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <ListboxOptions className="absolute p-1 z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                                <div className="flex items-start justify-between">
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
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
