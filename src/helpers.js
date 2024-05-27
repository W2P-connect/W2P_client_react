import { useContext } from "react"
import { NotificationContext } from "./_CONTEXT/NotificationContext"
import { translate } from "./translation"
import axios from 'axios'
import { useAppLocalizer } from './_CONTEXT/AppLocalizerContext';


/*************************************************************************************/
/************************************** CUSTOM HOOKS *********************************/
/*************************************************************************************/

export const useCallApi = () => {
    const appLocalizer = useAppLocalizer()
    const { addNotification } = useContext(NotificationContext)
    /**
     *
     * @param {string} uri (obligatoire) URL du endpoint pour la requête
     * @param {Object} options  (obligatoire) object contenant les options de la requête - {method: "get"} / {method: "post"}....
     * @param {AbortController} abortSignal (recommandé) AbortController permettant d'annuler la requête - controler.signal
     * @param {Object} data (optionnel) données à envoyer dans le corps de la requête
     */
    const callApi = async (url, options = { method: 'get' }, abortSignal = null, data = {}, e = null) => {
        if ((e && !e.target.classList.contains("submitting")) || !e) {
            e && e.target.classList.add("submitting")
            return new Promise((resolve, reject) => {
                const APIoptions = {
                    ...options,
                    headers: {
                        Authorization: `Bearer ${appLocalizer.token}`
                    },
                    signal: abortSignal,
                    url: url,
                }
                if (!options || options?.method?.toLowerCase() === "get") {
                    APIoptions.params = data
                } else {
                    APIoptions.data = data
                }

                axios(APIoptions)
                    .then((response) => {
                        resolve(response)
                    })
                    .catch((error) => {
                        if (error?.response?.request?.status === 401 && url.startsWith(appLocalizer.w2p_client_rest_url)) {
                            addNotification({
                                error: true,
                                content: translate("You are not allowed to access this resource. Please refresh the page.")
                            })
                        }
                        reject(error)
                    })
                    .finally(_ => {
                        e && e.target.classList.remove("submitting")
                    })
            })
        } else {
            return null
        }
    }
    return callApi
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