import React, { useState, useEffect } from 'react'
import './openableComponent.css'

export default function OpenableComponent({
    children,
    stateOpen = null,
    label = true,
    openLabel = "",
    closeLabel = "",
    position = "center"
}) {

    const [open, setOpen] = useState(stateOpen !== null ? stateOpen : false)

    useEffect(() => {
        stateOpen !== null && setOpen(stateOpen)
    }, [stateOpen])

    return (
        <div className={`openable ${open ? "" : 'closed'} ${label ? "" : 'no-label'}`}>
            {
                label
                    ? openLabel
                        ? <div
                            className={`open-label ${position} pointer`}
                            onClick={() => setOpen(!open)}
                        >
                            {!open ? openLabel : closeLabel ? closeLabel : openLabel}
                        </div>
                        : <div className={`arrow center ${open && 'rotate-arrow'}`} onClick={() => setOpen(!open)}>▼</div>
                    : null
            }
            {children}
        </div >
    )
}
