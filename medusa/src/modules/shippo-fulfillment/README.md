# Shippo Fulfillment Provider for Medusa

This module provides integration with Shippo for fulfillment services in Medusa.

## Features

- Create shipments and generate shipping labels through Shippo
- Support for multiple carrier accounts
- Tracking information for shipments
- Cancel fulfillments and refund labels

## Installation

1. Install the Shippo package:

```bash
npm install shippo
```

2. Add your Shippo API key to your environment variables:

```
SHIPPO_API_KEY=your_shippo_api_key
```

## Configuration

Register the module in your Medusa configuration (medusa-config.js):

```javascript
module.exports = {
	// ... other config
	modules: {
		// ... other modules
		fulfillment: {
			resolve: "@medusajs/medusa/fulfillment",
			options: {
				providers: [
					// ... other providers
					{
						resolve: "./src/modules/shippo-fulfillment",
						id: "shippo",
						options: {
							apiKey: process.env.SHIPPO_API_KEY,
						},
					},
				],
			},
		},
	},
};
```

## Usage

### In the Medusa Admin

1. Add the Shippo Fulfillment Provider to a location
2. Add a delivery shipping option that uses the provider
3. Configure the carrier account for the shipping option

### Creating a Fulfillment

When creating a fulfillment in the Medusa Admin, select the Shippo provider and the appropriate carrier account. The provider will:

1. Create a shipment in Shippo
2. Generate a shipping label
3. Store tracking information in the fulfillment data

### Canceling a Fulfillment

When canceling a fulfillment, the provider will:

1. Refund the shipping label in Shippo
2. Update the fulfillment status

## Development

### Project Structure

- `client.ts`: Contains the ShippoClient class for interacting with the Shippo API
- `service.ts`: Contains the ShippoFulfillmentService class that implements the Medusa FulfillmentProvider interface
- `index.ts`: Exports the module definition

### Adding New Features

To add new features to the Shippo provider:

1. Add new methods to the ShippoClient class in `client.ts`
2. Implement the corresponding methods in the ShippoFulfillmentService class in `service.ts`
3. Update the module definition in `index.ts` if necessary

## License

MIT
