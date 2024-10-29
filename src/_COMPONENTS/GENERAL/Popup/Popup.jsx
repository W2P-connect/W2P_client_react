import React, { useContext } from "react"
import "./popup.css"
import { PopupContext } from "../../../_CONTEXT/PopupContext"


export default function Popup(props) {

  const { togglePopup, showPopup, popupContent } = useContext(PopupContext)

  const hidePopup = e => {
    e.target.classList.contains("overlay")
      && showPopup(false)
  }

  return (
    <>
      {togglePopup
        ? <div
          className={`overlay ${togglePopup ? "" : "hidden-overlapping-element"}`}
          onClick={e => hidePopup(e)}
        >
          <div className="popup" style={{ maxWidth: popupContent.maxWidth }}>
            {popupContent.content}
          </div>
        </div >
        : null
      }
    </>
  )
}