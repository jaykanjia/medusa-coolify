import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import TwilloNotificationProviderService from "./service";

export default ModuleProvider(Modules.NOTIFICATION, {
	services: [TwilloNotificationProviderService],
});
