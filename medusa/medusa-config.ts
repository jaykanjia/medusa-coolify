import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import EmailPassAuthProvider from "@medusajs/medusa/auth-emailpass";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

let eventBus = [
	{
		resolve: "@medusajs/medusa/event-bus-local",
		options: {},
	},
];

if (process.env.NODE_ENV === "production") {
	eventBus = [
		{
			resolve: "@medusajs/medusa/cache-redis",
			options: {
				redisUrl: process.env.REDIS_URL,
			},
		},
		{
			resolve: "@medusajs/medusa/event-bus-redis",
			options: {
				redisUrl: process.env.REDIS_URL,
			},
		},
		{
			resolve: "@medusajs/medusa/workflow-engine-redis",
			options: {
				redis: {
					url: process.env.REDIS_URL,
				},
			},
		},
	];
}

export const enabledModules = [
	// {
	// 	resolve: "./src/modules/brand",
	// },
	// {
	// 	resolve: "./src/modules/product-filter",
	// },
	// {
	// 	resolve: "./src/modules/product-variant-images",
	// },
	// {
	// 	resolve: "./src/modules/product-seo",
	// },
	//
	//
	// {
	// 	resolve: "./src/modules/klaviyo",
	// 	options: {
	// 		apiKey: process.env.KLAVIYO_API_KEY,
	// 	},
	// },
	// {
	// 	resolve: "./src/modules/product-additional-details",
	// },
	// {
	// 	resolve: "./src/modules/product-category-details",
	// },
	// {
	// 	resolve: "./src/modules/promotion-additional-details",
	// },
	// {
	// 	resolve: "./src/modules/blog",
	// },
	// {
	// 	resolve: "./src/modules/faq",
	// },
];

module.exports = defineConfig({
	projectConfig: {
		databaseUrl: process.env.DATABASE_URL,
		redisUrl: process.env.REDIS_URL,
		workerMode: process.env.WORKER_MODE as "shared" | "worker" | "server",
		http: {
			storeCors: process.env.STORE_CORS!,
			adminCors: process.env.ADMIN_CORS!,
			authCors: process.env.AUTH_CORS!,
			jwtSecret: process.env.JWT_SECRET || "supersecret",
			cookieSecret: process.env.COOKIE_SECRET || "supersecret",
		},
	},

	admin: {
		disable: process.env.DISABLE_ADMIN === "true",
		backendUrl: process.env.BACKEND_URL,
	},

	plugins: [
		{
			resolve: "@tsc_tech/medusa-plugin-brand",
			options: {},
		},
		{
			resolve: "@tsc_tech/medusa-plugin-auth-passkey",
			options: {},
		},
		{
			resolve: `@tsc_tech/medusa-plugin-product-filter`,
			options: {},
		},
		{
			resolve: "@tsc_tech/medusa-plugin-product-variant-images",
			options: {},
		},
		{
			resolve: "@tsc_tech/medusa-plugin-product-seo",
			options: {},
		},
		{
			resolve: "@rokmohar/medusa-plugin-meilisearch",
			options: {
				config: {
					host: process.env.MEILISEARCH_HOST ?? "",
					apiKey: process.env.MEILISEARCH_API_KEY ?? "",
				},
				settings: {
					// The key is used as the index name in Meilisearch
					products: {
						// Required: Index type
						type: "products",
						// Optional: Whether the index is enabled. When disabled:
						// - Index won't be created or updated
						// - Documents won't be added or removed
						// - Index won't be included in searches
						// - All operations will be silently skipped
						enabled: true,
						// Optional: Specify which fields to include in the index
						// If not specified, all fields will be included
						fields: [
							"id",
							"title",
							"description",
							"handle",
							"variant_sku",
							"thumbnail",
						],
						indexSettings: {
							searchableAttributes: ["title", "description", "variant_sku"],
							displayedAttributes: [
								"id",
								"handle",
								"title",
								"description",
								"variant_sku",
								"thumbnail",
							],
							filterableAttributes: ["id", "handle"],
						},
						primaryKey: "id",
						// Create your own transformer
						/*transformer: (product) => ({
              id: product.id,
              // other attributes...
            }),*/
					},
				},
			},
		},
	],

	modules: [
		...eventBus,
		...enabledModules,
		{
			resolve: "@medusajs/medusa/payment",
			options: {
				providers: [
					{
						resolve: "./src/modules/ravcent-payment",
						id: "ravcent",
						options: {
							REVCENT_API_KEY: process.env.REVCENT_API_KEY,
							REVCENT_API_ENDPOINT: process.env.REVCENT_API_ENDPOINT,
							REVCENT_CAMPAIGN_ID: process.env.REVCENT_CAMPAIGN_ID,
							REVCENT_PAYMENT_PROFILE_ID:
								process.env.REVCENT_PAYMENT_PROFILE_ID,
							REVCENT_PRODUCT_ID: process.env.REVCENT_PRODUCT_ID,
						},
					},
				],
			},
		},
		{
			resolve: "@medusajs/medusa/file",
			options: {
				providers: [
					{
						resolve: "@medusajs/medusa/file-s3",
						id: "s3",
						options: {
							file_url: process.env.MINIO_S3_FILE_URL,
							access_key_id: process.env.MINIO_S3_ACCESS_KEY_ID,
							secret_access_key: process.env.MINIO_S3_SECRET_ACCESS_KEY,
							region: process.env.MINIO_S3_REGION,
							bucket: process.env.MINIO_S3_BUCKET,
							endpoint: process.env.MINIO_S3_ENDPOINT,
							additional_client_config: {
								forcePathStyle: true,
							},
						},
					},
				],
			},
		},
		{
			resolve: "@medusajs/medusa/notification",
			options: {
				providers: [
					{
						resolve: "./src/modules/smtp",
						id: "smtp",
						options: {
							channels: ["email", "feed"],
							fromEmail: process.env.SMTP_FROM,
							transport: {
								host: process.env.SMTP_HOST || "smtp.gmail.com",
								port: process.env.SMTP_PORT || 465,
								secure: process.env.SMTP_SECURE || false,
								auth: {
									user: process.env.SMTP_AUTH_USER,
									pass: process.env.SMTP_AUTH_PASS,
								},
							},
						},
					},
					{
						resolve: "./src/modules/twillo",
						id: "twillo",
						options: {
							channels: ["sms"],
						},
					},
				],
			},
		},
		{
			resolve: "@medusajs/medusa/fulfillment",
			options: {
				providers: [
					{
						resolve: "@medusajs/medusa/fulfillment-manual",
						id: "manual",
					},
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
		{
			resolve: "@medusajs/medusa/auth",
			options: {
				providers: [
					{
						resolve: EmailPassAuthProvider,
						id: "emailpass",
					},
					{
						resolve:
							"@tsc_tech/medusa-plugin-auth-passkey/providers/auth-passkey",
						id: "auth-passkey",
						options: {
							rpID: process.env.RP_ID,
							rpName: process.env.RP_NAME,
							enableHTTPS: process.env.ENABLE_HTTPS === "true" ? true : false,
						},
					},
					{
						resolve: "@tsc_tech/medusa-plugin-auth-passkey/providers/auth",
						id: "otp",
					},
				],
			},
		},
	],
});
