import type {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

const SUBSCRIPTIONS_URL = 'https://api.hookdeploy.dev/v1/subscriptions';

export type HookDeployTriggerEventType =
	| 'request.received'
	| 'forwarding.succeeded'
	| 'forwarding.failed';

function getSubscriptionId(staticData: IDataObject): string | undefined {
	const subscriptionId = staticData.subscriptionId;
	return typeof subscriptionId === 'string' && subscriptionId.length > 0
		? subscriptionId
		: undefined;
}

function subscriptionMatchesParameters(
	staticData: IDataObject,
	endpointId: string,
	eventType: HookDeployTriggerEventType,
): boolean {
	const subscriptionId = getSubscriptionId(staticData);
	if (!subscriptionId) {
		return false;
	}

	return (
		staticData.endpointId === endpointId &&
		staticData.eventType === eventType
	);
}

export function createHookDeployWebhookMethods() {
	return {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const endpointId = this.getNodeParameter('endpointId') as string;
				const eventType = this.getNodeParameter('event') as HookDeployTriggerEventType;

				return subscriptionMatchesParameters(staticData, endpointId, eventType);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) {
					throw new Error('HookDeploy trigger webhook URL is unavailable.');
				}

				const endpointId = this.getNodeParameter('endpointId') as string;
				const eventType = this.getNodeParameter('event') as HookDeployTriggerEventType;

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'hookDeployApi',
					{
						method: 'POST',
						url: SUBSCRIPTIONS_URL,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: {
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
				staticData.endpointId = endpointId;
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
							url: `${SUBSCRIPTIONS_URL}/${subscriptionId}`,
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
