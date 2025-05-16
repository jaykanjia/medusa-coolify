import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { RevcentOfflinePaymentProcessor, RevcentCCPaymentProcessor } from "./services";

const services = [RevcentOfflinePaymentProcessor, RevcentCCPaymentProcessor];

export default ModuleProvider(Modules.PAYMENT, {
    services,
});