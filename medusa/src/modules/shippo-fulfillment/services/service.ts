import {
	CreateFulfillmentResult,
	FulfillmentItemDTO,
	FulfillmentOrderDTO,
	FulfillmentDTO,
	CreateShippingOptionDTO,
	Logger,
	CalculateShippingOptionPriceDTO,
	CalculatedShippingOptionPrice,
	FulfillmentOption,
	CartLineItemDTO,
	CartAddressDTO,
	ValidateFulfillmentDataContext,
} from "@medusajs/types";

import {
	AbstractFulfillmentProviderService,
	MedusaError,
} from "@medusajs/framework/utils";
import {
	Carrier,
	CreateShippoParcel,
	ServiceGroup,
	ShippoAddress,
	ShippoClientOptions,
	ShippoDistanceUnit,
	ShippoMassUnit,
	ShippoRate,
} from "../types";
import { ShippoClient } from "./client";

type InjectedDependencies = {
	logger: Logger;
};

class ShippoFulfillmentService extends AbstractFulfillmentProviderService {
	static identifier = "shippo-fulfillment";

	protected readonly logger_: Logger;
	protected readonly options_: ShippoClientOptions;
	protected readonly shippoClient_: ShippoClient;

	constructor({ logger }: InjectedDependencies, options: ShippoClientOptions) {
		super();
		this.logger_ = logger;
		this.options_ = options;
		this.shippoClient_ = new ShippoClient({ logger }, options);
	}

	private splitCarriersToServices(carriers: Carrier[]): FulfillmentOption[] {
		const services = carriers.flatMap((carrier) =>
			carrier.service_levels.map((service_type) => {
				const { service_levels, ...service } = {
					...service_type,
					...carrier,
					id: `shippo-fulfillment-${service_type.token}`,
					name: `${carrier.carrier_name} - ${service_type.name}`,
					is_group: false,
					token: service_type?.token,
					carrier_id: carrier.object_id,
				};
				return service;
			})
		);

		return services;
	}

	private splitServiceGroupToServices(
		serviceGroups: ServiceGroup[]
	): FulfillmentOption[] {
		const services = serviceGroups.flatMap((serviceGroup) =>
			serviceGroup.service_levels.map((service_level) => {
				const { service_levels, ...service } = {
					...serviceGroup,
					id: `shippo-fulfillment-${serviceGroup.object_id}-${service_level.service_level_token}`,
					name: `${serviceGroup.name} ${serviceGroup.description} - ${
						service_level.service_level_token
					} ${
						serviceGroup?.flat_rate &&
						`(${new Intl.NumberFormat("en-US", {
							style: "currency",
							currency: serviceGroup.flat_rate_currency,
						}).format(Number(serviceGroup.flat_rate))})`
					}`,
					is_group: true,
					token: service_level.service_level_token,
					carrier_id: service_level.account_object_id,
				};
				return service;
			})
		);

		return services;
	}

	private convertToShippoAddress(
		address: CartAddressDTO,
		email?: string
	): Partial<ShippoAddress> {
		return {
			name: `${address.first_name} ${address.last_name}`,
			street1: `${address.address_1}`,
			street2: `${address.address_2}`,
			city: `${address.city}`,
			state: `${address.province}`,
			zip: address.postal_code!,
			country: address.country_code!,
			phone: address.phone!,
			...(email ? { email: email } : {}),
		};
	}

	private generateParcelsFromCart(
		cartItems: CartLineItemDTO[]
	): CreateShippoParcel[] {
		const parcels = cartItems.reduce((p, c) => {
			if (Number(c.quantity ?? 0) > 1) {
				const currentParcels = Array.from(
					{ length: Number(c.quantity ?? 0) },
					() => ({
						weight: `${(c as any)?.variant?.weight}`,
						length: `${(c as any)?.variant?.length}`,
						width: `${(c as any)?.variant?.width}`,
						height: `${(c as any)?.variant?.height}`,
						distance_unit: ShippoDistanceUnit.INCH,
						mass_unit: ShippoMassUnit.GRAM,
					})
				);
				return [...p, ...currentParcels];
			} else {
				return [
					...p,
					{
						weight: `${(c as any)?.variant?.weight}`,
						length: `${(c as any)?.variant?.length}`,
						width: `${(c as any)?.variant?.width}`,
						height: `${(c as any)?.variant?.height}`,
						distance_unit: ShippoDistanceUnit.INCH,
						mass_unit: ShippoMassUnit.GRAM,
					},
				];
			}
		}, []);

		return parcels;
	}

	private async createShipmentWithRate({
		from_location,
		shipping_address,
		items,
		carrier_id,
		context_id,
		token,
	}) {
		const shipment = await this.shippoClient_.createShipment({
			address_from: {
				name: from_location.address.company ?? "",
				country: from_location.address.country_code ?? "",
				phone: from_location.address.phone ?? "",
				company: from_location.address.company ?? "",
				city: from_location.address.city ?? "",
				state: from_location.address.province ?? "",
				zip: from_location.address.postal_code ?? "",
				street1: from_location.address.address_1 ?? "",
				street2: from_location.address.address_2 ?? "",
			},
			address_to: this.convertToShippoAddress(shipping_address),
			parcels: this.generateParcelsFromCart(items),
			...(carrier_id ? { carrier_accounts: [carrier_id] } : {}),
			metadata: context_id,
		});

		const rate = shipment?.rates?.find(
			(rate) => rate.servicelevel?.token === token
		);

		console.dir(
			{ token, shipmentRates: shipment?.rates, rate },
			{ depth: null }
		);

		return {
			shipment,
			rate,
		};
	}

	async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
		this.logger_.log("getFulfillmentOptions called");

		try {
			const { carriers } = await this.shippoClient_.getCarriers();
			const { serviceGroups } = await this.shippoClient_.getServiceGroups();

			let fulfillmentOptions: FulfillmentOption[] = [];
			let fulfillmentOptionsServiceGroups: FulfillmentOption[] = [];

			const activeCarriers = carriers.filter((carrier) => carrier.active);

			const activeServiceGroups = serviceGroups?.filter(
				(serviceGroup) => serviceGroup?.is_active
			);

			// fulfillmentOptions = this.splitCarriersToServices(activeCarriers);

			fulfillmentOptionsServiceGroups =
				this.splitServiceGroupToServices(activeServiceGroups);

			return [...fulfillmentOptions, ...fulfillmentOptionsServiceGroups].map(
				(x) => ({
					...x,
					provider_id: ShippoFulfillmentService.identifier,
					provider_name: "Shippo",
				})
			);
		} catch (error) {
			this.logger_.error("Error getting fulfillment options:", error);
			return [];
		}
	}

	async validateFulfillmentData(
		optionData: Record<string, unknown>,
		data: Record<string, unknown>,
		context: ValidateFulfillmentDataContext
	): Promise<Record<string, unknown>> {
		this.logger_.log("validateFulfillmentData called");

		console.dir({ optionData, data, context }, { depth: null });

		let shipment_id = data?.shipment_id || undefined;

		const { carrier_id, token } = optionData as {
			carrier_id?: string;
			token?: string;
		};

		if (!carrier_id) {
			throw new Error("Carrier account is required");
		}

		let rate: ShippoRate | undefined = undefined;

		let shipment: any | undefined = undefined;

		if (!shipment_id) {
			if (!context.from_location?.address || !context.shipping_address) {
				throw new MedusaError(
					MedusaError.Types.NOT_FOUND,
					`${!context.from_location?.address && "from_location, "} ${
						!context.shipping_address ? "shipping_address, " : ""
					} not provided, validation failed`
				);
			}

			if (!context.items?.length) {
				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					"Cart has no items"
				);
			}

			const response = await this.createShipmentWithRate({
				from_location: context.from_location,
				carrier_id: carrier_id,
				context_id: context?.id,
				shipping_address: context.shipping_address,
				token: token,
				items: context.items,
			});

			shipment = response.shipment;
			shipment_id = shipment?.object_id;
			rate = response.rate;
		}

		if (!shipment_id) {
			throw new MedusaError(
				MedusaError.Types.UNEXPECTED_STATE,
				"shipment id not found"
			);
		}

		return {
			...data,
			carrier_id,
			shipment_id,
			shipment,
			rate_id: rate?.object_id,
			rate,
		};
	}

	async validateOption(data: Record<string, unknown>): Promise<boolean> {
		return data.carrier_id !== undefined;
	}

	async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
		this.logger_.info("can calculated");

		if (
			(data?.data as { type?: string })?.type === "FLAT_RATE" &&
			(data?.data as { flat_rate?: string })?.flat_rate
		) {
			return false;
		}
		return true;
	}

	// Facing issue with calculated Price function to generate dynamic price
	async calculatePrice(
		optionData: CalculateShippingOptionPriceDTO["optionData"],
		data: CalculateShippingOptionPriceDTO["data"],
		context: CalculateShippingOptionPriceDTO["context"]
	): Promise<CalculatedShippingOptionPrice> {
		this.logger_.log("calculatePrice called");

		console.dir({ data, optionData, context }, { depth: null });

		let shipment_id = data?.shipment_id || undefined;

		const { carrier_id, token } = optionData as {
			carrier_id?: string;
			token?: string;
		};

		if (!carrier_id || !token) {
			throw new Error("Carrier account and service level token is required");
		}

		let rate: ShippoRate | undefined = undefined;

		let shipment: any | undefined = undefined;

		if (!shipment_id) {
			if (!context.from_location?.address || !context.shipping_address) {
				throw new MedusaError(
					MedusaError.Types.NOT_FOUND,
					`${!context.from_location?.address && "from_location, "} ${
						!context.shipping_address ? "shipping_address, " : ""
					} not provided, validation failed`
				);
			}

			if (!context.items?.length) {
				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					"Cart has no items"
				);
			}

			const response = await this.createShipmentWithRate({
				from_location: context.from_location,
				carrier_id: carrier_id,
				context_id: context?.id,
				shipping_address: context.shipping_address,
				token: token,
				items: context.items,
			});

			shipment = response.shipment;
			shipment_id = shipment?.object_id;
			rate = response.rate;
		}

		console.log("calculated price", { shipment_id, rate });

		if (!shipment_id) {
			throw new MedusaError(
				MedusaError.Types.UNEXPECTED_STATE,
				"shipment id not found"
			);
		}

		return {
			...data,
			...({
				carrier_id,
				shipment_id,
				shipment,
				rate_id: rate?.object_id,
				rate,
			} as any),
			calculated_amount: Number(rate?.amount),
			is_calculated_price_tax_inclusive: true,
		};
	}

	async createFulfillment(
		data: Record<string, unknown>,
		items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
		order: Partial<FulfillmentOrderDTO> | undefined,
		fulfillment: Partial<FulfillmentDTO>
	): Promise<CreateFulfillmentResult> {
		this.logger_.log("createFulfillment called");

		let { shipment_id, rate_id } = data as {
			shipment_id: string;
			rate_id?: string;
		};

		const originalShipment = await this.shippoClient_.getShipment(shipment_id);

		const orderItemsToFulfill = [];

		items.map((item) => {
			// @ts-ignore
			const orderItem = order.items.find((i) => i.id === item.line_item_id);

			if (!orderItem) {
				return;
			}

			// @ts-ignore
			orderItemsToFulfill.push({
				...orderItem,
				// @ts-ignore
				quantity: item.quantity,
			});
		});

		console.dir({ orderItemsToFulfill, originalShipment }, { depth: null });

		if (!rate_id) {
			const rate = originalShipment.rates?.find(
				(rate) => rate.servicelevel?.token === data?.token
			);
			console.log({ rate });

			if (rate?.object_id) {
				rate_id = rate.object_id;
			} else {
				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					"rate_id not found"
				);
			}
		}

		const label = await this.shippoClient_.purchaseLabelForShipment({
			rate: rate_id,
		});

		this.logger_.log("create fulfillment label created");
		console.dir({ label }, { depth: null });

		if (label.status === "ERROR") {
			throw new MedusaError(
				MedusaError.Types.UNEXPECTED_STATE,
				label?.messages
					?.map((message) => `${message?.source}-${message?.text}`)
					.join("; ")
			);
		}

		return {
			data: {
				...data,
				label,
			},
			labels: [
				{
					tracking_number: label.tracking_number,
					tracking_url: label.tracking_url_provider,
					label_url: label.label_url,
				},
			],
		};
	}

	// async cancelFulfillment(data: Record<string, unknown>): Promise<any> {
	// 	// const { shippo_transaction_id } = data;
	// 	// if (shippo_transaction_id) {
	// 	// 	try {
	// 	// 		await this.shippoClient_.refundTransaction(
	// 	// 			shippo_transaction_id as string
	// 	// 		);
	// 	// 	} catch (error) {
	// 	// 		this.logger_.error("Error canceling fulfillment:", error);
	// 	// 		throw error;
	// 	// 	}
	// 	// }
	// }

	// async getFulfillmentDocuments(
	// 	data: Record<string, unknown>
	// ): Promise<never[]> {
	// 	// This is a placeholder. In a real implementation, you would retrieve documents from Shippo
	// 	return [];
	// }

	// async createReturnFulfillment(
	// 	fulfillment: Record<string, unknown>
	// ): Promise<CreateFulfillmentResult> {
	// 	// This is a placeholder. In a real implementation, you would create a return fulfillment in Shippo
	// 	return {
	// 		data: {
	// 			...((fulfillment.data as object) || {}),
	// 		},
	// 		labels: [],
	// 	};
	// }

	// async getReturnDocuments(data: Record<string, unknown>): Promise<never[]> {
	// 	// This is a placeholder. In a real implementation, you would retrieve return documents from Shippo
	// 	return [];
	// }

	// async getShipmentDocuments(data: Record<string, unknown>): Promise<never[]> {
	// 	// This is a placeholder. In a real implementation, you would retrieve shipment documents from Shippo
	// 	return [];
	// }

	// async retrieveDocuments(
	// 	fulfillmentData: Record<string, unknown>,
	// 	documentType: string
	// ): Promise<void> {
	// 	// This is a placeholder. In a real implementation, you would retrieve documents of a specific type from Shippo
	// }
}

export default ShippoFulfillmentService;
