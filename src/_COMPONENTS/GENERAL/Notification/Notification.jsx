import React, { useContext, useEffect, useState, useRef } from "react"
import "./Notification.css"

export default function Notification({ notificationContent }) {


  const [notification, setNotification] = useState(null)

  useEffect(() => {
    setNotification(notificationContent)
  }, [])

  const [showNotification, setShowNotification] = useState(true)
  const [notificationClass, setNotificationClass] = useState('')

  const timeoutHandle = useRef(0)
  useEffect(() => {
    if (notification) {
      clearTimeout(timeoutHandle.current)
      if (!notification.infinit) {
        timeoutHandle.current = setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      }
    }
  }, [notification]);


  useEffect(() => {
    let classes = "notification pointer"
    if (notification) {
      if (notification.error) classes += " wp2-error"
      if (notification.hide) classes += " hidden-overlapping-element"
    }
    setNotificationClass(classes)
  }, [notification])

  useEffect(() => {
    if (!showNotification && notification && !notification.hide) {
      setNotification(notif => ({ ...notif, hide: true }))
      setTimeout(() => {
        setNotification(notif => ({ ...notif, ended: true }))
      }, 200)
    }
  }, [showNotification, notification])
  return (
    <>
      {notification && !notification.ended && (notification.content || notification.title)
        ? <div className={notificationClass} onClick={_ => setShowNotification(false)}>
          {notification.title
            ? <div className="flex notification-header pointer">
              <div className="notification-title">{notification.title}</div>
            </div>
            : null
          }
          <div className="notification-content">{notificationContent.content}</div>
        </div>
        : null}
    </>
  )
}
