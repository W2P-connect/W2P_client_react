import { makeAutoObservable } from 'mobx';
import { AppData, Category, Hook, PipedriveField } from 'Types';

class AppDataStore {

    appData: AppData = {
        parameters: {
            pipedrive: {
                api_key: "",
                company_domain: "",
                users: [],
                stages: [],
                fields: [],
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
            W2P_AVAIBLE_STATES: [],
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


    constructor() {
        makeAutoObservable(this);
    }

    setAppData(newAppData: AppData) {
        this.appData = newAppData;
    }

    updateHookList(newHookList: Hook[]) {
        this.appData.parameters.w2p.hookList = newHookList;
    }

    getHookById(id: string): Hook | undefined {
        return this.appData.parameters.w2p.hookList.find(hook => hook.id === id);
    }

    getPipedriveField(fieldId: number): PipedriveField | null {
        return this.appData.parameters.pipedrive.fields.find((field: PipedriveField) => field.id === fieldId) ?? null;
    }
}

export const appDataStore = new AppDataStore();
