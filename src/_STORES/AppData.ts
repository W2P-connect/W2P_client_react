import { makeAutoObservable, runInAction } from 'mobx';
import { AppData, Hook, Parameters, PipedriveField, PipedriveParameters, W2pParameters } from 'Types';
import { deepCopy } from 'helpers';
import { hookStore } from './Hooks';
import { pipedriveFieldsStore } from './PipedriveFields';

class AppDataStore {

    emptyPipedriveParameters: PipedriveParameters = {
        api_key: "",
        company_domain: "",
        users: [],
        stages: [],
        fields: [],
    }

    emptyW2Pparameters: W2pParameters = {
        domain: "",
        api_key: "",
        hookList: [],
        deals: {
            amountsAre: "Tax inclusive",
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

    emptyParameters: Parameters = {
        pipedrive: this.emptyPipedriveParameters,
        w2p: this.emptyW2Pparameters
    }

    emptyAppData: AppData = {
        parameters: {
            pipedrive: this.emptyPipedriveParameters,
            w2p: this.emptyW2Pparameters,
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

    initAppData: AppData = deepCopy(this.emptyAppData)

    appData: AppData = deepCopy(this.emptyAppData)

    fieldsCategoryfieldsCategory:
        { slug: string, name: string }[] =
        [
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


    constructor() {
        makeAutoObservable(this);
    }

    setAppData(newAppData: AppData) {
        runInAction(() => {
            this.appData = deepCopy(newAppData);
        })
    }
    setInitAppData(newAppData: AppData) {
        runInAction(() => {
            this.initAppData = deepCopy(newAppData);
        })
    }

    getHookById(id: string): Hook | undefined {
        return this.appData.parameters.w2p.hookList.find(hook => hook.id === id);
    }

    getPipedriveField(fieldId: number): PipedriveField | null {
        return this.appData.parameters.pipedrive.fields.find((field: PipedriveField) => field.id === fieldId) ?? null;
    }

    setPipedriveParameter<K extends keyof PipedriveParameters>(key: K, value: PipedriveParameters[K]) {
        this.appData.parameters.pipedrive[key] = value;
    }

    setW2pParameter<K extends keyof W2pParameters>(key: K, value: W2pParameters[K]) {
        this.appData.parameters.w2p[key] = value;
    }

    getAppData(): AppData {
        const formatedAppData: AppData = deepCopy(this.appData)
        formatedAppData.parameters.w2p.hookList = [...hookStore.hooks]
        formatedAppData.parameters.pipedrive.fields = [...pipedriveFieldsStore.fields]
        return formatedAppData
    }
}

export const appDataStore = new AppDataStore();
