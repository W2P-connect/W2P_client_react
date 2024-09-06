import React, { useState, useEffect, ReactNode } from 'react'
import './openableComponent.css'

type Props = {
    children: ReactNode,
    stateOpen?: boolean,
    label?: boolean,
    openLabel?: string,
    closeLabel?: string,
    position?: ("center" | "left" | "right")
}

export default function OpenableComponent({
    children,
    stateOpen = false,
    label = true,
    openLabel = "",
    closeLabel = "",
    position = "center"
}: Props) {

    const [open, setOpen] = useState<boolean>(stateOpen)

    useEffect(() => {
        setOpen(stateOpen)
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
