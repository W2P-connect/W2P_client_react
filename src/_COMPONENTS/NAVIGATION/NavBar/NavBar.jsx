import React, { useState, useEffect } from 'react'
import './navBar.css'

/**
 * 
 * @param {Array} items Exemple:  [{ label: 'Label', active: true, onClick: setCurrentCategory, value: null }, ...]
 * active: default active item
 * onClick: callBack when item clicked
 * value: value to send in the callBack when clicked
 * @returns 
 */

export default function NavBar({ items }) {

    const [usedItems, setUsedItems] = useState(items)
    const [activeIndex, setActiveIndex] = useState(null)

    useEffect(() => {
        if (activeIndex !== null) {
            setUsedItems(
                items.map((itm, index) => activeIndex === index
                    ? { ...itm, active: true }
                    : { ...itm, active: false }
                )
            )
        }
    }, [items, activeIndex])

    const navigate = (item, index) => {
        item.onClick(item.value)
        setActiveIndex(index)
    }

    useEffect(() => {
        const defaultActiveItem = items.find(p => p.active)
        defaultActiveItem
            && defaultActiveItem.onClick(defaultActiveItem.value)
    }, [])

    return (
        <div className="w2p-nav-section">
            {usedItems.map((item, index) =>
                <div
                    key={index}
                    onClick={_ => navigate(item, index)}
                    className={`w2p-navigation-button ${item.active ? "active" : ""}`}>
                    {item.label}
                </div>
            )}
        </div>
    )
}