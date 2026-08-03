import { z } from 'zod';

export const HOOKDEPLOY_TRIGGER_EVENTS = [
	'request.received',
	'forwarding.succeeded',
	'forwarding.failed',
] as const;

const hookDeployMetaSchema = z
	.object({
		request_id: z.string().min(1).max(200).optional(),
		endpoint_id: z.string().min(1).max(200).optional(),
		endpoint_slug: z.string().min(1).max(200).optional(),
		captured_at: z.string().min(1).max(100).optional(),
		method: z.string().min(1).max(32).optional(),
		source_ip: z.union([z.string().max(100), z.null()]).optional(),
		body_size_bytes: z.number().finite().optional(),
		event_type: z.enum(HOOKDEPLOY_TRIGGER_EVENTS).optional(),
	})
	.passthrough();

/**
 * HookDeploy subscription deliveries are JSON objects with a `hookdeploy`
 * metadata envelope. Additional top-level keys (headers/body/query or
 * destination/result) are allowed so provider payloads can evolve.
 */
export const hookDeployWebhookPayloadSchema = z
	.object({
		hookdeploy: hookDeployMetaSchema,
	})
	.passthrough();

export type HookDeployWebhookPayload = z.infer<typeof hookDeployWebhookPayloadSchema>;

export function parseHookDeployWebhookBody(body: unknown) {
	return hookDeployWebhookPayloadSchema.safeParse(body);
}
