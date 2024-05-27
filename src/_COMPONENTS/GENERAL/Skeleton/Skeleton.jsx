import React from 'react'
import './skeleton.css'

export default function Skeleton({ width = '100%', height = "100px" }) {
    return (
        <div
            className="skeleton_container"
            style={{ width: width, height: height }}
        >
            <div className="card__skeleton card__description"></div>
        </div>
    )
}
