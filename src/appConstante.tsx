import { ReactNode } from "react"
import { BaseHookField, Category } from "Types"

export const linkableFields: {
    person: string[],
    organization: string[],
    deal: string[],
} = {
    'person': ["name", "email", "phone"],
    'organization': ["name"],
    'deal': ["title"],
}

export const externalLinks: Record<string, string> = {
    setupGuideVideo: "https://woocommerce-to-pipedrive.com/setup-guide/",
    setupGuide: "https://woocommerce-to-pipedrive.com/guides-releases-tutorials/woocommerce-pipedrive-sync-guide/",
    homePage: "https://woocommerce-to-pipedrive.com/",
}

export const unusableFieldsKey: string[] = [
    "id",
    "org_id",
    "people_count",
    "open_deals_count",
    "add_time",
    "update_time",
    //deal
    "value",
    "won_time",
    "lost_time",
    "expected_close_date",
    "channel_id",
    "person_id", //Forcément l'utilisateur
    "label_ids", //Doublon avec Label ?
]

export const priorityFieldsKey: Record<Category, Array<string>> = {
    'person': [
        'name',
        'email',
        'owner_id',
    ],
    'organization': [
        'name',
        'owner_id',
        'address',
    ],
    'deal': [
        'title',
        'stage_id',
        'user_id',
        "status",
    ]
}


export type AdditionalFieldsData = {
    [category in Category]: {
        [key: string]: FieldData;
    };
};

interface FieldData {
    info?: JSX.Element;
}

export const additionalFieldsData: AdditionalFieldsData = {
    'deal': {
        // "status": {
        //     "info": <>
        //         <div className="text-red-700">
        //             By default, the deal status will be<strong>'Open'</ strong > as long as the payment for the order has not been received.
        //             < br /> The status will be<strong>'Won'</ strong > when the order is confirmed(Order processing or Order completed) and<strong>'Lost'</ strong > when the order is lost (Order refunded, Order canceled).</div>
        //         < div className="m-t-10" >
        //             Of course, you can set custom values by enabling this field.
        //         </div>
        //     </>
        // }
    },
    'organization': {},
    'person': {},
}