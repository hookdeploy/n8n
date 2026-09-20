import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IExecuteSingleFunctions, INodeExecutionData } from 'n8n-workflow';
import { filterIncidentsByCauseOrDestination } from '../nodes/HookDeploy/resources/incident';

const items: INodeExecutionData[] = [
	{
		json: {
			likely_cause: 'Forwards to Sample Destination are failing',
			destination_name: 'Sample Destination',
			asn_org: 'Example ISP',
		},
	},
	{
		json: {
			likely_cause: 'Timeouts to Billing Webhook',
			destination_name: 'Billing Webhook',
			asn_org: null,
		},
	},
];

test('filterIncidentsByCauseOrDestination returns all items when query is blank', async () => {
	const ctx = {
		getNodeParameter: () => '',
	} as unknown as IExecuteSingleFunctions;

	const filtered = await filterIncidentsByCauseOrDestination.call(ctx, items);
	assert.equal(filtered.length, 2);
});

test('filterIncidentsByCauseOrDestination matches cause, destination, or ASN', async () => {
	const ctx = {
		getNodeParameter: () => 'billing',
	} as unknown as IExecuteSingleFunctions;

	const filtered = await filterIncidentsByCauseOrDestination.call(ctx, items);
	assert.equal(filtered.length, 1);
	assert.equal(filtered[0].json.destination_name, 'Billing Webhook');
});

test('filterIncidentsByCauseOrDestination matches any destinations[] name', async () => {
	const ctx = {
		getNodeParameter: () => 'crm',
	} as unknown as IExecuteSingleFunctions;

	const multi: INodeExecutionData[] = [
		{
			json: {
				likely_cause: 'Multiple destinations failing',
				destination_name: 'Sample Destination',
				destinations: [
					{ id: 'dest-1', name: 'Sample Destination' },
					{ id: 'dest-2', name: 'CRM Hook' },
				],
			},
		},
		{
			json: {
				likely_cause: 'Unrelated',
				destination_name: 'Billing Webhook',
				destinations: [{ id: 'dest-3', name: 'Billing Webhook' }],
			},
		},
	];

	const filtered = await filterIncidentsByCauseOrDestination.call(ctx, multi);
	assert.equal(filtered.length, 1);
	assert.equal(filtered[0].json.likely_cause, 'Multiple destinations failing');
});
