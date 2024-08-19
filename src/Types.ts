export interface AppData {
    CONSTANTES: {
        W2P_AVAIBLE_STATES: ("ERROR" | "DONE" | "SENDED" | "INVALID" | "TODO")[]
        W2P_HOOK_LIST: Hook[]
        W2P_META_KEYS: MetaKeyCategory[]
        W2P_REQUIRED_FIELDS: {
            deal: string[]
            organization: string[]
            person: string[]
        }
    },
    parameters: Parameters,
    w2p_client_rest_url: string,
    w2p_distant_rest_url: string,
    token: string,
}

export interface Parameters {
    pipedrive: PipedriveParameters
    w2p: W2pParameters
}

export interface PipedriveParameters {
    api_key: string
    company_domain: string
    users: User[],
    stages: Stage[],
    fields: PipedriveField[],
}

interface W2pParameters {
    domain: string;
    api_key: string;
    hookList: Hook[];
    deals: DealsConfig;
    organizations: OrganizationsConfig;
    persons: PersonsConfig;
}
interface DealsConfig {
    amountsAre: string | null;
    createNew: boolean;
    searchBeforeCreate: boolean;
}

interface OrganizationsConfig {
    autoCreate: boolean;
    searchBeforeCreate: boolean;
}

interface PersonsConfig {
    linkToOrga: boolean;
    defaultEmailAsName: boolean;
}

export interface MetaKeyCategory {
    description: string | null
    label: string
    subcategories: Subcategories[]
    toolTip: string | null
}

export interface Subcategories {
    label: string
    metaKeys: MetaKey[]
}

export interface MetaKey {
    description: string
    exemple: string
    label: string
    value: string
}

export type Category = 'deal'
    | 'organization'
    | "person"

export interface Hook {
    label: string
    key: string
    description: string
    disabledFor: Category[]
    id: string,
    active: boolean
    show: boolean,
    category: Category,
    createActivity: boolean,
    fields: HookField[],
}

export type BaseHookField = {
    enabled: boolean;
    key: string;
    value: string | Array<any>;
    condition: string;
    pipedriveFieldId: number;
    hookId: string;
};

export interface HookField extends BaseHookField {
    pipedrive: PipedriveField
}

/*************************************************************************/
/******************************* PIPEDRIVE *******************************/
/*************************************************************************/

export interface PipedriveDeal {
    id: number;
    title: string;
    value: number;
    currency: string;
    user_id: number;
    person_id: number;
    org_id: number;
    stage_id: number;
    status: string;
    probability?: number;
    add_time: string;
    update_time: string;
    close_time?: string;
    won_time?: string;
    lost_time?: string;
    pipeline_id: number;
    expected_close_date: string;
    last_activity_id?: number;
    next_activity_id?: number;
    next_activity_date?: string;
    next_activity_time?: string;
    next_activity_subject?: string;
    next_activity_type?: string;
    next_activity_duration?: string;
    last_activity_date?: string;
    lost_reason?: string;
    visible_to: string;
    add_products?: boolean;
}

export interface PipedrivePerson {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    open_deals_count: number;
    related_open_deals_count: number;
    closed_deals_count: number;
    related_closed_deals_count: number;
    participant_open_deals_count: number;
    participant_closed_deals_count: number;
    email: { label: string; value: string; primary: boolean }[];
    phone: { label: string; value: string; primary: boolean }[];
    owner_id: number;
    org_id: number;
    add_time: string;
    update_time: string;
    visible_to: string;
    picture_id?: number;
}

export interface PipedriveOrganization {
    id: number;
    name: string;
    people_count: number;
    owner_id: number;
    address: string;
    address_subpremise?: string;
    address_street_number?: string;
    address_route?: string;
    address_sublocality?: string;
    address_locality?: string;
    address_admin_area_level_1?: string;
    address_admin_area_level_2?: string;
    address_country?: string;
    address_postal_code?: string;
    address_formatted_address?: string;
    add_time: string;
    update_time: string;
    visible_to: string;
}

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
    pipeline_name: string;
    order_nr: number;
    deal_probability: number;
    pipeline_deal_probability: boolean;
    rotten_days: number | null;
    rotten_flag: boolean;
    active_flag: boolean;
    add_time: string;
    update_time: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    active_flag: boolean;
    created: string;
    modified: string;
    last_login: string;
    default_currency: string;
    has_created_company: boolean;
    icon_url: string | null;
    is_admin: boolean;
    is_deleted: boolean;
    is_you: boolean;
    lang: number;
    locale: string;
    role_id: number;
    timezone_name: string;
    timezone_offset: string;
    access: Access[];
}

export interface PipedriveField {
    id: number;
    key: string;
    name: string;
    order_nr: number;
    field_type: PipedriveFieldType;
    add_time: string;
    update_time: string | null;
    active_flag: boolean;
    edit_flag: boolean;
    index_visible_flag: boolean;
    details_visible_flag: boolean;
    add_visible_flag: boolean;
    important_flag: boolean;
    bulk_edit_allowed: boolean;
    search_enabled: boolean;
    filtering_allowed: boolean;
    sortable_flag: boolean;
    mandatory_flag: boolean;
    json: any;
    options?: Array<{ id: string; label: string; color: string }>; // If the field has options like dropdowns
    category: Category  //Ajout manuel car n'est pas inclus par détault dans Pipedrive ! (gestion plus simple)
}

export type PipedriveFieldType =
    | 'varchar'
    | 'text'
    | 'int'
    | 'double'
    | 'monetary'
    | 'date'
    | 'set'
    | 'enum'
    | 'phone'
    | 'time'
    | 'timerange'
    | 'daterange'
    | 'user'
    | 'org'
    | 'people'
    | 'stage'
    | 'address'
    | 'bool'
    | 'email'
    | 'timeinterval'
    | 'varchar_options'
    | 'attachment';

interface Access {
    admin: boolean
    app: string
    permission_set_id: string
}