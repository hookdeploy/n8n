import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput } from '../../shared/postReceive';

const showOnlyForRequestGetAll = {
	operation: ['getAll'],
	resource: ['request'],
};

export const requestGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForRequestGetAll,
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		// HookDeploy API default page size is 25, not n8n's conventional 50.
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: 25,
		description: 'Max number of results to return',
		displayOptions: {
			show: showOnlyForRequestGetAll,
		},
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
	{
		displayName: 'Before',
		name: 'before',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForRequestGetAll,
		},
		description: 'Cursor for pagination',
		routing: {
			send: {
				type: 'query',
				property: 'before',
			},
		},
	},
];

const showOnlyForRequestGet = {
	operation: ['get'],
	resource: ['request'],
};

export const requestGetDescription: INodeProperties[] = [
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForRequestGet,
		},
	},
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForRequestGet,
		},
	},
];

const showOnlyForRequestReplay = {
	operation: ['replay'],
	resource: ['request'],
};

export const requestReplayDescription: INodeProperties[] = [
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForRequestReplay,
		},
	},
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForRequestReplay,
		},
	},
	{
		displayName: 'Target URL',
		name: 'targetUrl',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForRequestReplay,
		},
		routing: {
			send: {
				type: 'body',
				property: 'target_url',
			},
		},
	},
];

const showOnlyForRequest = {
	resource: ['request'],
};

export const requestDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRequest,
		},
		options: [
			{
				// HookDeploy uses "List Requests" instead of n8n's default "Get Many" label.
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-wrong-for-get-many
				name: 'List Requests',
				value: 'getAll',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'List Requests',
				description: 'Retrieve many captured requests for an endpoint',
				routing: {
					request: {
						method: 'GET',
						url: '=/endpoints/{{$parameter.endpointId}}/requests',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a request',
				description: 'Retrieve a single captured request',
				routing: {
					request: {
						method: 'GET',
						url: '=/endpoints/{{$parameter.endpointId}}/requests/{{$parameter.requestId}}',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Replay',
				value: 'replay',
				action: 'Replay a request',
				description: 'Replay a captured request to a target URL',
				routing: {
					request: {
						method: 'POST',
						url: '=/endpoints/{{$parameter.endpointId}}/requests/{{$parameter.requestId}}/replay',
					},
					...unwrapDataOutput,
				},
			},
		],
		default: 'getAll',
	},
	...requestGetAllDescription,
	...requestGetDescription,
	...requestReplayDescription,
];
