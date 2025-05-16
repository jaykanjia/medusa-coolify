import { OrderLineItemDTO } from "@medusajs/framework/types";

type OrderPlacedEmailProps = {
	data: OrderLineItemDTO & {
		redemption: {
			id: string;
			history: any[];
			gift_card_code: string;
			amount: number;
			balance: number;
			expiration_date: string;
			created_at: Date | string;
			updated_at: Date | string;
			deleted_at: Date | string | null;
		};
	};
};

export default function GiftDefaultSMSTemplate({
	data,
}: OrderPlacedEmailProps): string {
	const { title, unit_price: price, redemption } = data;
	const toField =
		data?.metadata?.firstname && data?.metadata?.lastname
			? `${data.metadata.firstname} ${data.metadata.lastname}`
			: data?.metadata?.phone || "Recipient";

	return `Hello!

Congratulations! You have received a ${price} ${title} e-Gift Card from Gift.mu.

Details:

To: ${toField}

Email: ${data?.metadata?.email}

Mobile: ${data?.metadata?.phone}

Giftcard CODE: ${redemption.gift_card_code}

Expiration Date: ${redemption.expiration_date}

To redeem your gift card, visit: ${process.env.STOREFRONT_URL}/redemption/${redemption.id}

Warm regards,

Gift.mu`;
}
