import { type MedusaResponse } from "@medusajs/framework/http";

export function setRateLimitHeaders(
	res: MedusaResponse,
	limit: number,
	remaining: number
) {
	res.setHeader("X-RateLimit-Limit", limit);
	res.setHeader("X-RateLimit-Remaining", remaining);
}
