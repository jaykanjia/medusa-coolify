import { type ConfigModule, type MedusaRequest } from "@medusajs/framework";
import { DEFAULT_OPTIONS, type PluginOptions } from "../constants";

export function getExtendedPluginOptions(
	scope: MedusaRequest["scope"]
): PluginOptions {
	const configModule = scope.resolve<ConfigModule>("configModule");
	const plugins = configModule.plugins;

	if (!plugins || plugins.length === 0) {
		return DEFAULT_OPTIONS;
	}

	const hasResolveAndOptions = (
		plugin: (typeof plugins)[number]
	): plugin is { resolve: string; options: Record<string, unknown> } => {
		return (
			typeof plugin === "object" &&
			plugin !== null &&
			"resolve" in plugin &&
			"options" in plugin
		);
	};

	return {
		limit: DEFAULT_OPTIONS.limit,
		window: DEFAULT_OPTIONS.window,
		includeHeaders: DEFAULT_OPTIONS.includeHeaders,
	};
}
