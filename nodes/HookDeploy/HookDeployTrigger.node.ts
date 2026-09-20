import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
} from 'n8n-workflow';
import {
	createHookDeployWebhookMethods,
	handleHookDeployWebhook,
} from './shared/hookDeployWebhookTrigger';
import { HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS } from './shared/hookDeployWebhookValidation';

export class HookDeployTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HookDeploy Trigger',
		name: 'hookDeployTrigger',
		icon: { light: 'file:hookdeploy.svg', dark: 'file:hookdeploy.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when HookDeploy sends webhook events for an endpoint or incident',
		defaults: {
			name: 'HookDeploy Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'hookDeployApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Forwarding Failed',
						value: 'forwarding.failed',
						action: 'Forwarding Failed',
						description: 'Triggers when HookDeploy fails to forward a webhook to a destination',
					},
					{
						name: 'Forwarding Succeeded',
						value: 'forwarding.succeeded',
						action: 'Forwarding Succeeded',
						description:
							'Triggers when HookDeploy successfully forwards a webhook to a destination',
					},
					{
						name: 'Incident Investigating',
						value: 'incident.investigating',
						action: 'Incident Investigating',
						description: 'Triggers when an incident is marked as Investigating in HookDeploy',
					},
					{
						name: 'Incident Resolved',
						value: 'incident.resolved',
						action: 'Incident Resolved',
						description: 'Triggers when an incident is marked Resolved in HookDeploy',
					},
					{
						name: 'Incident Update Added',
						value: 'incident.update_added',
						action: 'Incident Update Added',
						description:
							'Triggers when a user adds a comment to an incident timeline in HookDeploy',
					},
					{
						name: 'New Incident',
						value: 'incident.created',
						action: 'New Incident',
						description:
							'Triggers when HookDeploy opens a new incident from correlated forward failures',
					},
					{
						name: 'New Webhook Received',
						value: 'request.received',
						action: 'New Webhook Received',
						description: 'Triggers when a webhook is captured on a HookDeploy endpoint',
					},
				],
				default: 'request.received',
			},
			{
				displayName: 'Endpoint ID',
				name: 'endpointId',
				type: 'string',
				required: true,
				default: '',
				description: 'The HookDeploy endpoint to watch for events',
				displayOptions: {
					show: {
						event: [...HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS],
					},
				},
			},
		],
		usableAsTool: true,
	};

	webhookMethods = createHookDeployWebhookMethods();

	async webhook(this: IWebhookFunctions) {
		return handleHookDeployWebhook.call(this);
	}
}
