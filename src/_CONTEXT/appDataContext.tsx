import React, { createContext } from 'react';
import { useCallApi } from '../helpers';
import { translate } from 'translation';
import { Hook, HookField, Parameters } from 'Types';
import { useNotification } from './hook/contextHook';
import { appDataStore } from '_STORES/AppData';
import { hookStore } from '_STORES/Hooks';
import { isAxiosError } from 'axios';

export interface AppDataContextType {
    saveParameters: (e?: React.FormEvent, notification?: boolean) => Promise<void>;
    apiTest: (e?: React.FormEvent) => void;
}


export const formatHook = (hook: Hook) => {
    const formatedHook = { ...hook }
    formatedHook.fields = formatedHook.fields.filter((field: HookField) =>
        field.enabled &&
        (field.value !== undefined
            && (Array.isArray(field.value)
                ? field.value.length > 0
                : field.value !== 0)
        ));

    return formatedHook
}

export const formatParameters = (parameters: Parameters) => {

    const formatedParameters = { ...parameters }
    formatedParameters.w2p.hookList =
        formatedParameters.w2p.hookList
            .filter(hook => hook.fields.length)
            .map(hook => formatHook(hook))
    return formatedParameters
}

function AppDataContextProvider(props: { children: React.ReactNode }) {
    const { addNotification } = useNotification();
    const callApi = useCallApi();

    const saveParameters = async (e: React.FormEvent | null = null, notification = true) => {
        e && e.preventDefault();

        if (
            JSON.stringify(appDataStore.initAppData.parameters) !==
            JSON.stringify((appDataStore.getAppData().parameters))
        ) {
            const newParameters = { parameters: appDataStore.getAppData().parameters }

            try {
                const res = await callApi(`${appDataStore.appData.w2p_client_rest_url}/parameters`, { method: "put" }, null, newParameters, e);
                notification && addNotification({
                    error: false,
                    content: translate(res?.data.message),
                });
                res?.data.token && appDataStore.setAppData({ ...appDataStore.appData, token: res?.data.token })
                appDataStore.setInitAppData(appDataStore.getAppData())
            } catch (error: unknown) {
                console.log(error);
                if (isAxiosError(error)) {
                    notification &&
                        addNotification({
                            error: true,
                            content: translate(error.response?.data.message),
                        });
                } else {
                    notification && addNotification({
                        error: true,
                        content: translate("An unknown error appeared"),
                    });
                }
            }
        } else {
            notification && addNotification({
                error: false,
                content: translate("Settings already up to date"),
            });
        }
    };

    const apiTest = (e: React.FormEvent | null = null) => {
        e && e.preventDefault();
        callApi(`${appDataStore.appData.w2p_client_rest_url}/tests`, { method: "get" }, null, null, e);
    };

    return (
        <AppDataContext.Provider value={{
            saveParameters,
            apiTest,
        }}>
            {props.children}
        </AppDataContext.Provider>
    );
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export default AppDataContextProvider;
