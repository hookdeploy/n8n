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

export class HookDeployTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HookDeploy Trigger',
		name: 'hookDeployTrigger',
		icon: { light: 'file:hookdeploy.svg', dark: 'file:hookdeploy.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"] + ": " + $parameter["endpointId"]}}',
		description: 'Triggers when HookDeploy sends webhook events for an endpoint',
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
			},
		],
		usableAsTool: true,
	};

	webhookMethods = createHookDeployWebhookMethods();

	async webhook(this: IWebhookFunctions) {
		return handleHookDeployWebhook.call(this);
	}
}
