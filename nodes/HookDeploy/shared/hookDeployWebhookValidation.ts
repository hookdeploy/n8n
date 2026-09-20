import { z } from 'zod';

export const HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS = [
	'request.received',
	'forwarding.succeeded',
	'forwarding.failed',
] as const;

export const HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS = [
	'incident.created',
	'incident.investigating',
	'incident.resolved',
	'incident.update_added',
] as const;

export const HOOKDEPLOY_TRIGGER_EVENTS = [
	...HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS,
	...HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS,
] as const;

export type HookDeployEndpointTriggerEventType =
	(typeof HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS)[number];
export type HookDeployIncidentTriggerEventType =
	(typeof HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS)[number];
export type HookDeployTriggerEventType = (typeof HOOKDEPLOY_TRIGGER_EVENTS)[number];

const hookDeployMetaSchema = z
	.object({
		request_id: z.string().min(1).max(200).optional(),
		endpoint_id: z.string().min(1).max(200).optional(),
		endpoint_slug: z.string().min(1).max(200).optional(),
		captured_at: z.string().min(1).max(100).optional(),
		method: z.string().min(1).max(32).optional(),
		source_ip: z.union([z.string().max(100), z.null()]).optional(),
		body_size_bytes: z.number().finite().optional(),
		event_type: z.enum(HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS).optional(),
	})
	.passthrough();

/**
 * HookDeploy endpoint-subscription deliveries are JSON objects with a
 * `hookdeploy` metadata envelope. Additional top-level keys (headers/body/query
 * or destination/result) are allowed so provider payloads can evolve.
 */
export const hookDeployWebhookPayloadSchema = z
	.object({
		hookdeploy: hookDeployMetaSchema,
	})
	.passthrough();

/**
 * Incident-subscription deliveries are a flat envelope from
 * buildIncidentEventEnvelope — no `hookdeploy` wrapper.
 */
export const hookDeployIncidentWebhookPayloadSchema = z
	.object({
		incident_id: z.string().min(1).max(200),
		organization_id: z.string().min(1).max(200),
		status: z.string().min(1).max(100),
		scope: z.string().min(1).max(100),
		destination_name: z.union([z.string().max(500), z.null()]).optional(),
		asn_org: z.union([z.string().max(500), z.null()]).optional(),
		likely_cause: z.string().max(4000).optional(),
		failure_count: z.number().finite().optional(),
		endpoint_count: z.number().finite().optional(),
		event_type: z.enum(HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS).optional(),
		occurred_at: z.string().min(1).max(100).optional(),
		update_body: z.string().max(8000).optional(),
		cron_job_id: z.union([z.string().max(200), z.null()]).optional(),
		destination_id: z.union([z.string().max(200), z.null()]).optional(),
		endpoint_id: z.union([z.string().max(200), z.null()]).optional(),
	})
	.passthrough();

export type HookDeployWebhookPayload = z.infer<typeof hookDeployWebhookPayloadSchema>;
export type HookDeployIncidentWebhookPayload = z.infer<
	typeof hookDeployIncidentWebhookPayloadSchema
>;

export function isHookDeployIncidentEvent(
	eventType: string,
): eventType is HookDeployIncidentTriggerEventType {
	return (HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS as readonly string[]).includes(eventType);
}

export function parseHookDeployWebhookBody(body: unknown) {
	const endpointParsed = hookDeployWebhookPayloadSchema.safeParse(body);
	if (endpointParsed.success) {
		return endpointParsed;
	}

	const incidentParsed = hookDeployIncidentWebhookPayloadSchema.safeParse(body);
	if (incidentParsed.success) {
		return incidentParsed;
	}

	return endpointParsed;
}
