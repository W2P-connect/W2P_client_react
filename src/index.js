import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import PopupContextProvider from './_CONTEXT/PopupContext';
import MenuContextProvider from './_CONTEXT/MenuContext';
import NotificationContextProvider from './_CONTEXT/NotificationContext';
import AppDataContextProvider from './_CONTEXT/appDataContext';
import { AppLocalizerProvider } from './_CONTEXT/AppLocalizerContext';
import axios from 'axios'

// Render the app inside our shortcode's #app div
document.addEventListener('DOMContentLoaded', async () => {

    const appLocalizer = await axios(`http://w2p-bis.local/wp-json/w2p/v1/applocalizer`)

    console.log("appLocalizer", appLocalizer);

    const element = document.getElementById('w2p-app');
    if (typeof element !== 'undefined' && element !== null && appLocalizer.data?.data) {
        ReactDOM.render(
            <AppLocalizerProvider value={appLocalizer.data.data}>
                <NotificationContextProvider>
                    <AppDataContextProvider>
                        <MenuContextProvider>
                            <PopupContextProvider>
                                <App />
                            </PopupContextProvider>
                        </MenuContextProvider>
                    </AppDataContextProvider>
                </NotificationContextProvider>
            </AppLocalizerProvider>,
            document.getElementById('w2p-app'),
        );
    }
});