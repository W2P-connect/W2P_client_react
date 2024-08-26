import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useNotification } from "_CONTEXT/hook/contextHook";
import { translate } from 'translation';
import { appDataStore } from '_STORES/AppData';


/*************************************************************************************/
/************************************** CUSTOM HOOKS *********************************/
/*************************************************************************************/

export const useCallApi = () => {
    const appData = appDataStore.appData
    const { addNotification } = useNotification();

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
                        Authorization: `Bearer ${appData.token}`,
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
                if (error?.response?.status === 401 && url.startsWith(appData.w2p_client_rest_url)) {
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
    const callApi = useCallApi();
    const appData = appDataStore.appData
    const { addNotification } = useNotification();


    // Define the function with proper TypeScript types
    const callPipedriveApi = (
        uri: string,
        options: AxiosRequestConfig | null,
        abortSignal: AbortSignal | null = null,
        data: object | null = null,
        e: React.FormEvent | null = null
    ): Promise<AxiosResponse<any> | null> => {
        return new Promise(async (resolve, reject) => {
            if (!appData.parameters.pipedrive.company_domain || !appData.parameters.pipedrive.api_key) {
                // addNotification({
                //     error: true,
                //     content: translate("You must first add your Pipedrive API information in the settings."),
                // })
                reject(false);
            } else {
                const url = `https://${appData.parameters.pipedrive.company_domain}.pipedrive.com/v1/${uri}?api_token=${appData.parameters.pipedrive.api_key}`;
                callApi(url, options = { method: "get" }, abortSignal, data, e)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch(async (error) => {
                        if (error.code !== "ERR_CANCELED") {
                            if (error.response && error.response.status === 429) {
                                setTimeout(() => {
                                    callPipedriveApi(uri, options, abortSignal, data, e).then(resolve).catch(reject);
                                }, 750);
                            } else {
                                reject(error);
                            }
                        }
                    });
            }
        });
    };

    return callPipedriveApi;
};


export function deepMerge(obj1: Record<string, any>, obj2: Record<string, any>) {
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

export function deepCopy(obj: Record<string, any>) {
    return JSON.parse(JSON.stringify(obj));
}

export const removeEmptyProperties = (object: Record<string, any>) => {
    return Object.fromEntries(Object.entries(object).filter(([_, value]) => value !== ""));
}

export const removeDuplicatesObjectInArray =
    <T extends Record<string, any>>(key: keyof T, arr: T[]): T[] => {
        const uniqArrayKey: any[] = [];
        return arr.filter(item => {
            if (!uniqArrayKey.includes(item[key])) {
                uniqArrayKey.push(item[key]);
                return true;
            } else {
                return false;
            }
        });
    };

export const isNumberArray = (value: unknown): value is number[] => Array.isArray(value);

export function updateNestedObject<T extends object>(
    obj: T,
    path: string,
    value: any
): T {
    const keys = path.split('.');
    let current: any = obj;

    keys.slice(0, -1).forEach(key => {
        if (!current[key]) {
            current[key] = {}; // Si la clé n'existe pas, crée un objet vide
        }
        current = current[key];
    });

    current[keys[keys.length - 1]] = value;

    return { ...obj }; // Retourne un nouvel objet avec les mises à jour
}