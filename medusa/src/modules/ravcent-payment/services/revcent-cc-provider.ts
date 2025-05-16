import {
    GetPaymentStatusInput,
    GetPaymentStatusOutput,
    InitiatePaymentInput,
    InitiatePaymentOutput,
} from "@medusajs/framework/types";
import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
import RevcentBase from "../core/revcent-base";
import {
    RevcentOptions,
    PaymentProviderKeys,
    RevcentPaymentTypes,
} from "../types";

class RevcentCCPaymentProcessor extends RevcentBase {

    static identifier = PaymentProviderKeys.REVCENT_CC;

    constructor(container: Record<string, any>, options: RevcentOptions) {
        super(container, options);
    }

    async initiatePayment(
        context: InitiatePaymentInput
    ): Promise<InitiatePaymentOutput> {

        try {
            const default_body = await this.createInitiatePaymentData(context);
            const data = {
                ...default_body,
                payment_type: RevcentPaymentTypes.REVCENT_CC,
                customer_id: (context?.data as any)?.customerRevcentId,
            };

            console.dir(data, { depth: null });

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": `${this.options.REVCENT_API_KEY}`
                },
                body: JSON.stringify(data),
            };

            const response = await fetch(`${this.options.REVCENT_API_ENDPOINT}/sales`, requestOptions)
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            const responseData = await response.json();
            return {
                data: {
                    ...responseData,
                    sale_id: responseData.sale_id,
                },
                id: responseData.sale_id,
            };
        } catch (error) {
            console.dir(error, { depth: null });
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                error.message,
                error.code
            );
        }
    }

    getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
        throw new MedusaError(
            MedusaErrorTypes.UNEXPECTED_STATE,
            "revcent cc getPaymentStatus implementation pending... :("
        );
    }
}

export default RevcentCCPaymentProcessor;