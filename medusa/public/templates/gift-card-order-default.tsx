import { Html } from "@react-email/components";
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

export default function GiftDefaultEmailComponent({
	data,
}: OrderPlacedEmailProps) {
	const { title, unit_price: price, quantity, redemption } = data;
	const redemptionUrl = `${process.env.STOREFRONT_URL}/redemption/${redemption?.id || ""}`;

	return (
		<Html>
			<div
				dangerouslySetInnerHTML={{
					__html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.6;
        padding: 0;
        margin: 0;
        background-color: #f4f4f9;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: auto;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
      }
      .header {
        text-align: center;
        background-color: #4a3e88;
        padding: 20px;
        color: #ffffff;
        border-radius: 8px 8px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        color: #333;
      }
      .content p {
        margin: 0 0 1em;
      }
      .button {
        width: fit-content;
        display: inline-block;
        padding: 10px 20px;
        color: #ffffff;
        background-color: #3b82f6;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .footer {
        text-align: center;
        font-size: 0.9em;
        color: #666666;
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #e0e0e0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>A Special Gift from Gift.mu</h1>
      </div>
      <div class="content">
        <p>Hello!</p>
        <p>
		Congratuations you have just received a ${price} ${title} e-Gift Card from Gift.mu
        </p>
        <div>
          <strong>To:</strong> ${data?.metadata?.firstname} ${data?.metadata?.lastname}<br />
          <strong>Email:</strong> ${data?.metadata?.email}<br />
          <strong>Mobile:</strong> ${data?.metadata?.phone}<br />
          <strong>Giftcard CODE:</strong> ${redemption?.gift_card_code ?? ""}<br />
          <strong>Expiration Date:</strong> ${redemption?.expiration_date ?? ""}<br />
        </div>
        <a href="${redemptionUrl}" class="button">Redeem Gift-Card</a>
        <p>Warm regards,<br />Gift.mu</p>
      </div>
      <div class="footer">
        <p>&copy; Gift.mu 2024. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
				}}
			/>
		</Html>
	);
}
