import React, { createContext, useState, useContext, useEffect } from 'react';
import set from 'lodash/set.js';
import { useCallApi, deepMerge, deepCopy } from '../helpers';
import { translate } from 'translation';
import { useAppLocalizer } from './AppLocalizerContext';
import { AppData, Hook, HookField, Parameters } from 'Types';
import { useNotification } from './hook/contextHook';

export interface AppDataContextType {
    appData: AppData;
    appDataInit: AppData;
    setAppData: React.Dispatch<React.SetStateAction<AppData>>;
    updateAppDataKey: (keyPath: string, value: any) => void;
    saveParameters: (e?: React.FormEvent, parameters?: Parameters, notification?: boolean) => Promise<void>;
    apiTest: (e?: React.FormEvent) => void;
    fieldsCategory: { slug: string, name: string }[];
}

export const emptyLocalizer: AppData = {
    parameters: {
        pipedrive: {
            api_key: "",
            company_domain: "",
            users: [],
            stages: [],
            organizationFields: [],
            personFields: [],
            dealFields: [],
        },
        w2p: {
            domain: "w2p-bis.local",
            api_key: "1a5f8cf17e1207f3",
            hookList: [],
            deals: {
                amountsAre: null,
                createNew: true,
                searchBeforeCreate: true,
            },
            organizations: {
                autoCreate: false,
                searchBeforeCreate: true,

            },
            persons: {
                linkToOrga: true,
                defaultEmailAsName: true,
            },
        },
    },
    CONSTANTES: {
        W2P_AVAIBLE_STATES: ["INVALID", "TODO", "SENDED", "ERROR", "DONE"],
        W2P_HOOK_LIST: [],
        W2P_META_KEYS: [],
        W2P_REQUIRED_FIELDS: {
            deal: [],
            organization: [],
            person: [],
        }
    },
    w2p_client_rest_url: '',
    w2p_distant_rest_url: '',
    token: '',
}

export const formatHook = (hook: Hook) => {
    const formatedHook = { ...hook }
    formatedHook.fields = formatedHook.fields.filter((field: HookField) =>
        field.enabled &&
        (field.value !== undefined
            && (Array.isArray(field.value)
                ? field.value.length > 0
                : field.value !== '')
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
    const appLocalizer = useAppLocalizer();
    const [appData, setAppData] = useState<AppData>({ ...emptyLocalizer });
    const [appDataInit, setAppDataInit] = useState<AppData>({ ...emptyLocalizer }); // Only to check changes
    const callApi = useCallApi();

    useEffect(() => {
        const initialAppData: AppData = deepMerge(deepCopy(emptyLocalizer), appLocalizer) as AppData;
        setAppData(initialAppData);
        setAppDataInit(initialAppData);
    }, [appLocalizer]);

    const updateAppDataKey = (keyPath: string, value: any) => {
        setAppData(prevAppData => {
            const newAppData = { ...prevAppData };
            set(newAppData, keyPath, value);
            return newAppData;
        });
    };

    const fieldsCategory = [
        {
            slug: "organization",
            name: "Organizations fields",
        },
        {
            slug: "person",
            name: "Persons fields",
        },
        {
            slug: "deal",
            name: "Deals fields",
        },
    ];

    const saveParameters = async (e: React.FormEvent | null = null, parameters: Parameters | null = null, notification = false) => {
        e && e.preventDefault();
        if (JSON.stringify(formatParameters(appDataInit.parameters)) === JSON.stringify(formatParameters(appData.parameters))) {
            notification && addNotification({
                error: false,
                content: translate("Already up to date"),
            });
            return;
        }
        try {
            const res = await callApi(`${appData.w2p_client_rest_url}/parameters`, { method: "put" }, null, { parameters: formatParameters(parameters ?? appData.parameters) }, e);
            notification && addNotification({
                content: translate(res?.data.message),
            });
            setAppDataInit({ ...appData });
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
        callApi(`${appData.w2p_client_rest_url}/tests`, { method: "get" }, null, null, e);
    };

    return (
        <AppDataContext.Provider value={{
            appData,
            appDataInit,
            setAppData,
            updateAppDataKey,
            saveParameters,
            apiTest,
            fieldsCategory,
        }}>
            {props.children}
        </AppDataContext.Provider>
    );
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export default AppDataContextProvider;
