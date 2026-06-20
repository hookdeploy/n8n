import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput } from '../../shared/postReceive';

const showOnlyForEndpointCreate = {
	operation: ['create'],
	resource: ['endpoint'],
};

export const endpointCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForEndpointCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForEndpointCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'description',
			},
		},
	},
];

const showOnlyForEndpointPause = {
	operation: ['pause'],
	resource: ['endpoint'],
};

export const endpointPauseDescription: INodeProperties[] = [
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForEndpointPause,
		},
	},
];

const showOnlyForEndpointResume = {
	operation: ['resume'],
	resource: ['endpoint'],
};

export const endpointResumeDescription: INodeProperties[] = [
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForEndpointResume,
		},
	},
];

const showOnlyForEndpoint = {
	resource: ['endpoint'],
};

export const endpointDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForEndpoint,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an endpoint',
				description: 'Create a new webhook endpoint',
				routing: {
					request: {
						method: 'POST',
						url: '/endpoints',
					},
					...unwrapDataOutput,
				},
			},
			{
				// HookDeploy uses "List Endpoints" instead of n8n's default "Get Many" label.
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-wrong-for-get-many
				name: 'List Endpoints',
				value: 'getAll',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'List Endpoints',
				description: 'Retrieve many endpoints',
				routing: {
					request: {
						method: 'GET',
						url: '/endpoints',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause an endpoint',
				description: 'Pause a webhook endpoint',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/endpoints/{{$parameter.endpointId}}',
						body: {
							paused: true,
						},
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Resume',
				value: 'resume',
				action: 'Resume an endpoint',
				description: 'Resume a paused webhook endpoint',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/endpoints/{{$parameter.endpointId}}',
						body: {
							paused: false,
						},
					},
					...unwrapDataOutput,
				},
			},
		],
		default: 'getAll',
	},
	...endpointCreateDescription,
	...endpointPauseDescription,
	...endpointResumeDescription,
];
