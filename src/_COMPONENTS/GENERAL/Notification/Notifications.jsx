import React, { useContext } from 'react'
import { NotificationContext } from '../../../_CONTEXT/NotificationContext'
import Notification from './Notification'
import "./Notification.css"


export default function Notifications() {

    const { notifications } = useContext(NotificationContext)
    return (
        <div className='notification-container gap-1'>
            {notifications
                .map((notification) =>
                    <Notification
                        key={notification.id}
                        notificationContent={{ ...notification}}
                    />
                )}
        </div>
    )
}
