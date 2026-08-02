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

const endpointScopedEvents = [
	'forwarding.failed',
	'forwarding.succeeded',
	'request.received',
];

export class HookDeployTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HookDeploy Trigger',
		name: 'hookDeployTrigger',
		icon: { light: 'file:hookdeploy.svg', dark: 'file:hookdeploy.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle:
			'={{$parameter["event"] + ($parameter["endpointId"] ? ": " + $parameter["endpointId"] : "")}}',
		description: 'Triggers on HookDeploy webhook and incident events',
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
						name: 'Incident Created',
						value: 'incident.created',
						action: 'Incident Created',
						description: 'Triggers when HookDeploy opens a new incident from forward failures',
					},
					{
						name: 'Incident Investigating',
						value: 'incident.investigating',
						action: 'Incident Investigating',
						description: 'Triggers when an incident is marked as Investigating',
					},
					{
						name: 'Incident Resolved',
						value: 'incident.resolved',
						action: 'Incident Resolved',
						description: 'Triggers when an incident is marked Resolved',
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
						event: endpointScopedEvents,
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
