import { EOL } from "os";

import {
    AbstractPaymentProvider,
    BigNumber,
    MedusaError,
    MedusaErrorTypes,
    PaymentSessionStatus,
} from "@medusajs/framework/utils";

import { Logger } from "@medusajs/medusa";
import axios, { AxiosInstance } from "axios";
import {
    InitiatePaymentDataBody,
    RevcentOptions,
} from "../types";
import { AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, DeletePaymentInput, DeletePaymentOutput, InitiatePaymentInput, InitiatePaymentOutput, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from "@medusajs/framework/types";

abstract class RevcentBase extends AbstractPaymentProvider<RevcentOptions> {
    protected logger_: Logger;

    protected client: AxiosInstance;

    protected readonly options_: RevcentOptions;
    protected container_: Record<string, unknown>;
    protected readonly DEFAULT_PRODUCT_ID: string;

    static validateOptions(options: RevcentOptions) {
        if (
            !options.REVCENT_API_KEY ||
            !options.REVCENT_API_ENDPOINT ||
            !options.REVCENT_CAMPAIGN_ID ||
            !options.REVCENT_PAYMENT_PROFILE_ID
        ) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `${!options.REVCENT_API_KEY && "apiKey,"} ${!options.REVCENT_API_ENDPOINT && "endpoint,"} ${!options.REVCENT_CAMPAIGN_ID && "campaignId,"
                } ${!options.REVCENT_PAYMENT_PROFILE_ID && "paymentProfileId,"
                } is required in the provider's options.`
            );
        }
    }

    protected constructor(
        cradle: Record<string, unknown>,
        options: RevcentOptions
    ) {
        // @ts-ignore
        super(...arguments);

        this.logger_ = cradle.logger as Logger;
        this.container_ = cradle;
        this.options_ = options;
        if (!options.REVCENT_PRODUCT_ID) {
            console.warn(
                `defaultProductId is missing in provider using default product id: ${this.DEFAULT_PRODUCT_ID}`
            );
        }

        this.client = axios.create({
            baseURL: options.REVCENT_API_ENDPOINT,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": options.REVCENT_API_KEY,
            },
        });
    }

    get options(): RevcentOptions {
        return this.options_;
    }

    async createInitiatePaymentData(
        input: InitiatePaymentInput
    ): Promise<InitiatePaymentDataBody> {

        const { amount, currency_code, context, data } = input;

        if (!context?.customer?.id || !context?.customer?.email) {
            throw new Error(
                "email, cart_id or billing address not found while initiating payment"
            );
        }

        try {
            const body = {
                campaign: this.options.REVCENT_CAMPAIGN_ID,
                iso_currency: currency_code.toUpperCase() === "USD" ? currency_code.toUpperCase() : "USD",
                // ! need to remove static ip_address logic
                ip_address: (data?.ip_address as string) || "123.456.789.0",
                // customer: {
                //     first_name: (context?.customer?.billing_address as any)?.first_name as string || "dummy_first_name",
                //     last_name: (context?.customer?.billing_address as any)?.last_name as string || "dummy_last_name",
                //     email: context?.customer?.email as string || "dummy_email",
                // },
                // bill_to: {
                //     first_name: (context?.customer?.billing_address as any)?.first_name as string || "dummy_first_name",
                //     last_name: (context?.customer?.billing_address as any)?.last_name as string || "dummy_last_name",
                //     email: context?.customer?.email as string || "dummy_email",
                // },
                // ship_to: {
                //     first_name: (context?.customer?.billing_address as any)?.first_name as string || "dummy_first_name",
                //     last_name: (context?.customer?.billing_address as any)?.last_name as string || "dummy_last_name",
                //     email: context?.customer?.email as string || "dummy_email",
                // },
                product: [
                    {
                        id: this.options.REVCENT_PRODUCT_ID,
                        quantity: 1,
                        price: amount,
                    },
                ],
                internal_sale_id: (data?.extra as any)?.cart_id as string || "dummy_cart_id",
                payment_profile: this.options.REVCENT_PAYMENT_PROFILE_ID,

            };
            return body;
        } catch (error) {

            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                error.message,
                error.code
            );
        }

    }

    abstract initiatePayment(
        context: InitiatePaymentInput
    ): Promise<InitiatePaymentOutput>;

    async retrievePayment(
        input: RetrievePaymentInput
    ): Promise<RetrievePaymentOutput> {

        try {
            const saleId = input.data?.sale_id as string;
            const response = await fetch(`${this.options.REVCENT_API_ENDPOINT}/sales/${saleId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.options.REVCENT_API_KEY,
                },
                method: "GET",
            });
            const data = await response.json();


            return {
                ...data,
                id: data.id,
            };
        } catch (e) {
            throw new Error("An error occurred in retrievePayment");
        }
    }

    async updatePayment(
        context: UpdatePaymentInput
    ): Promise<UpdatePaymentOutput> {
        console.log("updatePayment called with context,", context);
        return {
            data: {
                id: "dummy_id_updated",
                ...context,
            },
        };
    }
    async authorizePayment(
        input: AuthorizePaymentInput
    ): Promise<AuthorizePaymentOutput> {
        const saleId = input.data?.sale_id as string;
        try {
            const response = await fetch(`${this.options.REVCENT_API_ENDPOINT}/sales/${saleId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.options.REVCENT_API_KEY,
                },
                method: "GET",
            });
            const data = await response.json();
            if (data.amount === data.amount_captured) {

                if (data.status === "Fully Captured") {
                    return { data: input, status: PaymentSessionStatus.CAPTURED };
                } else {
                    return { data: input, status: PaymentSessionStatus.AUTHORIZED };
                }
            } else {
                return { data: input, status: PaymentSessionStatus.PENDING };
            }
        } catch (error) {
            return { data: input, status: PaymentSessionStatus.ERROR };
        }
    }

    async capturePayment(
        input: CapturePaymentInput
    ): Promise<CapturePaymentOutput> {
        console.log("capturePayment called with payemnt session data", input);

        try {
            const data: any = await this.retrievePayment(input);

            console.debug("Received response from revcent for capture:");

            if (data.amount !== data.amount_captured) {
                console.error(
                    "capturePayment error amount and amount_captured is not equel"
                );
            }

            return {
                ...input,
                ...data,
                id: data?.id,
                captured_amount: data?.amount_captured,
            };
        } catch (error) {
            console.error(
                "An error occurred while capturePayment" +
                error?.response?.data?.error_messages
                    ?.map((message) => message?.description)
                    .join(", ")
            );

            throw new Error(
                "An error occurred while capturing the payment. ",

            );
        }
    }

    async cancelPayment(
        input: CancelPaymentInput
    ): Promise<CancelPaymentOutput> {
        throw new Error("Method not implemented.");
    }

    async deletePayment(
        input: DeletePaymentInput
    ): Promise<DeletePaymentOutput> {
        throw new Error("Method not implemented.");

    }
    async refundPayment(
        input: RefundPaymentInput
    ): Promise<RefundPaymentOutput> {
        throw new Error("Method not implemented.");
    }

    async getWebhookActionAndData(
        webhookData: ProviderWebhookPayload["payload"]
    ): Promise<WebhookActionResult> {
        const { data, rawData, headers } = webhookData;

        try {
            return {
                action: "not_supported",
            };
        } catch (error) {
            return {
                action: "failed",
                data: {
                    session_id: (data.metadata as Record<string, any>).session_id,
                    amount: new BigNumber(data.amount as number),
                },
            };
        }
    }

    protected buildError(
        message: string,
        e: any
    ) {
        return {
            error: message,
            code: "code" in e ? `${e.code}` : "",
            detail: `${"error" in e ? e.error : e.message}${EOL}${"detail" in e ? e.detail : ""}`,
        };
    }

}

export default RevcentBase;