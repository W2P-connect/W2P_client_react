import React, { createContext, useState, useEffect } from 'react';
import Parameters from '../_CONTAINERS/Parameters/Parameters';
import Orders from '../_CONTAINERS/Orders/Orders';
import History from '../_CONTAINERS/History/History';

import General from '../_CONTAINERS/Parameters/SubMenu/General/General';
import Persons from '../_CONTAINERS/Parameters/SubMenu/Persons';
import Organizations from '../_CONTAINERS/Parameters/SubMenu/Organizations';
import Deals from '../_CONTAINERS/Parameters/SubMenu/Deals';
// import Connexion from './S './SubMenu/FieldCategory'

export const MenuContext = createContext();

function MenuContextProvider(props) {
    //Default Menu Link
    const [menuContent, setMenuContent] = useState(null);
    const [currentMenu, setCurrentMenu] = useState(null);
    const [currentSubMenuContent, setCurrentSubMenuContent] = useState(null);
    const [currentSubMenu, setCurrentSubMenu] = useState(null);

    const componentsMap = {
        settings: Parameters,
        orders: Orders,
        history: History,
        general: General,
        persons: Persons,
        organizations: Organizations,
        deals: Deals,
    };


    useEffect(() => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const menu = params.get("menu") ?? "settings"

        url.searchParams.set('menu', menu);
        window.history.pushState({}, '', url);

        const ComponentToRender = componentsMap[menu.toLowerCase()];

        if (ComponentToRender) {
            setMenuContent(<ComponentToRender />);
        } else {
            setMenuContent(<div>Component not found</div>);
        }

        menu && setCurrentMenu(menu)

    }, [])

    useEffect(() => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const submenu = params.get("submenu")

        submenu && setCurrentSubMenuPage(submenu)
    }, [])

    const setCurrentMenuPage = (menu, subMenu = null) => {
        const url = new URL(window.location.href);
        url.searchParams.set('menu', menu);
        window.history.pushState({}, '', url);

        const ComponentToRender = componentsMap[menu.toLowerCase()];

        if (ComponentToRender) {
            setMenuContent(<ComponentToRender />);
        } else {
            setMenuContent(<div>Component not found</div>);
        }

        setCurrentMenu(menu)
        setCurrentSubMenuPage(subMenu)
    };

    const setCurrentSubMenuPage = (subMenu) => {
        const url = new URL(window.location.href);
        if (subMenu) {
            url.searchParams.set('submenu', subMenu);
            const ComponentToRender = componentsMap[subMenu.toLowerCase()];

            if (ComponentToRender) {
                setCurrentSubMenuContent(prv => <ComponentToRender />);
            } else {
                setCurrentSubMenuContent(prv => <div>Component not found</div>);
            }

            setCurrentSubMenu(subMenu)
        } else {
            setCurrentSubMenu(null)
            url.searchParams.delete('submenu');
        }

        window.history.pushState({}, '', url);
    };




    return (
        <MenuContext.Provider value={{
            currentMenu, menuContent, setCurrentMenuPage,
            currentSubMenu, setCurrentSubMenuPage, currentSubMenuContent,
        }}>
            {menuContent && props.children}
        </MenuContext.Provider>
    );
}

export default MenuContextProvider;