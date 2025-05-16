import { ProductVariantDTO } from "@medusajs/framework/types";
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

type RestockNotificationEmailProps = {
	data: {
		variant: ProductVariantDTO & {
			variant_images: { thumbnail: string; images: string[] };
		};
	};
};

export default function RestockNotificationEmail({
	data,
}: RestockNotificationEmailProps) {
	const productUrl = `${process.env.FRONTEND_URL}/store/${data?.variant?.product?.handle}`;
	const productImage =
		data?.variant?.variant_images?.thumbnail ||
		data?.variant?.product?.thumbnail ||
		"";
	const productTitle = data?.variant?.product?.title;
	const variantTitle = data?.variant?.title;

	return (
		<Html>
			<Container style={{ maxWidth: "600px", backgroundColor: "#f4f4f9" }}>
				<Section
					style={{
						backgroundColor: "#000",
						padding: "20px",
						color: "#fff",
						borderRadius: "8px 8px 0 0",
					}}
				>
					<Heading
						style={{ margin: "0", fontSize: "24px", textAlign: "center" }}
					>
						Your Favorite Item is Back in Stock!
					</Heading>
				</Section>
				<Section style={{ padding: "20px", backgroundColor: "#fff" }}>
					<Text style={{ marginBottom: "15px" }}>
						Good news! The product you've been waiting for is now back in stock.
					</Text>
					<Row style={{ alignItems: "center", gap: "40px" }}>
						<Column>
							<Img
								src={productImage}
								alt={productTitle}
								style={{ maxWidth: "150px", borderRadius: "8px" }}
							/>
						</Column>
						<Column style={{ flex: "1" }}>
							<Text
								style={{
									fontSize: "20px",
									fontWeight: "bold",
									margin: "0 0 5px",
								}}
							>
								{productTitle}
							</Text>
							<Text style={{ margin: "0" }}>Variant: {variantTitle}</Text>
							<Text>
								<a
									href={productUrl}
									style={{
										display: "inline-block",
										padding: "10px 20px",
										color: "#fff",
										backgroundColor: "#000",
										textDecoration: "none",
										borderRadius: "5px",
										fontWeight: "bold",
										marginTop: "20px",
									}}
								>
									Shop Now
								</a>
							</Text>
						</Column>
					</Row>

					<Text style={{ marginTop: "15px" }}>Hurry! Stock is limited.</Text>
				</Section>
				<Hr style={{ borderColor: "#e0e0e0", margin: "20px 0" }} />
				<Section
					style={{ textAlign: "center", fontSize: "0.9em", color: "#666" }}
				>
					<Text style={{ margin: "0" }}>
						&copy; Yogateria 2024. All rights reserved.
					</Text>
				</Section>
			</Container>
		</Html>
	);
}
