import React, { createContext, useState } from "react"

/**
 * use addPopupContent() to add popup content.
 * use showPopup() to show or hide popup
 */
export const PopupContext = createContext()

function PopupContextProvider(props) {
    // MAIN POPUP
    const [togglePopup, setTogglePopup] = useState(false)
    const [popupContent, setPopupContent] = useState({
        content: "",
        maxWidth: "1220px"
    })

    /**
     *
     * @param {Boolean} toggle true or false to show or hide the popup
     * @param {String} maxWidth width of the popup as css property ex: '1200px'
     */
    const showPopup = (toggle) => {
        if (toggle === true) {
            document.getElementsByTagName("body")[0].style.overflowY = "hidden"
        } else {
            document.getElementsByTagName("body")[0].style.overflowY = "auto"
        }
        setTogglePopup(toggle)
        /* Suppression du contenu si masque de la popup */
        !toggle &&
            setTimeout(() => {
                setPopupContent("")
            }, 250)
    }

    const addPopupContent = (content, maxWidth = "1220px") => {
        showPopup(true)
        setPopupContent({ content: content, maxWidth: maxWidth })
    }

    return (
        <PopupContext.Provider
            value={{
                togglePopup,
                showPopup,
                popupContent,
                addPopupContent,
            }}
        >
            {props.children}
        </PopupContext.Provider>
    )
}

export default PopupContextProvider