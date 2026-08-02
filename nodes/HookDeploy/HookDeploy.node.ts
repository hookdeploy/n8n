import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { destinationDescription } from './resources/destination';
import { endpointDescription } from './resources/endpoint';
import { incidentDescription } from './resources/incident';
import { memberDescription } from './resources/member';
import { requestDescription } from './resources/request';

export class HookDeploy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HookDeploy',
		name: 'hookDeploy',
		icon: { light: 'file:hookdeploy.svg', dark: 'file:hookdeploy.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the HookDeploy API',
		defaults: {
			name: 'HookDeploy',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'hookDeployApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.hookdeploy.dev/v1',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Destination',
						value: 'destination',
					},
					{
						name: 'Endpoint',
						value: 'endpoint',
					},
					{
						name: 'Incident',
						value: 'incident',
					},
					{
						name: 'Member',
						value: 'member',
					},
					{
						name: 'Request',
						value: 'request',
					},
				],
				default: 'endpoint',
			},
			...destinationDescription,
			...endpointDescription,
			...incidentDescription,
			...requestDescription,
			...memberDescription,
		],
	};
}
