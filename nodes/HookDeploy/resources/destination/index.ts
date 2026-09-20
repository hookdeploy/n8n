import type { INodeProperties } from 'n8n-workflow';
import { unwrapDestinationCreateOutput } from '../../shared/postReceive';

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
		description: 'A descriptive name, e.g. "Production webhook handler"',
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
		description: 'HTTPS URL to forward webhooks to',
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
		displayName: 'Attach to Endpoint',
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
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Create Destination',
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
		],
		default: 'create',
	},
	...destinationCreateDescription,
];
