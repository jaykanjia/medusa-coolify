import {
	AbstractNotificationProviderService,
	MedusaError,
} from "@medusajs/framework/utils";
import {
	ProviderSendNotificationDTO,
	ProviderSendNotificationResultsDTO,
	Logger,
} from "@medusajs/framework/types";

import twilio, { Twilio } from "twilio";
import { decryptOtp } from "../../utils/otp-encrypt-decrypt";

type InjectedDependencies = {
	logger: Logger;
};

class TwilloNotificationProviderService extends AbstractNotificationProviderService {
	static identifier = "notification-twillo";
	private twilloClient: Twilio;
	private phoneNumber: string;
	constructor({ logger }: InjectedDependencies, options: any) {
		super();
		const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
		const authToken = process.env.TWILIO_AUTH_TOKEN || "";
		const phoneNumber = process.env.TWILIO_PHONE_NUMBER || "";
		this.twilloClient = twilio(accountSid, authToken);
		this.phoneNumber = phoneNumber || "";
	}

	async send(
		notification: ProviderSendNotificationDTO
	): Promise<ProviderSendNotificationResultsDTO> {
		let decryptedOtp;
		if (notification.data?.otp) {
			decryptedOtp = decryptOtp(notification.data?.otp as string);
		}
		console.log("notification", notification);

		if (notification.data?.redemption) {
			// const message = await this.twilloClient.messages.create({
			// 	body: GiftDefaultSMSTemplate(notification as any),
			// 	from: this.phoneNumber,
			// 	to: notification.to,
			// });
			console.log("SUCCESS_SMS");
			return { id: "SUCCESS_SMS" };
			// return { id: message.sid };
		}

		if (decryptedOtp) {
			const message = await this.twilloClient.messages.create({
				body: `Your one-time password (OTP) is ${decryptedOtp}. Please use it to complete your verification.`,
				from: this.phoneNumber,
				to: notification.to,
			});
			return { id: message?.sid };
		}

		throw new MedusaError(
			MedusaError.Types.UNEXPECTED_STATE,
			"No any data to send"
		);
	}
}

export default TwilloNotificationProviderService;
