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
     * @param {boolean | null} toW2pPlugin - Is to w2p plugin ? default true (optional)
     * @returns {Promise<AxiosResponse<any>> | null}
     */
    const callApi = async (
        url: string,
        options: AxiosRequestConfig = { method: 'get' },
        abortSignal: AbortSignal | null = null,
        data: Record<string, any> | null = {},
        e: React.FormEvent | null = null,
        toW2pPlugin: boolean = true
    ): Promise<AxiosResponse<any> | null> => {
        e && e.preventDefault()
        const submitter = (e?.nativeEvent as SubmitEvent)?.submitter as HTMLElement | null;
        if ((submitter && !submitter.classList.contains("submitting")) || !submitter) {
            submitter && submitter.classList.add("submitting");

            try {
                const APIoptions: AxiosRequestConfig = {
                    ...options,
                    headers: {
                        ...options.headers,
                    },
                    signal: abortSignal ?? undefined,
                    url: url,
                };

                if (isLocal()) {
                    APIoptions.headers && (APIoptions.headers.Authorization = `Bearer ${appData.token}`)
                } else {
                    APIoptions.headers && toW2pPlugin && (APIoptions.headers['X-WP-Nonce'] = appData.nonce)
                }

                if (options.method?.toLowerCase() === "get") {
                    APIoptions.params = data;
                } else {
                    APIoptions.data = data;
                }

                const response = await axios(APIoptions);

                // Supprimer la classe 'submitting' après l'appel réussi
                submitter && submitter.classList.remove("submitting");

                return response;
            } catch (error: any) {
                // Supprimer la classe 'submitting' si une erreur se produit
                submitter && submitter.classList.remove("submitting");

                if (error?.response?.status === 401 && url.startsWith(appData.w2pcifw_client_rest_url)) {
                    addNotification({
                        error: true,
                        content: translate("You are not allowed to access this resource. Please refresh the page."),
                    });
                }

                return Promise.reject(error);
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

    // Define the function with proper TypeScript types
    const callPipedriveApi = (
        uri: string,
        options: AxiosRequestConfig | null,
        abortSignal: AbortSignal | null = null,
        data: object | null = null,
        e: React.FormEvent | null = null
    ): Promise<AxiosResponse<any> | null> => {
        return new Promise(async (resolve, reject) => {
            e && e.preventDefault()
            if (!appData.parameters.pipedrive.company_domain || !appData.parameters.pipedrive.api_key) {
                // addNotification({
                //     error: true,
                //     content: translate("You must first add your Pipedrive API information in the settings."),
                // })
                reject(false);
            } else {
                const url = `https://${appData.parameters.pipedrive.company_domain}.pipedrive.com/v1/${uri}?api_token=${appData.parameters.pipedrive.api_key}`;
                callApi(url, options = options ?? { method: "get" }, abortSignal, data, e)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch(async (error) => {
                        console.log(error);

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

export const isLocal = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
};


export function deepMerge<T extends Record<string, any>>(obj1: T, obj2: T): T {
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (
                typeof obj2[key] === 'object' && obj2[key] !== null &&
                typeof obj1[key] === 'object' && obj1[key] !== null
            ) {
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

export function mayJsonParse(value: any, defaultValue: any = null): any {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (e) {
            return defaultValue;
        }
    }
    return value;
}

export const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ')
}
