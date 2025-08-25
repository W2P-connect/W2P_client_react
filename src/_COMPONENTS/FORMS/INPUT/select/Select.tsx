import { useEffect, useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { classNames } from 'utils/helpers'
import { set } from 'lodash'


interface Option {
    id: number | string
    value: number | string
    label: string
    description?: string
}

interface SelectProps {
    options: Option[]
    defaultOption?: Option
    onSelect?: (value: number | string) => void
    label?: string
    value?: string | null | number
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
    defaultOption
}: SelectProps) {
    const [selected, setSelected] = useState<Option | null>(null)

    useEffect(() => {

        const next =
            value !== null && value !== undefined
                ? options.find(o => o.value === value) ?? null
                : null;

        setSelected(next ?? defaultOption ?? null);
    }, [value, options]);

    const selectOption = (option: Option) => {
        setSelected(option);               // update interne
        onSelect?.(option.value);          // notify parent (action utilisateur)
    };


    return (
        <Listbox value={selected} onChange={selectOption}>
            {({ open }) => (
                <div className={className}>
                    {label
                        ? <Label className="block mb-2 font-medium text-gray-900 text-sm leading-6">{label}</Label>
                        : null
                    }
                    <div className={"relative"}>
                        <ListboxButton className="relative bg-white shadow-sm py-1.5 pr-10 pl-3 ring-1 ring-gray-300 ring-inset w-full text-gray-900 sm:text-sm text-left sm:leading-6 pointer">
                            {selected?.label ?? selected?.value}
                            <span className="right-0 absolute inset-y-0 flex items-center ml-3 pr-2 pointer-events-none">
                                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </ListboxButton>

                        <Transition show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <ListboxOptions className="z-[9999] absolute bg-white ring-opacity-5 shadow-lg mt-1 p-1 rounded-md focus:outline-none ring-1 ring-black w-full max-h-56 overflow-auto sm:text-sm text-base">
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
