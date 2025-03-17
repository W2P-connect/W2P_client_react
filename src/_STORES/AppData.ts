import { makeAutoObservable, runInAction } from 'mobx';
import { AppData, Category, Hook, Parameters, PipedriveField, PipedriveParameters, W2pParameters } from 'Types';
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

    defaultW2Pparameters: Omit<W2pParameters, 'domain' | 'api_key' | 'hookList'> = {
        deal: {
            amountsAre: "exclusive",
            defaultOrderName: {
                variables: [
                    {
                        id: "d7778f5b-910c-44f9-8c69-099bcb50fedc",
                        exemple: "Woocommerce order n°",
                        isFreeField: true,
                        value: "Woocommerce order n°"
                    },
                    {
                        value: "id",
                        source: "order",
                        exemple: "6452",
                        isFreeField: false,
                        id: "4e5e6f70-e922-41dd-b354-66c338e64343"
                    }
                ],
                id: "",
                index: 0
            },
            sendProducts: true,
            searchBeforeCreate: true,
            productsName: {
                variables: [
                    {
                        value: "name",
                        source: "product",
                        exemple: "T-Shirt",
                        isFreeField: false,
                        id: "e9f54c61-462d-4491-8fd1-e3797b7a9079"
                    }
                ],
                id: "",
                index: 0
            },
            productsComment: {
                variables: [
                    {
                        value: "attribute_summary",
                        source: "product",
                        exemple: "Size: S, M, L - Color: Red, Blue, Green",
                        isFreeField: false,
                        id: "6a5c4310-11d9-49b2-b437-ab177ba56b8b"
                    }
                ],
                id: "",
                index: 0
            }
        },
        organization: {
            autoCreate: false,
            searchBeforeCreate: true,

        },
        person: {
            linkToOrga: true,
            defaultEmailAsName: true,
        },
    }

    emptyW2Pparameters: W2pParameters = {
        domain: "",
        api_key: "",
        hookList: [],
        deal: {
            amountsAre: "Tax exclusive",
            defaultOrderName: {
                variables: [],
                id: '',
                index: 0,
            },
            sendProducts: true,
            searchBeforeCreate: true,
            productsName: null,
            productsComment: null,
        },
        organization: {
            autoCreate: false,
            searchBeforeCreate: true,

        },
        person: {
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
            W2PCIFW_AVAIBLE_STATES: [],
            W2PCIFW_HOOK_LIST: [],
            W2PCIFW_HOOK_SOURCES: [],
            W2PCIFW_META_KEYS: [],
            W2PCIFW_REQUIRED_FIELDS: {
                deal: [],
                organization: [],
                person: [],
            },
            W2PCIFW_IS_WOOCOMERCE_ACTIVE: true
        },
        build_url: '',
        w2pcifw_client_rest_url: '',
        w2pcifw_distant_rest_url: '',
        token: '',
        nonce: '',
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

    getParentHookFromKey(key: string) {
        return this.appData.CONSTANTES.W2PCIFW_HOOK_LIST
            .find(hook => hook.key === key && hook)
    }
}

export const appDataStore = new AppDataStore();
