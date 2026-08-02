import type { INodeProperties } from 'n8n-workflow';
import {
	unwrapDataOutput,
	unwrapDestinationCreateOutput,
	unwrapNestedListDataOutput,
} from '../../shared/postReceive';

const showOnlyForDestinationCreate = {
	operation: ['create'],
	resource: ['destination'],
};

export const destinationCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDestinationCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDestinationCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'url',
			},
		},
	},
	{
		displayName: 'Endpoint ID',
		name: 'endpointId',
		type: 'string',
		default: '',
		description:
			'Optional. If set, also creates a forward destination on this endpoint. If attach fails, the saved destination is still created and attachment_error is returned.',
		displayOptions: {
			show: showOnlyForDestinationCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'endpoint_id',
				value: '={{$value || undefined}}',
			},
		},
	},
];

const showOnlyForDestinationGet = {
	operation: ['get'],
	resource: ['destination'],
};

export const destinationGetDescription: INodeProperties[] = [
	{
		displayName: 'Destination ID',
		name: 'destinationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDestinationGet,
		},
	},
];

const showOnlyForDestinationGetAll = {
	operation: ['getAll'],
	resource: ['destination'],
};

export const destinationGetAllDescription: INodeProperties[] = [
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
			show: showOnlyForDestinationGetAll,
		},
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
];

const showOnlyForDestination = {
	resource: ['destination'],
};

export const destinationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDestination,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a destination',
				description: 'Create a saved destination (library entry)',
				routing: {
					request: {
						method: 'POST',
						url: '/destinations',
						returnFullResponse: true,
					},
					output: {
						postReceive: [unwrapDestinationCreateOutput],
					},
				},
			},
			{
				// HookDeploy uses "List Destinations" instead of n8n's default "Get Many" label.
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-wrong-for-get-many
				name: 'List Destinations',
				value: 'getAll',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'List Destinations',
				description: 'Retrieve many saved destinations',
				routing: {
					request: {
						method: 'GET',
						url: '/destinations',
					},
					...unwrapNestedListDataOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a destination',
				description: 'Retrieve a single saved destination',
				routing: {
					request: {
						method: 'GET',
						url: '=/destinations/{{$parameter.destinationId}}',
					},
					...unwrapDataOutput,
				},
			},
		],
		default: 'getAll',
	},
	...destinationCreateDescription,
	...destinationGetAllDescription,
	...destinationGetDescription,
];
