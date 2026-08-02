import type {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

const SUBSCRIPTIONS_URL = 'https://api.hookdeploy.dev/v1/subscriptions';
const INCIDENT_SUBSCRIPTIONS_URL = 'https://api.hookdeploy.dev/v1/incident-subscriptions';

export type HookDeployTriggerEventType =
	| 'request.received'
	| 'forwarding.succeeded'
	| 'forwarding.failed'
	| 'incident.created'
	| 'incident.investigating'
	| 'incident.resolved';

function isIncidentEvent(eventType: HookDeployTriggerEventType): boolean {
	return (
		eventType === 'incident.created' ||
		eventType === 'incident.investigating' ||
		eventType === 'incident.resolved'
	);
}

function getSubscriptionId(staticData: IDataObject): string | undefined {
	const subscriptionId = staticData.subscriptionId;
	return typeof subscriptionId === 'string' && subscriptionId.length > 0
		? subscriptionId
		: undefined;
}

function extractSubscriptionId(response: IDataObject): string | undefined {
	if (typeof response.id === 'string') {
		return response.id;
	}
	const nested = response.data as IDataObject | undefined;
	if (typeof nested?.id === 'string') {
		return nested.id;
	}
	return undefined;
}

function subscriptionMatchesParameters(
	staticData: IDataObject,
	eventType: HookDeployTriggerEventType,
	endpointId?: string,
): boolean {
	const subscriptionId = getSubscriptionId(staticData);
	if (!subscriptionId) {
		return false;
	}

	if (staticData.eventType !== eventType) {
		return false;
	}

	if (isIncidentEvent(eventType)) {
		return true;
	}

	return staticData.endpointId === endpointId;
}

export function createHookDeployWebhookMethods() {
	return {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const eventType = this.getNodeParameter('event') as HookDeployTriggerEventType;

				if (isIncidentEvent(eventType)) {
					return subscriptionMatchesParameters(staticData, eventType);
				}

				const endpointId = this.getNodeParameter('endpointId') as string;
				return subscriptionMatchesParameters(staticData, eventType, endpointId);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) {
					throw new Error('HookDeploy trigger webhook URL is unavailable.');
				}

				const eventType = this.getNodeParameter('event') as HookDeployTriggerEventType;
				const incidentEvent = isIncidentEvent(eventType);

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'hookDeployApi',
					{
						method: 'POST',
						url: incidentEvent ? INCIDENT_SUBSCRIPTIONS_URL : SUBSCRIPTIONS_URL,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: incidentEvent
							? {
									target_url: webhookUrl,
									platform: 'n8n',
									event_type: eventType,
								}
							: {
									endpoint_id: this.getNodeParameter('endpointId') as string,
									target_url: webhookUrl,
									platform: 'n8n',
									event_type: eventType,
								},
					},
				)) as IDataObject;

				const subscriptionId = extractSubscriptionId(response);
				if (!subscriptionId) {
					throw new Error('HookDeploy subscription response did not include an id.');
				}

				const staticData = this.getWorkflowStaticData('node');
				staticData.subscriptionId = subscriptionId;
				staticData.eventType = eventType;

				if (incidentEvent) {
					delete staticData.endpointId;
				} else {
					staticData.endpointId = this.getNodeParameter('endpointId') as string;
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const subscriptionId = getSubscriptionId(staticData);
				const eventType = staticData.eventType as HookDeployTriggerEventType | undefined;
				const baseUrl =
					eventType && isIncidentEvent(eventType)
						? INCIDENT_SUBSCRIPTIONS_URL
						: SUBSCRIPTIONS_URL;

				if (subscriptionId) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(this, 'hookDeployApi', {
							method: 'DELETE',
							url: `${baseUrl}/${subscriptionId}`,
							headers: {
								Accept: 'application/json',
							},
						});
					} catch (error) {
						this.logger.warn(
							`Failed to delete HookDeploy subscription ${subscriptionId}: ${
								error instanceof Error ? error.message : String(error)
							}`,
						);
					}
				}

				delete staticData.subscriptionId;
				delete staticData.endpointId;
				delete staticData.eventType;
				return true;
			},
		},
	};
}

export async function handleHookDeployWebhook(
	this: IWebhookFunctions,
): Promise<IWebhookResponseData> {
	const body = this.getRequestObject().body;

	if (body === undefined || body === null) {
		return {
			workflowData: [this.helpers.returnJsonArray([{}])],
		};
	}

	if (typeof body === 'object' && !Array.isArray(body)) {
		return {
			workflowData: [this.helpers.returnJsonArray([body as IDataObject])],
		};
	}

	return {
		workflowData: [this.helpers.returnJsonArray([{ body }])],
	};
}
