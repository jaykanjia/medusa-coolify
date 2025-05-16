export type ShippoClientOptions = {
	apiKey: string;
	baseUrl?: string;
};

export enum ShippoDistanceUnit {
	INCH = "in",
	CENTIMETER = "cm",
	FOOT = "ft",
	YARD = "yd",
	METER = "m",
}

export enum ShippoMassUnit {
	POUND = "lb",
	OUNCE = "oz",
	GRAM = "g",
	KILOGRAM = "kg",
}

export type ServiceLevel = {
	name: string;
	token: string;
	supports_return_labels: boolean;
};

export type Carrier = {
	carrier: string;
	object_id: string;
	object_owner: string;
	account_id: string;
	parameters: Record<string, unknown>;
	test: boolean;
	active: boolean;
	is_shippo_account: boolean;
	metadata: string;
	carrier_name: string;
	carrier_images: {
		"75": string;
		"200": string;
	};
	service_levels: ServiceLevel[];
	object_info: {
		authentication: {
			type: string;
		};
	};
};

export type CarriersResponse = {
	carriers: Carrier[];
};

export type UserParcelTemplate = {
	distance_unit: "cm" | "in";
	height: string;
	length: string;
	name: string;
	weight: string;
	weight_unit: "lb" | "kg";
	width: string;
	object_created: string | Date;
	object_id: string;
	object_owner: string;
	object_updated: string | Date;
	template?: {
		carrier: string;
		distance_unit: "cm" | "in";
		height: string;
		is_variable_dimensions: false;
		length: string;
		name: string;
		token: string;
		width: string;
	};
};

export type ServiceGroup = {
	object_id: string;
	name: string;
	description: string;
	flat_rate: string;
	is_active: boolean;
	flat_rate_currency: string;
	free_shipping_threshold_currency: string;
	free_shipping_threshold_min: string;
	rate_adjustment: string;
	service_levels: {
		account_object_id: string;
		service_level_token: string;
	}[];
	type: "FLAT_RATE" | "FREE_SHIPPING" | string;
};

export type ServiceGroupResponse = {
	serviceGroups: ServiceGroup[];
};

export type ValidationMessage = {
	source: string;
	code: string;
	text: string;
	type?: string;
};

export type ValidationResults = {
	is_valid: boolean;
	messages: ValidationMessage[];
};

export type ShippoAddress = {
	name: string;
	street1: string;
	street2: string;
	street3: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	street_no: string;
	phone: string;
	email: string;
	company: string;
	is_residential: boolean;
	test: boolean;
	object_id: string;
	is_complete: boolean;
	validation_results: ValidationResults;
};

export type ShipmentMessage = {
	source: string;
	code: string;
	text: string;
};

export type ShippoParcel = {
	object_owner: string;
	object_state: string;
	mass_unit: string;
	template: null;
	extra: Record<string, unknown>;
	metadata: string;
	test: boolean;
	object_id: string;
	object_created: string;
	object_updated: string;
	length: string;
	width: string;
	height: string;
	distance_unit: string;
	weight: string;
	line_items: any[];
};

export type ServiceLevelDetail = {
	name: string;
	token: string;
	terms: string;
	extended_token: string;
	display_name: string | null;
	parent_servicelevel: null;
};

export type ShippoRate = {
	object_id: string;
	object_created: string;
	object_owner: string;
	shipment: string;
	amount: string;
	currency: string;
	amount_local: string;
	currency_local: string;
	attributes: string[];
	provider: string;
	provider_image_75: string;
	provider_image_200: string;
	arrives_by: string | null;
	duration_terms: string;
	messages: any[];
	carrier_account: string;
	zone: string | null;
	test: boolean;
	servicelevel: ServiceLevelDetail;
	estimated_days: number;
	included_insurance_price: null;
};

export type ShippoShipment = {
	object_id: string;
	object_created: string;
	object_updated: string;
	object_owner: string;
	test: boolean;
	metadata: string;
	messages: ShipmentMessage[];
	extra: Record<string, unknown>;
	order: null;
	carrier_accounts: string[];
	address_from: ShippoAddress;
	address_to: ShippoAddress;
	address_return: ShippoAddress;
	parcels: ShippoParcel[];
	status: string;
	shipment_date: string;
	rates: ShippoRate[];
	alternate_address_to: null;
	customs_declaration: null;
};

export type CreateShippoParcel = {
	weight: string;
	length: string;
	width: string;
	height: string;
	distance_unit: ShippoDistanceUnit;
	mass_unit: ShippoMassUnit;
};

export type CreateShipmentRequest = {
	address_from: Partial<ShippoAddress>;
	address_to: Partial<ShippoAddress>;
	parcels: CreateShippoParcel[];
	carrier_accounts?: string[];
	metadata?: string;
};
