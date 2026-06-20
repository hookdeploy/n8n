import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { endpointDescription } from './resources/endpoint';
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
						name: 'Endpoint',
						value: 'endpoint',
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
			...endpointDescription,
			...requestDescription,
			...memberDescription,
		],
	};
}
