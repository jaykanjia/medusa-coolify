import React from "react";
import { AbstractNotificationProviderService } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import OrderPlacedEmailComponent from "../../public/templates/order-placed";
import OtpSmsTemplateComponent from "../../public/templates/otp";
import InviteUser from "../../public/templates/invite-user";
import ResetPasswordTemplate from "../../public/templates/reset-password-template";

export enum Templates {
	ORDER_PLACED = "order-placed",
	OTP_MAIL = "otp",
	INVITE_USER = "invite-user",
	RESET_PASSWORD = "reset-password-template",
}

export const templates: {
	[key in Templates]?: React.ComponentType<{ data: any }>;
} = {
	[Templates.ORDER_PLACED]: OrderPlacedEmailComponent,
	[Templates.OTP_MAIL]: OtpSmsTemplateComponent,
	[Templates.INVITE_USER]: InviteUser,
	[Templates.RESET_PASSWORD]: ResetPasswordTemplate,
};

export abstract class NotificationService extends AbstractNotificationProviderService {
	async getTemplate(template: Templates, data: any) {
		const allowedTemplates = Object.keys(templates);

		if (!allowedTemplates.includes(template)) {
			return null;
		}

		const EmailTemplate = templates[template];

		if (!EmailTemplate) {
			return null;
		}

		const emailHtml = await render(
			React.createElement(EmailTemplate, { data: data })
		);
		return emailHtml;
	}

	getTemplateSubject(template: Templates) {
		switch (template) {
			case Templates.ORDER_PLACED:
				return "Order Confirmation";
			case Templates.OTP_MAIL:
				return "Login Otp";
			case Templates.INVITE_USER:
				return "Admin Invitation";
			case Templates.RESET_PASSWORD:
				return "Admin Reset Password";
			default:
				return "New Email";
		}
	}
}
