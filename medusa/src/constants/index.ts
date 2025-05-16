export type PluginOptions = {
	limit: number;
	window: number;
	includeHeaders: boolean;
};

export const DEFAULT_OPTIONS: PluginOptions = {
	limit: 5,
	window: 60, // 1min
	includeHeaders: true,
};

export const VALID_EVENTS = {
	AUTH: {
		PASSWORD_RESET: "auth.password_reset",
	},
	CUSTOMER: {
		CREATED: "customer.created",
		UPDATED: "customer.updated",
		DELETED: "customer.deleted",
	},
	USER: {
		CREATED: "user.created",
		UPDATED: "user.updated",
		DELETED: "user.deleted",
	},
	INVITE: {
		ACCEPTED: "invite.accepted",
		CREATED: "invite.created",
		DELETED: "invite.deleted",
		RESENT: "invite.resent",
	},
	CART: {
		CREATED: "cart.created",
		UPDATED: "cart.updated",
		REGION_UPDATED: "cart.region_updated",
	},
	ORDER: {
		PLACED: "order.placed",
		CANCELED: "order.canceled",
		COMPLETED: "order.completed",
		ARCHIVED: "order.archived",
		FULFILLMENT_CREATED: "order.fulfillment_created",
		FULFILLMENT_CANCELED: "order.fulfillment_canceled",
		RETURN_REQUESTED: "order.return_requested",
		RETURN_RECEIVED: "order.return_received",
		CLAIM_CREATED: "order.claim_created",
		EXCHANGE_CREATED: "order.exchange_created",
		TRANSFER_REQUESTED: "order.transfer_requested",
	},
	PRODUCT: {
		CREATED: "product.created",
		UPDATED: "product.updated",
		DELETED: "product.deleted",
	},
	PRODUCT_CATEGORY: {
		CREATED: "product-category.created",
		UPDATED: "product-category.updated",
		DELETED: "product-category.deleted",
	},
	PRODUCT_COLLECTION: {
		CREATED: "product-collection.created",
		UPDATED: "product-collection.updated",
		DELETED: "product-collection.deleted",
	},
	PRODUCT_OPTION: {
		CREATED: "product-option.created",
		UPDATED: "product-option.updated",
		DELETED: "product-option.deleted",
	},
	PRODUCT_TAG: {
		CREATED: "product-tag.created",
		UPDATED: "product-tag.updated",
		DELETED: "product-tag.deleted",
	},
	PRODUCT_TYPE: {
		CREATED: "product-type.created",
		UPDATED: "product-type.updated",
		DELETED: "product-type.deleted",
	},
	PRODUCT_VARIANT: {
		CREATED: "product-variant.created",
		UPDATED: "product-variant.updated",
		DELETED: "product-variant.deleted",
	},
	REGION: {
		CREATED: "region.created",
		UPDATED: "region.updated",
		DELETED: "region.deleted",
	},
	SALES_CHANNEL: {
		CREATED: "sales-channel.created",
		UPDATED: "sales-channel.updated",
		DELETED: "sales-channel.deleted",
	},
};
