import React from 'react';
import ReactDOM from 'react-dom/client'; // Mise à jour pour utiliser createRoot
import App from './App';
import PopupContextProvider from './_CONTEXT/PopupContext';
import MenuContextProvider from './_CONTEXT/MenuContext';
import NotificationContextProvider from './_CONTEXT/NotificationContext';
import AppDataContextProvider from './_CONTEXT/appDataContext';
import { AppLocalizerProvider } from './_CONTEXT/AppLocalizerContext';
import axios from 'axios';
import { appDataStore } from '_STORES/AppData';
import { deepMerge } from 'helpers';
import { hookStore } from '_STORES/Hooks';
import { AppData as AppDataType } from 'Types';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';

// Render the app inside our shortcode's #app div
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const appLocalizer = await axios.get(`http://w2p-bis.local/wp-json/w2p/v1/applocalizer`);

        const appData: AppDataType = appLocalizer.data.data;

        const appDataInit = deepMerge(appDataStore.emptyAppData, appData)

        appDataStore.setAppData(appDataInit);
        appDataStore.setInitAppData(appDataInit);

        hookStore.updateHookList(appDataInit.parameters.w2p.hookList);
        pipedriveFieldsStore.setPipedriveFields(appDataInit.parameters.pipedrive.fields)
        console.log("--INIT-- : appData.parameters", appData.parameters);


        const element = document.getElementById('w2p-app');
        if (element !== null && appLocalizer.data?.data) {
            const root = ReactDOM.createRoot(element);
            root.render(<div>
                <AppLocalizerProvider value={appData}>
                    <NotificationContextProvider>
                        <AppDataContextProvider>
                            <MenuContextProvider>
                                <PopupContextProvider>
                                    <App />
                                </PopupContextProvider>
                            </MenuContextProvider>
                        </AppDataContextProvider>
                    </NotificationContextProvider>
                </AppLocalizerProvider>
            </div>
            );
        }
    } catch (error) {
        console.error('Error loading app data:', error);
    }
});
