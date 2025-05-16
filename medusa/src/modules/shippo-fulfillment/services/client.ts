import { MedusaError } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/types";
import {
	CarriersResponse,
	CreateShipmentRequest,
	ServiceGroupResponse,
	ShippoClientOptions,
	ShippoDistanceUnit,
	ShippoMassUnit,
	ShippoRate,
	ShippoShipment,
	UserParcelTemplate,
} from "../types";

import axios, { AxiosInstance } from "axios";
import { binPack3D } from "../utils/3dBinPack";
import { string } from "prop-types";

type InjectedDependencies = {
	logger: Logger;
};

export class ShippoClient {
	protected options_: ShippoClientOptions;
	private client_: AxiosInstance;
	private logger_: Logger;

	constructor({ logger }: InjectedDependencies, options: ShippoClientOptions) {
		this.options_ = options;
		this.client_ = axios.create({
			baseURL: options?.baseUrl ?? "https://api.goshippo.com",
			headers: {
				Authorization: `ShippoToken ${options.apiKey}`,
				"Content-Type": "application/json",
			},
		});

		this.logger_ = logger;
	}

	async getCarriers(): Promise<CarriersResponse> {
		const carriers = await this.client_.get(
			"/carrier_accounts?results=100&service_levels=true"
		);
		return { carriers: carriers.data.results };
	}

	async getServiceGroups(): Promise<ServiceGroupResponse> {
		const serviceGroups = await this.client_.get("/service-groups");
		return { serviceGroups: serviceGroups.data };
	}

	async getShippingRates(data: {
		shipment_object_id: string;
	}): Promise<ShippoRate[]> {
		// ! need to work on this
		const shipment_object_id = data?.shipment_object_id;

		const shipment_rates = await this.client_.get(
			`/shipments/${shipment_object_id}/rates`
		);

		return shipment_rates.data.results;
	}

	async createShipment(
		shipmentBody: CreateShipmentRequest
	): Promise<ShippoShipment> {
		try {
			const userParcelTemplate = (await this.getUserParcelTemplates()).map(
				(x) => ({
					...x,
					height: Number(x.height),
					length: Number(x.length),
					width: Number(x.width),
				})
			);

			// let parcel: any[] = [];

			// shipmentBody.parcels.map((p) => {
			// 	let [height, width, length] = [
			// 		Number(p.height),
			// 		Number(p.length),
			// 		Number(p.width),
			// 	].sort((a, b) => a - b);

			// 	const availableParcels = userParcelTemplate.filter((x) => {
			// 		const volume = length * width * height;
			// 		if (x.height * x.width * x.length >= volume) {
			// 			return true;
			// 		}
			// 		return false;
			// 	});

			// 	const selectedParcelTemplate = availableParcels
			// 		.filter((x) => {
			// 			let [templateHeight, templateWidth, templateLength] = [
			// 				Number(x.height),
			// 				Number(x.length),
			// 				Number(x.width),
			// 			].sort((a, b) => a - b);

			// 			if (
			// 				templateLength >= length &&
			// 				templateHeight >= height &&
			// 				templateWidth >= width
			// 			) {
			// 				return true;
			// 			}
			// 			return false;
			// 		})
			// 		.sort((a, b) => {
			// 			return a.height * a.width * a.length - b.height * b.width * b.width;
			// 		});

			// 	if (!selectedParcelTemplate.length) {
			// 		throw new Error("Parcel template not available");
			// 	}
			// 	const parcelData = selectedParcelTemplate[0];
			// 	parcel.push({
			// 		height: parcelData.height.toString(),
			// 		length: parcelData.length.toString(),
			// 		width: parcelData.width.toString(),
			// 		weight: p.weight.toString(),
			// 		distance_unit: parcelData.distance_unit,
			// 		mass_unit: ShippoMassUnit.GRAM,
			// 	});
			// });

			// if (!parcel.length) {
			// 	const parcelData = binPack3D(
			// 		shipmentBody.parcels.map((p) => ({
			// 			height: Number(p.height),
			// 			width: Number(p.width),
			// 			length: Number(p.length),
			// 			weight: Number(p.weight),
			// 		}))
			// 	);
			// 	parcel = [
			// 		{
			// 			height: parcelData.boundingBox.height,
			// 			length: parcelData.boundingBox.length,
			// 			width: parcelData.boundingBox.width,
			// 			weight: parcelData.weight,
			// 			distance_unit: ShippoDistanceUnit.INCH,
			// 			mass_unit: ShippoMassUnit.GRAM,
			// 		},
			// 	];
			// }

			const shipment = await this.client_.post(`/shipments`, {
				address_from: shipmentBody.address_from,
				address_to: shipmentBody.address_to,
				async: false,
				parcels: [
					{
						distance_unit: ShippoDistanceUnit.INCH,
						mass_unit: ShippoMassUnit.GRAM,
						height: userParcelTemplate?.[0]?.height.toString(),
						length: userParcelTemplate?.[0]?.length.toString(),
						width: userParcelTemplate?.[0]?.width.toString(),
						weight:
							userParcelTemplate?.[0]?.weight ||
							shipmentBody.parcels.reduce((p: number, c) => {
								return p + Number(c.weight);
							}, 0),
					},
				],
				// parcels: parcel.map((x) => ({
				// 	distance_unit: x.distance_unit,
				// 	mass_unit: x.mass_unit,
				// 	height: x.height.toString(),
				// 	length: x.length.toString(),
				// 	width: x.width.toString(),
				// 	weight: x.weight.toString(),
				// })),
			} as CreateShipmentRequest & { [k: string]: any });

			return shipment.data;
		} catch (error) {
			if ("response" in error) {
				const errorMessages: any[] = [];

				for (const [key, validationErrors] of Object.entries(
					error?.response?.data || {}
				)) {
					if (Array.isArray(validationErrors)) {
						validationErrors.forEach((error) => {
							if (error.__all__) {
								errorMessages.push(`${key}: ${error.__all__.join(", ")}`);
							} else {
								Object.entries(error).forEach(([field, messages]) => {
									if (Array.isArray(messages)) {
										errorMessages.push(
											`${key}.${field}: ${messages.join(", ")}`
										);
									}
								});
							}
						});
					}
				}

				console.log(errorMessages.join("; "));

				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					errorMessages.join("; ")
				);
			}

			if ("message" in error) {
				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					error.message
				);
			}

			throw new MedusaError(
				MedusaError.Types.UNEXPECTED_STATE,
				"Something went wrong"
			);
		}
	}

	async getShipment(shipment_object_id: string): Promise<ShippoShipment> {
		const shipment = await this.client_.get(`/shipments/${shipment_object_id}`);
		return shipment.data;
	}

	async getShipmentRates(shipment_object_id: string): Promise<ShippoRate[]> {
		this.logger_.log("getShipmentRates", shipment_object_id);

		const shipment_rates = await this.client_.get(
			`/shipments/${shipment_object_id}/rates`
		);

		return shipment_rates.data.results;
	}

	async purchaseLabelForShipment({
		rate,
		fileType,
		metadata,
	}: {
		rate: string;
		fileType?: string;
		metadata?: string;
	}): Promise<any> {
		try {
			const shipment_rates = await this.client_.post(`/transactions`, {
				rate,
				async: false,
				label_file_type: fileType || "PDF",
				metadata,
			});

			return shipment_rates.data;
		} catch (error) {
			if ("response" in error) {
				const errorMessages: any[] = [];

				console.dir({ response: error.response.data }, { depth: null });

				for (const [key, validationErrors] of Object.entries(
					error?.response?.data || {}
				)) {
					if (Array.isArray(validationErrors)) {
						validationErrors.forEach((error) => {
							if (error.__all__) {
								errorMessages.push(`${key}: ${error.__all__.join(", ")}`);
							} else {
								errorMessages.push(`${key}: ${error}`);
							}
						});
					}
				}

				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					errorMessages.join("; ")
				);
			}

			if ("message" in error) {
				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					error.message
				);
			}

			throw new MedusaError(
				MedusaError.Types.UNEXPECTED_STATE,
				"Something went wrong"
			);
		}
	}

	async getUserParcelTemplates(): Promise<UserParcelTemplate[]> {
		const user_parcel_templates = await this.client_.get(
			`/user-parcel-templates`
		);

		return user_parcel_templates?.data?.results || [];
	}

	// async voidLabel(id: string): Promise<any> {
	// 	return await this.sendRequest(`/labels/${id}/void`, {
	// 		method: "PUT",
	// 	});
	// }

	// async cancelShipment(id: string): Promise<void> {
	// 	return await this.sendRequest(`/shipments/${id}/cancel`, {
	// 		method: "PUT",
	// 	});
	// }
}
