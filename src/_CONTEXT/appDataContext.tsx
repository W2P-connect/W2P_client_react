import React, { createContext } from 'react';
import { deepCopy, useCallApi } from '../helpers';
import { translate } from 'translation';
import { Hook, HookField, Parameters, ParametersForBackend } from 'Types';
import { useNotification } from './hook/contextHook';
import { appDataStore } from '_STORES/AppData';
import { isAxiosError } from 'axios';

export interface AppDataContextType {
    saveParameters: (e?: React.FormEvent | null, notification?: boolean) => Promise<void>;
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

function AppDataContextProvider(props: { children: React.ReactNode }) {
    const { addNotification } = useNotification();
    const callApi = useCallApi();

    const saveParameters = async (e: React.FormEvent | null = null, notification = true) => {
        e && e.preventDefault();

        if (
            JSON.stringify(appDataStore.initAppData.parameters) !==
            JSON.stringify((appDataStore.getAppData().parameters))
        ) {

            const newParameters: ParametersForBackend = {
                ...appDataStore.getAppData().parameters,
                w2p: {
                    ...appDataStore.getAppData().parameters.w2p,
                    hookList: appDataStore.getAppData().parameters.w2p.hookList.map(hook => ({
                        ...hook,
                        fields: hook.fields.map(field => ({
                            ...field,
                            pipedrive: undefined // ou simplement ne pas inclure `pipedrive`
                        }))
                    }))
                }
            };

            newParameters.w2p.hookList = newParameters.w2p.hookList.map(hook => ({
                ...hook,
                fields: hook.fields
                    .filter(field => field.enabled || field.value)
            }))
            newParameters.w2p.hookList = newParameters.w2p.hookList.filter(hook => hook.enabled || (hook.fields && hook.fields.length))

            try {
                const res = await callApi(`${appDataStore.appData.w2pcifw_client_rest_url}/parameters`, { method: "put" }, null, { parameters: newParameters }, e);
                notification && addNotification({
                    error: false,
                    content: translate(res?.data.message),
                });
                res?.data.token && appDataStore.setAppData({ ...appDataStore.appData, token: res?.data.token })
                appDataStore.setInitAppData(deepCopy(appDataStore.getAppData()))
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

    return (
        <AppDataContext.Provider value={{
            saveParameters,
        }}>
            {props.children}
        </AppDataContext.Provider>
    );
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export default AppDataContextProvider;
