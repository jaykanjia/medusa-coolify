import { Text, Heading, Html, Section } from "@react-email/components";

export default function InviteUser({ data }: any) {
	return (
		<Html>
			<Section>
				<Heading>The administration dashboard awaits...</Heading>
				<Text>Accept the invite and login to the dashboard</Text>
				<Text>{data.inviteLink}</Text>
			</Section>
		</Html>
	);
}
