import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput, unwrapNestedListDataOutput } from '../../shared/postReceive';

const showOnlyForIncidentGetAll = {
	operation: ['getAll'],
	resource: ['incident'],
};

export const incidentGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Open', value: 'open' },
			{ name: 'Investigating', value: 'investigating' },
			{ name: 'Resolved', value: 'resolved' },
			{ name: 'All', value: 'all' },
		],
		default: 'open',
		description: 'Filter incidents by status. Open includes investigating.',
		displayOptions: {
			show: showOnlyForIncidentGetAll,
		},
		routing: {
			send: {
				type: 'query',
				property: 'status',
			},
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
			show: showOnlyForIncidentGetAll,
		},
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
];

const showOnlyForIncidentGet = {
	operation: ['get'],
	resource: ['incident'],
};

export const incidentGetDescription: INodeProperties[] = [
	{
		displayName: 'Incident ID',
		name: 'incidentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForIncidentGet,
		},
	},
];

const showOnlyForIncidentUpdateStatus = {
	operation: ['updateStatus'],
	resource: ['incident'],
};

export const incidentUpdateStatusDescription: INodeProperties[] = [
	{
		displayName: 'Incident ID',
		name: 'incidentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForIncidentUpdateStatus,
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Investigating', value: 'investigating' },
			{ name: 'Resolved', value: 'resolved' },
		],
		default: 'investigating',
		required: true,
		displayOptions: {
			show: showOnlyForIncidentUpdateStatus,
		},
		routing: {
			send: {
				type: 'body',
				property: 'status',
			},
		},
	},
];

const showOnlyForIncidentReplay = {
	operation: ['replay'],
	resource: ['incident'],
};

export const incidentReplayDescription: INodeProperties[] = [
	{
		displayName: 'Incident ID',
		name: 'incidentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForIncidentReplay,
		},
	},
	{
		displayName: 'Requests Per Minute',
		name: 'requestsPerMinute',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 6000,
		},
		default: 60,
		required: true,
		description: 'Replay rate (1–6000)',
		displayOptions: {
			show: showOnlyForIncidentReplay,
		},
		routing: {
			send: {
				type: 'body',
				property: 'requests_per_minute',
			},
		},
	},
];

const showOnlyForIncident = {
	resource: ['incident'],
};

export const incidentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForIncident,
		},
		options: [
			{
				// HookDeploy uses "List Incidents" instead of n8n's default "Get Many" label.
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-wrong-for-get-many
				name: 'List Incidents',
				value: 'getAll',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'List Incidents',
				description: 'Retrieve many incidents',
				routing: {
					request: {
						method: 'GET',
						url: '/incidents',
					},
					...unwrapNestedListDataOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an incident',
				description: 'Retrieve a single incident',
				routing: {
					request: {
						method: 'GET',
						url: '=/incidents/{{$parameter.incidentId}}',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				action: 'Update incident status',
				description: 'Mark an incident as Investigating or Resolved',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/incidents/{{$parameter.incidentId}}',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Replay',
				value: 'replay',
				action: 'Replay an incident',
				description: 'Queue a paced replay of unreplayed failures for an incident',
				routing: {
					request: {
						method: 'POST',
						url: '=/incidents/{{$parameter.incidentId}}/replay',
					},
					...unwrapDataOutput,
				},
			},
		],
		default: 'getAll',
	},
	...incidentGetAllDescription,
	...incidentGetDescription,
	...incidentUpdateStatusDescription,
	...incidentReplayDescription,
];
