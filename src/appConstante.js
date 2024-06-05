
export const linkableFields = {
    'person': ["name", "email", "phone"],
    'organization': ["name"]
}

export const unusableFieldsKey = [
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
    "person_id" //Forcément l'utilisateur
]

export const priorityFieldsKey = {
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

export const additionalFieldsData = {
    'deal': {
        "status": {
            "info": <>
                <div>
                    By default, the deal status will be <strong>'Open'</strong> as long as the payment for the order has not been received.
                    <br />The status will be <strong>'Won'</strong> when the order is confirmed (Order processing or Order completed) and <strong>'Lost'</strong> when the order is lost (Order refunded, Order canceled).</div>
                <div className="m-t-10">
                    Of course, you can set custom values by enabling this field.
                </div>
            </>
        }
    }
}