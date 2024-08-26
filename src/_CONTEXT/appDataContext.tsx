import React, { createContext } from 'react';
import { useCallApi } from '../helpers';
import { translate } from 'translation';
import { Hook, HookField, Parameters } from 'Types';
import { useNotification } from './hook/contextHook';
import { appDataStore } from '_STORES/AppData';

export interface AppDataContextType {
    saveParameters: (e?: React.FormEvent, parameters?: Parameters, notification?: boolean) => Promise<void>;
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

    const saveParameters = async (e: React.FormEvent | null = null, parameters: Parameters | null = null, notification = false) => {
        e && e.preventDefault();
        // if (JSON.stringify(formatParameters(appDataInit.parameters)) === JSON.stringify(formatParameters(appData.parameters))) {
        //     notification && addNotification({
        //         error: false,
        //         content: translate("Already up to date"),
        //     });
        //     return;
        // }
        try {
            const res = await callApi(`${appDataStore.appData.w2p_client_rest_url}/parameters`, { method: "put" }, null, appDataStore.appData.parameters, e);
            notification && addNotification({
                content: translate(res?.data.message),
            });
        } catch (error: any) {
            console.log(error);
            notification && addNotification({
                error: true,
                content: translate(error.response.data.message),
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
