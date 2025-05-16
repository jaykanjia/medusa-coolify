import {
	Text,
	Column,
	Container,
	Heading,
	Html,
	Img,
	Row,
	Section,
	Hr,
} from "@react-email/components";
import { BigNumberValue, OrderDTO } from "@medusajs/framework/types";

type OrderPlacedEmailProps = {
	data: OrderDTO;
};

export default function OrderPlacedEmailComponent({
	data,
}: OrderPlacedEmailProps) {
	console.log("order-placed data", data);
	const formatter = new Intl.NumberFormat([], {
		style: "currency",
		currencyDisplay: "narrowSymbol",
		currency: data.currency_code,
	});

	const formatPrice = (price: BigNumberValue) => {
		if (typeof price === "number") {
			return formatter.format(price);
		}

		if (typeof price === "string") {
			return formatter.format(parseFloat(price));
		}

		return price?.toString() || "";
	};

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
					Order Confirmation
				</Text>

				<Text style={{ margin: "0 0 15px" }}>
					Dear {data.shipping_address?.first_name}{" "}
					{data.shipping_address?.last_name},
				</Text>

				<Text style={{ margin: "0 0 30px" }}>
					Thank you for your recent order! Here are your order details:
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
					{data.items?.map((item) => (
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
						</div>
					))}
				</div>
			</Section>
		</Html>
		// <Html>
		//  <Heading>Thank you for your order</Heading>
		//  {data.email}'s Items
		//  <Container>
		//      {data?.items?.map((item) => {
		//          return (
		//              <Section
		//                  key={item.id}
		//                  style={{ paddingTop: "40px", paddingBottom: "40px" }}
		//              >
		//                  <Row>
		//                      <Column>
		//                          <Img
		//                              src={item.thumbnail || ""}
		//                              alt={item.product_title || ""}
		//                              style={{ float: "left" }}
		//                              width="260px"
		//                          />
		//                      </Column>
		//                      <Column style={{ verticalAlign: "top", paddingLeft: "12px" }}>
		//                          <Text style={{ fontWeight: "500" }}>
		//                              {item.product_title}
		//                          </Text>
		//                          <Text>{item.variant_title}</Text>
		//                          <Text>{formatPrice(item.total)}</Text>
		//                      </Column>
		//                  </Row>
		//              </Section>
		//          );
		//      })}
		//  </Container>
		// </Html>
	);
}
