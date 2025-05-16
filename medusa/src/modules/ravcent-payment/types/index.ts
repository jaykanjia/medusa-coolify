import { BigNumberInput } from "@medusajs/framework/types";

export interface RevcentOptions {
    REVCENT_API_ENDPOINT: string;
    REVCENT_API_KEY: string;
    REVCENT_CAMPAIGN_ID: string;
    REVCENT_PAYMENT_PROFILE_ID: string;
    REVCENT_PRODUCT_ID: string;
}

export const PaymentProviderKeys = {
    REVCENT_CC: "revcent-cc",
    REVCENT_PAYPAL: "revcent-paypal",
    REVCENT_OFFLINE: "revcent-offline",
};

export const RevcentPaymentTypes = {
    REVCENT_CC: "credit_card",
    REVCENT_PAYPAL: "paypal",
    REVCENT_OFFLINE: "offline_payment",
};

export interface InitiatePaymentDataBody {
    campaign: string;
    iso_currency: string;
    ip_address: string;
    customer?: {
        first_name: string;
        last_name: string;
        email: string;
    };
    product: {
        id: string;
        quantity: number;
        price: number | BigNumberInput;
    }[];
    internal_sale_id: string;
    internal_customer_id?: string;
}

export interface RevcentRawError {
    api_call_id: string;
    api_call_region: string;
    code: number;
    error_code: string;
    message: string;
    result:
    | "Error"
    | "Declined"
    | "Payment request failed."
    | "Not Found"
    | string;
}