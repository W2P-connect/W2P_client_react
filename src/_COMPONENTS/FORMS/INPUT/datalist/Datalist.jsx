import React, { useEffect, useState, useRef } from "react"
import Input from "../input/Input"
import './datalist.css'

/**
 *
 * @param {placeholder} placeholder (optional) placeholder of the input
 * @param {Array<object>} items items in the datalist: Array of object with the forma {id: 'id', value: 'value'}
 * @param {Function} onSelect callback to set the item.id value if user select a value item in the list
 * @param {Array} customParameters Custum paramaters added on the onSelect function
 * @param {Function} onInput (optional) function to execute when writing on input
 * @param {String} value (requird if onInput) value of the input
 * @param {Boolean} required is field required
 * @param {String} width (optional) width of the all element (label + input)
 * @param {String} inputWidth (optional) width of the iinput element
 * @returns
 */
export default function Datalist({
    label,
    placeholder,
    items,
    onSelect,
    defaultId = null,
    customParameters = [],
    onInput,
    value = "",
    required,
    width,
    style = {},
    inputWidth,
    disabled = false,
}) {
    const [inputValue, setInputValue] = useState(value)
    const [dataListDefaultId, setdataListDefaultId] = useState(defaultId)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    useEffect(() => {
        onSelect && onSelect(...customParameters, dataListDefaultId) //Attention boucle infini
    }, [dataListDefaultId])

    //A tester
    useEffect(() => {
        if (items && dataListDefaultId) {
            const defaultItem = items.find(item => item.id === dataListDefaultId);
            defaultItem && setInputValue(defaultItem.value)
            defaultItem && setdataListDefaultId(defaultItem.id)
        }
    }, [items])

    useEffect(() => {
        if (inputValue) {
            const associatedId = items
                ? items.filter((item) => item.value === inputValue)
                : ""
            if (associatedId.length > 0) {
                onSelect && onSelect(...customParameters, associatedId[0].id)
            }
        } else {
            setdataListDefaultId(null)
            onSelect && onSelect(...customParameters, '')
        }
    }, [inputValue])

    const datalistRef = useRef(null);

    const updateInputValue = (value) => {
        setInputValue(value)
        onInput && onInput(...customParameters, value)
    }

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [filteredItems, setFilteredItems] = useState(items);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prevIndex => (prevIndex === null || prevIndex === 0) ? filteredItems.length - 1 : prevIndex - 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prevIndex => (prevIndex === null || prevIndex === filteredItems.length - 1) ? 0 : prevIndex + 1);
        } else if (e.key === 'Enter') {
            if (selectedIndex !== null) {
                e.preventDefault();
                updateInputValue(filteredItems[selectedIndex].value)
            }
        }
    };

    useEffect(() => {
        setSelectedIndex(null);
        setFilteredItems(items
            .filter(item => inputValue ? item.value.toLowerCase().includes(inputValue.toLowerCase()) : true)
        )
    }, [inputValue, items]);


    useEffect(() => {
        // Scroll into view when selectedIndex changes
        if (selectedIndex !== null && datalistRef.current) {
            const selectedElement = datalistRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className="w2p-datalist-container" style={width ? { ...style, width } : style}>
            <div style={{ position: "relative", zIndex: 100 }}>
                <Input
                    onInput={updateInputValue}
                    value={inputValue}
                    placeholder={placeholder}
                    label={label}
                    style={inputWidth ? { width: inputWidth } : { width: '100%' }}
                    required={required}
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="w2p-datalist" ref={datalistRef}>
                {filteredItems &&
                    filteredItems
                        .map((item, index) =>
                            <div
                                key={index}
                                data-customvalue={item.id}
                                onClick={_ => updateInputValue(item.value)}
                                dangerouslySetInnerHTML={{ __html: item.value }}
                                className={index === selectedIndex ? 'selected' : ''}
                            />
                        )}
            </div>
        </div>
    )
}
