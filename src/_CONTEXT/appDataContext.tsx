import React, { createContext, useState, useContext, useEffect } from 'react';
import set from 'lodash/set.js';
import { useCallApi, deepMerge, deepCopy } from '../helpers';
import { translate } from '../translation';
import { NotificationContext } from './NotificationContext';
import { useAppLocalizer } from './AppLocalizerContext';
import { Hook } from '../_CONTAINERS/Parameters/parametersHelpers';

export const AppDataContext = createContext();


export const emptyLocalizer = {
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
        }
    }
}

export const formatHook = (hook) => {
    const formatedHook = { ...hook }
    formatedHook.fields = formatedHook.fields.filter(field =>
        field.enabled &&
        (field.value !== undefined
            && (Array.isArray(field.value)
                ? field.value.length > 0
                : field.value !== '')));

    return formatedHook
}

export const formatParameters = (parameters) => {

    const formatedParameters = { ...parameters }
    formatedParameters.w2p.hookList =
        formatedParameters.w2p.hookList
            .filter(hook => hook.fields.length)
            .map(hook => formatHook(hook))
    return formatedParameters
}

function AppDataContextProvider(props) {

    const { addNotification } = useContext(NotificationContext)
    const appLocalizer = useAppLocalizer()
    const [appData, setAppData] = useState({ ...emptyLocalizer });

    const [appDataInit, setAppDataInit] = useState({ ...emptyLocalizer }); //Only to check changes

    const callApi = useCallApi()

    useEffect(() => {
        const appData = deepMerge(deepCopy(emptyLocalizer), appLocalizer)
        setAppData(_ => appData)
        setAppDataInit(_ => appData)
    }, [])

    // useEffect(() => {
    //     console.log('appData', appData);
    // }, [appData])

    const updateAppDataKey = (keyPath, value) => {
        setAppData(prevAppData => {
            const newAppData = { ...prevAppData };
            set(newAppData, keyPath, value);
            return newAppData;
        });
    }

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
    ]

    // useEffect(() => {
    //     console.log(appData);
    // }, [appData])


    const saveParameters = async (e = null, parameters = null, notification = false) => {
        e && e.preventDefault()
        if (JSON.stringify(formatParameters(appDataInit.parameters)) === JSON.stringify(formatParameters(parameters ?? appData.parameters))) {
            notification && addNotification({
                error: false,
                content: translate("Already up to date")
            })
            return
        }
        callApi(`${appData.w2p_client_rest_url}/parameters`, { method: "put" }, null, { parameters: formatParameters(parameters ?? appData.parameters) }, e)
            .then(res => {
                notification && addNotification({
                    content: translate(res.data.message)
                })
                setAppDataInit(_ => ({ ...appData }))
            })
            .catch(error => {
                console.log(error);
                notification && addNotification({
                    error: true,
                    content: translate(error.response.data.message)
                })
            })
    }

    const apiTest = (e = null) => {
        e && e.preventDefault()
        callApi(`${appData.w2p_client_rest_url}/tests`, { method: "get" }, null, null, e)
        // .then(res => {
        //     addNotification({
        //         content: translate(res.data.message)
        //     })
        // })
        // .catch(error => {
        //     console.log(error);
        //     addNotification({
        //         error: true,
        //         content: translate(error.response.data.message)
        //     })
        // })
    }

    return (
        <AppDataContext.Provider value={{
            appData,
            appDataInit,
            setAppData,
            updateAppDataKey,
            saveParameters,
            apiTest,
            fieldsCategory
        }}>
            {props.children}
        </AppDataContext.Provider>
    );
}

export default AppDataContextProvider;