import { z } from 'zod';

export const HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS = [
	'incident.created',
	'incident.investigating',
	'incident.resolved',
	'incident.update_added',
] as const;

export type HookDeployIncidentTriggerEventType =
	(typeof HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS)[number];

const hookDeployIncidentWebhookSchema = z
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
		endpoint_name: z.string().max(500).optional(),
		endpoint_slug: z.string().max(200).optional(),
		org_slug: z.string().max(200).optional(),
	})
	.passthrough();

export type HookDeployIncidentWebhookPayload = z.infer<typeof hookDeployIncidentWebhookSchema>;

export function isHookDeployIncidentEvent(
	eventType: string,
): eventType is HookDeployIncidentTriggerEventType {
	return (HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS as readonly string[]).includes(eventType);
}

export function parseHookDeployIncidentWebhookBody(body: unknown) {
	return hookDeployIncidentWebhookSchema.safeParse(body);
}
