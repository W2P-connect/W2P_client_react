export default function DefaultSettingsPresentation() {
    return (
        <div><p className='font-medium'>This will configure the following parameters:</p>
            <ul className='pl-4 list-disc'>
                <li>
                    <strong>People:</strong> Create or update a Person whenever a WooCommerce user signs up or is updated.
                    Sends <em>full name</em>, <em>first/last name</em>, <em>email</em>, and <em>phone</em> when available.
                </li>
                <li>
                    <strong>Organizations:</strong> Create or update an Organization from the user’s <em>billing company name</em> on user updates
                    (e.g., when billing details are added during checkout).
                </li>
                <li>
                    <strong>Deals:</strong> Create and update Deals from WooCommerce orders and pending cart, attaching line items
                    (product name, price, quantity) and the order comment. Deal title, status, and <em>won time</em> are set based on the order status.
                </li>
            </ul>
        </div>
    )
}
