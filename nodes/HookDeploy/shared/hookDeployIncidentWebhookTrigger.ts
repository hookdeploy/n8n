import type {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import {
	isHookDeployIncidentEvent,
	parseHookDeployIncidentWebhookBody,
	type HookDeployIncidentTriggerEventType,
} from './hookDeployIncidentWebhookValidation';

const INCIDENT_SUBSCRIPTIONS_URL = 'https://api.hookdeploy.dev/v1/incident-subscriptions';

function getSubscriptionId(staticData: IDataObject): string | undefined {
	const subscriptionId = staticData.subscriptionId;
	return typeof subscriptionId === 'string' && subscriptionId.length > 0
		? subscriptionId
		: undefined;
}

function subscriptionMatchesParameters(
	staticData: IDataObject,
	eventType: HookDeployIncidentTriggerEventType,
): boolean {
	const subscriptionId = getSubscriptionId(staticData);
	if (!subscriptionId) {
		return false;
	}

	return staticData.eventType === eventType;
}

export function createHookDeployIncidentWebhookMethods() {
	return {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const eventType = this.getNodeParameter('event') as string;
				if (!isHookDeployIncidentEvent(eventType)) {
					return false;
				}

				return subscriptionMatchesParameters(staticData, eventType);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) {
					throw new Error('HookDeploy trigger webhook URL is unavailable.');
				}

				const eventType = this.getNodeParameter('event') as string;
				if (!isHookDeployIncidentEvent(eventType)) {
					throw new Error(`Unsupported HookDeploy incident event: ${eventType}`);
				}

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'hookDeployApi',
					{
						method: 'POST',
						url: INCIDENT_SUBSCRIPTIONS_URL,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: {
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
					throw new Error('HookDeploy incident subscription response did not include an id.');
				}

				const staticData = this.getWorkflowStaticData('node');
				staticData.subscriptionId = subscriptionId;
				staticData.eventType = eventType;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const subscriptionId = getSubscriptionId(staticData);

				if (subscriptionId) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(this, 'hookDeployApi', {
							method: 'DELETE',
							url: `${INCIDENT_SUBSCRIPTIONS_URL}/${subscriptionId}`,
							headers: {
								Accept: 'application/json',
							},
						});
					} catch (error) {
						this.logger.warn(
							`Failed to delete HookDeploy incident subscription ${subscriptionId}: ${
								error instanceof Error ? error.message : String(error)
							}`,
						);
					}
				}

				delete staticData.subscriptionId;
				delete staticData.eventType;
				return true;
			},
		},
	};
}

export async function handleHookDeployIncidentWebhook(
	this: IWebhookFunctions,
): Promise<IWebhookResponseData> {
	const body = this.getRequestObject().body;

	if (body === undefined || body === null) {
		return {
			workflowData: [this.helpers.returnJsonArray([{}])],
		};
	}

	const parsed = parseHookDeployIncidentWebhookBody(body);
	if (!parsed.success) {
		this.logger.warn(
			`Ignored HookDeploy incident webhook with invalid payload: ${parsed.error.issues
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
