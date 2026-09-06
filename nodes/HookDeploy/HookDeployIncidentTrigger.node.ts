import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
} from 'n8n-workflow';
import {
	createHookDeployIncidentWebhookMethods,
	handleHookDeployIncidentWebhook,
} from './shared/hookDeployIncidentWebhookTrigger';
import { HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS } from './shared/hookDeployIncidentWebhookValidation';

export class HookDeployIncidentTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HookDeploy Incident Trigger',
		name: 'hookDeployIncidentTrigger',
		icon: { light: 'file:hookdeploy.svg', dark: 'file:hookdeploy.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when HookDeploy incident lifecycle events occur',
		defaults: {
			name: 'HookDeploy Incident Trigger',
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
						name: 'Incident Created',
						value: 'incident.created',
						action: 'Incident Created',
						description: 'Triggers when HookDeploy opens a new incident',
					},
					{
						name: 'Incident Investigating',
						value: 'incident.investigating',
						action: 'Incident Investigating',
						description: 'Triggers when an incident is marked investigating',
					},
					{
						name: 'Incident Resolved',
						value: 'incident.resolved',
						action: 'Incident Resolved',
						description: 'Triggers when an incident is resolved',
					},
					{
						name: 'Incident Update Added',
						value: 'incident.update_added',
						action: 'Incident Update Added',
						description: 'Triggers when a user adds a comment to an incident timeline',
					},
				],
				default: 'incident.created',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = createHookDeployIncidentWebhookMethods();

	async webhook(this: IWebhookFunctions) {
		return handleHookDeployIncidentWebhook.call(this);
	}
}

export const HOOKDEPLOY_INCIDENT_EVENTS = HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS;
