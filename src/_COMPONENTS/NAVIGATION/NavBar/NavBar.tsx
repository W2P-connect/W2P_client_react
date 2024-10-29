import React, { useState, useEffect, ReactNode } from 'react'
import './navBar.css'

/**
 * 
 * @param {Array} items Exemple:  [{ label: 'Label', active: true, onClick: setCurrentCategory, value: null }, ...]
 * active: default active item
 * onClick: callBack when item clicked
 * value: value to send in the callBack when clicked
 * @returns 
 */

export interface Item {
    label: string;
    onClick: (value: any) => void;
    active: boolean;
    value: string | ReactNode;
}

interface Props {
    items: Item[]
}
export default function NavBar({ items }: Props) {

    const [usedItems, setUsedItems] = useState<Item[]>(items)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        if (activeIndex !== null) {
            setUsedItems(
                items.map((itm: Item, index: number) => activeIndex === index
                    ? { ...itm, active: true }
                    : { ...itm, active: false }
                )
            )
        }
    }, [items, activeIndex])

    const navigate = (item: Item, index: number) => {
        item.onClick(item)
        setActiveIndex(index)
    }

    useEffect(() => {
        const defaultActiveItem = items.find(p => p.active)
        defaultActiveItem
            && defaultActiveItem.onClick(defaultActiveItem)
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