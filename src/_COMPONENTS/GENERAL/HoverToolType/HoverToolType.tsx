import React from 'react'

type Props = {
    content: React.ReactNode
    toolTip: React.ReactNode
}
export default function HoverToolType({ content, toolTip }: Props) {
    return (
        <div className="group inline-block relative">
            <span
                className="cursor-help select-none"
                aria-describedby="no-value-tooltip"
            >
                {content}
            </span>

            <div
                id="no-value-tooltip"
                role="tooltip"
                className="left-1/2 z-50 absolute bg-gray-900 opacity-0 group-hover:opacity-100 shadow-lg mt-2 px-2.5 py-1.5 rounded-md w-max max-w-xs text-white text-xs transition-opacity -translate-x-1/2 duration-150 pointer-events-none"
            >
                {toolTip}
                <div className="-top-1 left-1/2 absolute bg-gray-900 w-2 h-2 rotate-45 -translate-x-1/2"></div>
            </div>
        </div>
    )
}
