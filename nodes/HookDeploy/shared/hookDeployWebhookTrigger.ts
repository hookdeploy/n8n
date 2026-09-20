import type {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import {
	isHookDeployIncidentEvent,
	parseHookDeployWebhookBody,
	type HookDeployTriggerEventType,
} from './hookDeployWebhookValidation';

const SUBSCRIPTIONS_URL = 'https://api.hookdeploy.dev/v1/subscriptions';
const INCIDENT_SUBSCRIPTIONS_URL = 'https://api.hookdeploy.dev/v1/incident-subscriptions';

export type { HookDeployTriggerEventType };

function getSubscriptionId(staticData: IDataObject): string | undefined {
	const subscriptionId = staticData.subscriptionId;
	return typeof subscriptionId === 'string' && subscriptionId.length > 0
		? subscriptionId
		: undefined;
}

function subscriptionsUrlForEvent(eventType: string): string {
	return isHookDeployIncidentEvent(eventType) ? INCIDENT_SUBSCRIPTIONS_URL : SUBSCRIPTIONS_URL;
}

export function subscriptionMatchesParameters(
	staticData: IDataObject,
	endpointId: string,
	eventType: HookDeployTriggerEventType,
): boolean {
	const subscriptionId = getSubscriptionId(staticData);
	if (!subscriptionId) {
		return false;
	}

	if (isHookDeployIncidentEvent(eventType)) {
		return staticData.eventType === eventType;
	}

	return staticData.endpointId === endpointId && staticData.eventType === eventType;
}

export function createHookDeployWebhookMethods() {
	return {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const eventType = this.getNodeParameter('event') as HookDeployTriggerEventType;
				const endpointId = isHookDeployIncidentEvent(eventType)
					? ''
					: (this.getNodeParameter('endpointId') as string);

				return subscriptionMatchesParameters(staticData, endpointId, eventType);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) {
					throw new Error('HookDeploy trigger webhook URL is unavailable.');
				}

				const eventType = this.getNodeParameter('event') as HookDeployTriggerEventType;
				const incidentEvent = isHookDeployIncidentEvent(eventType);
				const endpointId = incidentEvent
					? undefined
					: (this.getNodeParameter('endpointId') as string);

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'hookDeployApi',
					{
						method: 'POST',
						url: subscriptionsUrlForEvent(eventType),
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
									endpoint_id: endpointId,
									target_url: webhookUrl,
									platform: 'n8n',
									event_type: eventType,
								},
					},
				)) as IDataObject;

				const subscriptionId =
					typeof response.id === 'string'
						? response.id
						: typeof (response.data as IDataObject | undefined)?.id === 'string'
							? ((response.data as IDataObject).id as string)
							: undefined;

				if (!subscriptionId) {
					throw new Error('HookDeploy subscription response did not include an id.');
				}

				const staticData = this.getWorkflowStaticData('node');
				staticData.subscriptionId = subscriptionId;
				staticData.eventType = eventType;
				if (endpointId) {
					staticData.endpointId = endpointId;
				} else {
					delete staticData.endpointId;
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const subscriptionId = getSubscriptionId(staticData);
				const eventType =
					typeof staticData.eventType === 'string' ? staticData.eventType : '';

				if (subscriptionId) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(this, 'hookDeployApi', {
							method: 'DELETE',
							url: `${subscriptionsUrlForEvent(eventType)}/${subscriptionId}`,
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

	const parsed = parseHookDeployWebhookBody(body);
	if (!parsed.success) {
		this.logger.warn(
			`Ignored HookDeploy webhook with invalid payload: ${parsed.error.issues
				.map((issue) => issue.message)
				.join('; ')}`,
		);
		return {
			workflowData: [this.helpers.returnJsonArray([])],
		};
	}

	return {
		workflowData: [this.helpers.returnJsonArray([parsed.data as IDataObject])],
	};
}
