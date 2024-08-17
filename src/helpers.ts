import { FormEvent, useContext } from "react"
import { NotificationContext } from "./_CONTEXT/NotificationContext"
import { translate } from "./translation"
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAppLocalizer } from './_CONTEXT/AppLocalizerContext';


/*************************************************************************************/
/************************************** CUSTOM HOOKS *********************************/
/*************************************************************************************/

export const useCallApi = () => {
    const appLocalizer = useAppLocalizer();
    const { addNotification } = useContext(NotificationContext);

    /**
     *
     * @param {string} url - URL of the endpoint for the request (required)
     * @param {AxiosRequestConfig} options - Object containing the options for the request (required)
     * @param {AbortSignal | null} abortSignal - AbortController's signal to cancel the request (optional)
     * @param {Object} data - Data to send in the request body (optional)
     * @param {React.FormEvent | null} e - Form event (optional)
     * @returns {Promise<AxiosResponse<any>> | null}
     */
    const callApi = async (
        url: string,
        options: AxiosRequestConfig = { method: 'get' },
        abortSignal: AbortSignal | null = null,
        data: Record<string, any> | null = {},
        e: React.FormEvent | null = null
    ): Promise<AxiosResponse<any> | null> => {
        if ((e && !e.currentTarget.classList.contains("submitting")) || !e) {
            e && e.currentTarget.classList.add("submitting");
            try {
                const APIoptions: AxiosRequestConfig = {
                    ...options,
                    headers: {
                        Authorization: `Bearer ${appLocalizer.token}`,
                        ...options.headers,
                    },
                    signal: abortSignal ?? undefined,
                    url: url,
                };

                if (options.method?.toLowerCase() === "get") {
                    APIoptions.params = data;
                } else {
                    APIoptions.data = data;
                }

                const response = await axios(APIoptions);
                return response;
            } catch (error: any) {
                if (error?.response?.status === 401 && url.startsWith(appLocalizer.w2p_client_rest_url)) {
                    addNotification({
                        error: true,
                        content: translate("You are not allowed to access this resource. Please refresh the page."),
                    });
                }
                return Promise.reject(error);
            } finally {
                e && e.currentTarget.classList.remove("submitting");
            }
        } else {
            return null;
        }
    };

    return callApi;
}

export const useCallPipedriveApi = () => {
    const callApi = useCallApi()
    const appLocalizer = useAppLocalizer()

    /**
     *
     * @param {String} url pipedrive URL to call
     * @param {Object} options options to pass to axions (exemple:   {method: 'get' })
     * @param {Object} data data to send for the request
     * @returns
     */
    const callPipedriveApi = (uri, options = { method: "get" }, abortSignal = null, data = null, e = null) =>
        new Promise(async (resolve, reject) => {
            const url = `https://${appLocalizer.parameters.pipedrive.company_domain}.pipedrive.com/v1/${uri}?api_token=${appLocalizer.parameters.pipedrive.api_key}`
            callApi(url, options, abortSignal, data, e)
                .then((res) => {
                    resolve(res)
                })
                .catch(async (error) => {
                    if (error.code !== "ERR_CANCELED") {
                        if (error.response && error.response.status === 429) {
                            setTimeout(() => {
                                callPipedriveApi(uri, options, data)
                            }, 750)
                        } else {
                            reject(error)
                        }
                    }
                })
        })
    return callPipedriveApi
}



export function deepMerge(obj1, obj2) {
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
                obj1[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                obj1[key] = obj2[key];
            }
        }
    }
    return obj1;
}

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export const removeEmptyProperties = (object) => {
    return Object.fromEntries(Object.entries(object).filter(([_, value]) => value !== ""));
}

export const removeDuplicatesObjectInArray = (key, arr) => {
    const uniqArrayKey = []
    return arr.filter(item => {
        if (!uniqArrayKey.includes(item[key])) {
            uniqArrayKey.push(item[key])
            return true
        } else {
            return false
        }
    })
}

