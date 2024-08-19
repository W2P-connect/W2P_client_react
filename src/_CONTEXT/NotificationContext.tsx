import React, { createContext, useState, useContext, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

// Type for the notification data
export interface Notification {
    id: string;
    error: boolean;
    title: string;
    content: string;
    infinit?: boolean;
    ended?: boolean;
}

// Type for the notification context
export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notificationData: Partial<Omit<Notification, "id">>) => number;
}

// Create the context with a default value
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationContextProviderProps {
    children: ReactNode;
}

function NotificationContextProvider({ children }: NotificationContextProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const emptyContent: Notification = {
        id: "",
        error: false,
        title: "",
        content: "",
        infinit: false,
        ended: false,
    };

    /**
     * Add a new notification
     * @param {Partial<Omit<Notification, "id">>} notificationData The notification data without the `id`
     * @returns {number} The index of the newly added notification
     */
    const addNotification = (notificationData: Partial<Omit<Notification, "id">>): number => {
        const newNotification: Notification = {
            ...emptyContent,
            ...notificationData,
            id: uuidv4(),
        };
        setNotifications(prevNotifications => [
            ...prevNotifications,
            newNotification,
        ]);
        return notifications.length;
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export default NotificationContextProvider;

