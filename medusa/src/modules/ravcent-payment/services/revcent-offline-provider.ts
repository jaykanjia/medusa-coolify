import {
    PaymentProviderContext,
    InitiatePaymentInput,
    InitiatePaymentOutput,
    GetPaymentStatusInput,
    GetPaymentStatusOutput,
} from "@medusajs/framework/types";
import RevcentBase from "../core/revcent-base";
import {
    RevcentOptions,
    PaymentProviderKeys,
    RevcentPaymentTypes,
} from "../types";

class RevcentOfflinePaymentProcessor extends RevcentBase {
    getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
        console.log("🚀 ~ RevcentOfflinePaymentProcessor ~ getPaymentStatus ~ GetPaymentStatusInput:", input)
        throw new Error("Method not implemented.");
    }


    static identifier = PaymentProviderKeys.REVCENT_OFFLINE;

    constructor(container: Record<string, any>, options: RevcentOptions) {
        super(container, options);
    }

    async initiatePayment(
        context: InitiatePaymentInput
    ): Promise<InitiatePaymentOutput> {
        console.log("initiatePayment called with context,", context);

        try {
            console.debug("Extracted context data:", {
                context,
            });

            const default_body = await this.createInitiatePaymentData(context);

            const data = {
                ...default_body,
                payment_type: RevcentPaymentTypes.REVCENT_OFFLINE,
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
                throw new Error("Failed to initiate payment");
            }
            const responseData = await response.json();
            console.dir(responseData, {
                depth: null,
            });
            
            return {
                data: {
                    ...responseData,
                    sale_id: responseData.sale_id,
                },
                id: responseData.sale_id,
            };
        } catch (error) {
            console.dir(error, { depth: null });
            throw new Error(
                "An error occurred while initiating the payment. "
            );
        }
    }
}

export default RevcentOfflinePaymentProcessor;