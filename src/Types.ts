export interface AppData {
    CONSTANTES: {
        W2P_AVAIBLE_STATES: QueryState[]
        W2P_HOOK_LIST: PreHook[]
        W2P_META_KEYS: MetaKeyCategory[]
        W2P_REQUIRED_FIELDS: {
            deal: string[]
            organization: string[]
            person: string[]
        }
    },
    parameters: Parameters,
    build_url: string,
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

export interface W2pParameters {
    domain: string;
    api_key: string;
    hookList: Hook[];
    deal: DealsConfig;
    organization: OrganizationsConfig;
    person: PersonsConfig;
}
interface DealsConfig {
    amountsAre: string | null;
    defaultOrderName: Block
    sendProducts: boolean; //product
    searchBeforeCreate: boolean; //product
    productsName: Block | null;
    productsComment: Block | null;
}

interface OrganizationsConfig {
    autoCreate: boolean;
    searchBeforeCreate: boolean;
}

interface PersonsConfig {
    linkToOrga: boolean;
    defaultEmailAsName: boolean;
}

export type MetaKeySources =
    "order"
    | "user"
    | "product"
    | 'w2p'

type HookSources = "order" | "user" | "product"

export interface MetaKeyCategory {
    description: string | null
    label: string
    subcategories: Subcategories[]
    toolTip: string | null
    allowedSource: string[]
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
    source: MetaKeySources
}

export type Category = 'deal'
    | 'organization'
    | "person"

export interface PreHook {
    label: string
    key: string
    source: HookSources
    description: string
    disabledFor: Category[]
}
export interface Hook extends PreHook {
    id: string,
    enabled: boolean,
    show: boolean,
    category: Category,
    option: {
        createActivity?: boolean,
    }
    fields: HookField[],
}

export type FieldCondition = {
    logicBlock: {
        enabled: boolean;
        fieldNumber: "ALL" | "1"
    }
    findInPipedrive?: boolean
    SkipOnExist?: boolean
}

export type BaseHookField = {
    enabled: boolean;
    id: string;
    value: number | Array<number> | Block[] | string;
    condition: FieldCondition;
    pipedriveFieldId: number;
    hookId: string;
};

export interface HookField extends BaseHookField {
    pipedrive: PipedriveField
    // hook: Hook
}

/****************************** LOGIC BLOCK  ****************************/

export type Variable = {
    id: string;
    exemple?: string;
    isFreeField: boolean;
    source?: MetaKeySources | null
    label?: string
    description?: string
    value: string;
    isCustomMetaKey?: boolean
}

export type Block = {
    variables: Variable[],
    id: string,
    index: number,
}


/******************************* QUERY ***********************************/
type DateTimeString = string;

export interface Query {
    additional_data: {
        created_at: DateTimeString;
        responded_at?: DateTimeString;
        last_error?: string | null;
        sended_at?: DateTimeString;
        traceback?: QueryTraceback[]
    }
    category: Category;
    hook: Hook["label"];
    id: number;
    is_valid: boolean;
    payload: {
        category: Category;
        data: PayloadData[]
        products?: PipedriveProductData[] | null
        fields: PayloadField[]
        key: string //Hook key - deprecated
        label: string // Hook Label - deprecated
    }
    method: "POST" | "PUT";
    state: QueryState;
    source_id: number;  //wordpress source id
    target_id: number;  //Pipedrive target id
    source: QuerySource;  //Hook source
    pipedrive_response: {
        [key: string]: any;
    }
}

export type PipedriveProductData = {
    comments: string | null
    discount: number | null
    discount_type: "percentage"
    item_price: number
    name: string | null
    quantity: number
    tax: number | null
    currency_symbol: string
    currency: string
    tax_method: "exclusive" | "none" | "inclusive"
    prices: {
        regular_price: number;
        sale_price: number;
        price_excluding_tax: number;
        price_including_tax: number;
    }
}

export type WoocomerceProductData = {
    product_id: number;
    variation_id: number | null;
    product_name: string;
    quantity: number;
    subtotal: string;
    total: string;
    tax: string;
    tax_class: string;
    tax_status: string;
    item_type: string;
}

export type QuerySource = "user" | "order" | "product"

export type PayloadData = {
    condition: FieldCondition,
    isLogicBlock: boolean,
    key: string,
    name: string,
    pipedriveFieldId: number,
    value: any,
}

export type PayloadField = {
    condition: FieldCondition,
    isLogicBlock: boolean,
    findInPipedrive: boolean,
    key: string,
    values: any[] | string,
}

interface QueryTraceback {
    date: DateTimeString;
    step: string;
    success: boolean;
    message: string;
    additional_data: Record<string, any>;
    internal: boolean;
}

export type QueryState = ("CANCELED" | "ERROR" | "DONE" | "SENDED" | "INVALID" | "TODO")

export interface Order {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: DateObject;
    date_modified: DateObject;
    deal_id: number | null;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    customer_id: number;
    order_key: string;
    billing: Address;
    shipping: Address;
    payment_method: string;
    payment_method_title: string;
    products: WoocomerceProductData[];
    transaction_id: string;
    currency_symbol: string;
    customer: Customer | null;
    customer_ip_address: string;
    customer_user_agent: string;
    created_via: string;
    customer_note: string;
    date_completed: DateObject | null;
    date_paid: DateObject | null;
    cart_hash: string;
    order_stock_reduced: boolean;
    download_permissions_granted: boolean;
    new_order_email_sent: boolean;
    recorded_sales: boolean;
    recorded_coupon_usage_counts: boolean;
    number: string;
    meta_data: MetaData[];
    line_items: Record<number, LineItem>;
    tax_lines: Record<number, TaxLine>;
    shipping_lines: any[];
    state: OrderState;
    fee_lines: any[];
    coupon_lines: any[];
    queries: Query[];
}

interface Customer {
    ID: number;
    user_login: string;
    user_email: string;
    first_name: string;
    last_name: string;
}


export type OrderState = "NOT READY" | "SENDED" | "SYNCED" | "NOT SYNCED" | "ERROR" | "INVALID"

interface DateObject {
    date: string;
    timezone_type: number;
    timezone: string;
}

interface Address {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone?: string;
}

interface MetaData {
    id: number;
    key: string;
    value: string;
}

interface LineItem {
    // Add specific fields for line items if needed
}

interface TaxLine {
    // Add specific fields for tax lines if needed
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

export interface Stage {
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

export interface GroupedStages {
    [pipeline_name: string]: Stage[];
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
    options?: Array<{ id: number; label: string; color?: string }>; // If the field has options like dropdowns
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
    | 'status' //??
    | 'visible_to' //??
    | 'attachment';

interface Access {
    admin: boolean
    app: string
    permission_set_id: string
}