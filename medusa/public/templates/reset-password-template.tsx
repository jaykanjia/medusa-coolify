import { Text, Heading, Html, Section } from "@react-email/components";

export default function ResetPasswordTemplate({ data }: any) {
	return (
		<Html>
			<Section>
				<Heading>The administration dashboard awaits...</Heading>
				<Text>{data.url}</Text>
			</Section>
		</Html>
	);
}
