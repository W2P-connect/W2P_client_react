import React, { createContext, useState } from "react"
import { v4 as uuidv4 } from 'uuid';

/**
 * use addNotification() to show a notification
     * @param {object} content Contenu de la notification sous forme de JSON {error: boolean, title: string, content: string}
 */

export const NotificationContext = createContext()

function NotificationContextProvider(props) {
    const [notifications, setNotifications] = useState([])
    const emptyContent = {
        id: null,
        error: false,
        title: "",
        content: "",
        infinit: false,
        ended: false,
    }

    /**
     * @param {object} content Contenu de la notification sous forme de JSON {error: boolean, title: string, content: string}
     */
    const addNotification = (notificationData) => {
        setNotifications(prvNotifications => [
            ...prvNotifications,
            {
                ...emptyContent,
                ...notificationData,
                id: uuidv4()
            },
        ])
        return notifications.length
    }

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
            }}
        >
            {props.children}
        </NotificationContext.Provider>
    )
}

export default NotificationContextProvider
