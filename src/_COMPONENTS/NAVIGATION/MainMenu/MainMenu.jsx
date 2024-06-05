import React, { useContext } from 'react'
import { MenuContext } from '../../../_CONTEXT/MenuContext'
import './mainMenu.css'
import { translate } from '../../../translation';

export default function MainMenu() {

    const { setCurrentMenuPage, currentMenu } = useContext(MenuContext)

    const subNavigate = (el, item) => {
        [...document.getElementsByClassName('main-menu-items')].forEach((button) => {
            button.classList.remove('active');
        });
        el.classList.add('active');
        if (item.uri) {
            window.location.href = item.uri;
        }
        item.slug && setCurrentMenuPage(item.slug, item.defaultSubmenu);
    };

    const menuItems = [
        {
            name: translate("Settings"),
            slug: "settings",
            active: currentMenu === "settings",
            defaultSubmenu: "general",
        },
        {
            name: translate("Orders"),
            slug: "orders",
            active: currentMenu === "orders",
        },
        {
            name: translate("History"),
            slug: "history",
            active: currentMenu === "history",
        },
    ]

    console.log(currentMenu);

    return (
        <>
            <div className="main-menu-container">
                {menuItems.map((item) => {
                    return <div key={item.name} onClick={(e) => subNavigate(e.target, item)} className={item.active ? "main-menu-items active" : "main-menu-items"}>{item.name}</div>
                })}
            </div>
        </>
    )
}
