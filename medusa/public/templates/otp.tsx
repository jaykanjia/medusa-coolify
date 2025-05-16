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
import { decryptOtp } from "../../src/utils/otp-encrypt-decrypt";

type OrderPlacedEmailProps = {
	data: OrderDTO;
};

export default function OtpSmsTemplate({ data }: any) {
	console.log("log in otpsms template");
	const decryptedOtp = decryptOtp(data?.otp as string);

	return (
		<Html>
			<Section>
				<Heading>Your OTP Code</Heading>
				<Text>
					Your one-time password (OTP) is {decryptedOtp}. Please use it to
					complete your verification.
				</Text>
			</Section>
		</Html>
	);
}
