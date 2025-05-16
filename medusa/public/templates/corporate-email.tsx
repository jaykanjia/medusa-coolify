import { Text, Html, Section, Hr } from "@react-email/components";
import { OrderDTO } from "@medusajs/framework/types";

type CorporateEmailProps = {
	data: OrderDTO & {
		nextStepCorporateEmailData: Record<string, any>[];
	};
};

export default function CorporateEmailComponent({ data }: CorporateEmailProps) {
	console.log("corporate email data", JSON.stringify(data));
	const formatter = new Intl.NumberFormat([], {
		style: "currency",
		currencyDisplay: "narrowSymbol",
		currency: data.currency_code,
	});

	return (
		<Html>
			<Section>
				<Text
					style={{
						fontSize: "24px",
						fontWeight: "bold",
						textAlign: "center",
						margin: "0 0 30px",
					}}
				>
					Gift Cards
				</Text>

				<Text style={{ margin: "0 0 15px" }}>
					Dear {data.shipping_address?.first_name}{" "}
					{data.shipping_address?.last_name},
				</Text>

				<Text style={{ margin: "0 0 30px" }}>
					Thank you for your Payment! Here are your order details:
				</Text>

				<Text
					style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 10px" }}
				>
					Order Summary
				</Text>
				<Text style={{ margin: "0 0 5px" }}>Order ID: {data.id}</Text>
				<Text style={{ margin: "0 0 5px" }}>
					Order Date: {new Date(data.created_at).toLocaleDateString()}
				</Text>
				<Text style={{ margin: "0 0 20px" }}>
					Total: {(data.summary as any)?.raw_original_order_total?.value || 444}{" "}
					{data.currency_code}
				</Text>

				<hr style={{ margin: "20px 0" }} />

				<Text
					style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 10px" }}
				>
					Shipping Address
				</Text>
				<Text style={{ margin: "0 0 5px" }}>
					{data.shipping_address?.address_1}
				</Text>
				<Text style={{ margin: "0 0 5px" }}>
					{data.shipping_address?.city}, {data.shipping_address?.province}{" "}
					{data.shipping_address?.postal_code}
				</Text>
				<Text style={{ margin: "0 0 20px" }}>
					{data.shipping_address?.country_code}
				</Text>

				<Hr style={{ margin: "20px 0" }} />

				<Text
					style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 15px" }}
				>
					Order Items
				</Text>

				<div
					style={{
						width: "100%",
						borderCollapse: "collapse",
						border: "1px solid #ddd",
						margin: "10px 0",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							backgroundColor: "#f2f2f2",
							padding: "8px",
							borderBottom: "1px solid #ddd",
						}}
					>
						<Text style={{ fontWeight: "bold" }}>Item</Text>
						<Text style={{ fontWeight: "bold" }}>Quantity</Text>
						<Text style={{ fontWeight: "bold" }}>Price</Text>
					</div>
					{data.items?.map((item) => {
						const redemption = data?.nextStepCorporateEmailData?.find(
							(x) => x.id === item.id
						)?.redemptionData;
						const redemptionUrl = `${process.env.STOREFRONT_URL}/redemption/${redemption?.id || ""}`;
						console.log("redemption template payment", redemption);

						return (
							<div
								key={item.id}
								style={{
									display: "flex",
									justifyContent: "space-between",
									padding: "8px",
									borderBottom: "1px solid #ddd",
								}}
							>
								<Text>
									{item.title} - {item.product_title}
								</Text>
								<Text>{item.quantity}</Text>
								<Text>
									{item.unit_price} {data.currency_code}
								</Text>
								<Text>
									GiftCard Code:{" "}
									{redemption?.gift_card_code ?? "no code available"}
								</Text>
								<a href={redemptionUrl} className="button">
									Redeem Gift-Card
								</a>
								<Text>email: {(item?.metadata?.email as string) ?? ""}</Text>
							</div>
						);
					})}
				</div>
			</Section>
		</Html>
	);
}
