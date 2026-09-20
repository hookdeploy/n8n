import type {
	IExecuteSingleFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { unwrapDataOutput, unwrapNestedListDataOutput } from '../../shared/postReceive';

const showOnlyForIncidentGetAll = {
	operation: ['getAll'],
	resource: ['incident'],
};

/**
 * Zapier List Incidents applies this filter client-side after GET /incidents.
 * The HookDeploy list API has no name/cause query param.
 */
export async function filterIncidentsByCauseOrDestination(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const query = String(this.getNodeParameter('name', '') ?? '')
		.trim()
		.toLowerCase();
	if (!query) {
		return items;
	}

	return items.filter((item) => {
		const cause = String(item.json.likely_cause ?? '').toLowerCase();
		const asn = String(item.json.asn_org ?? '').toLowerCase();
		const destinationNames = [String(item.json.destination_name ?? '')];
		const destinations = item.json.destinations;
		if (Array.isArray(destinations)) {
			for (const destination of destinations) {
				if (destination && typeof destination === 'object' && 'name' in destination) {
					destinationNames.push(String(destination.name ?? ''));
				}
			}
		}
		const destMatch = destinationNames.some((name) => name.toLowerCase().includes(query));
		return cause.includes(query) || destMatch || asn.includes(query);
	});
}

export const incidentGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Investigating', value: 'investigating' },
			{ name: 'Open', value: 'open' },
			{ name: 'Resolved', value: 'resolved' },
		],
		default: 'all',
		description: 'Optional status filter. Leave as All to include every incident.',
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
		displayName: 'Filter by Cause or Destination',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Optional filter. Leave blank to list recent incidents.',
		displayOptions: {
			show: showOnlyForIncidentGetAll,
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
		default: 50,
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
		description: 'New status for the incident',
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
		description:
			'Replay rate (1–6000). Higher rates finish faster but may overwhelm the destination.',
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
					output: {
						postReceive: [
							...unwrapNestedListDataOutput.output.postReceive,
							filterIncidentsByCauseOrDestination,
						],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Get Incident',
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
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Update Incident Status',
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
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Replay Incident',
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
