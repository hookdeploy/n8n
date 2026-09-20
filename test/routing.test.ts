import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const endpointSource = readFileSync(
	new URL('../nodes/HookDeploy/resources/endpoint/index.ts', import.meta.url),
	'utf8',
);
const requestSource = readFileSync(
	new URL('../nodes/HookDeploy/resources/request/index.ts', import.meta.url),
	'utf8',
);
const memberSource = readFileSync(
	new URL('../nodes/HookDeploy/resources/member/index.ts', import.meta.url),
	'utf8',
);
const incidentSource = readFileSync(
	new URL('../nodes/HookDeploy/resources/incident/index.ts', import.meta.url),
	'utf8',
);
const destinationSource = readFileSync(
	new URL('../nodes/HookDeploy/resources/destination/index.ts', import.meta.url),
	'utf8',
);
const nodeSource = readFileSync(
	new URL('../nodes/HookDeploy/HookDeploy.node.ts', import.meta.url),
	'utf8',
);
const triggerSource = readFileSync(
	new URL('../nodes/HookDeploy/HookDeployTrigger.node.ts', import.meta.url),
	'utf8',
);

test('endpoint resource routes create/list/pause/resume to HookDeploy API paths', () => {
	assert.match(endpointSource, /method: 'POST',\s*url: '\/endpoints'/);
	assert.match(endpointSource, /method: 'GET',\s*url: '\/endpoints'/);
	assert.match(endpointSource, /url: '=\/endpoints\/\{\{\$parameter\.endpointId\}\}'/);
	assert.match(endpointSource, /paused: true/);
	assert.match(endpointSource, /paused: false/);
});

test('request resource routes list/get/replay to endpoint request paths', () => {
	assert.match(requestSource, /url: '=\/endpoints\/\{\{\$parameter\.endpointId\}\}\/requests'/);
	assert.match(
		requestSource,
		/url: '=\/endpoints\/\{\{\$parameter\.endpointId\}\}\/requests\/\{\{\$parameter\.requestId\}\}'/,
	);
	assert.match(
		requestSource,
		/url: '=\/endpoints\/\{\{\$parameter\.endpointId\}\}\/requests\/\{\{\$parameter\.requestId\}\}\/replay'/,
	);
	assert.match(requestSource, /property: 'target_url'/);
});

test('member resource routes invite/deactivate/reactivate to member endpoints', () => {
	assert.match(memberSource, /method: 'POST',\s*url: '\/members\/invite'/);
	assert.match(memberSource, /method: 'POST',\s*url: '\/members\/deactivate'/);
	assert.match(memberSource, /method: 'POST',\s*url: '\/members\/reactivate'/);
});

test('incident resource routes list/get/update/replay to incident API paths', () => {
	assert.match(incidentSource, /method: 'GET',\s*url: '\/incidents'/);
	assert.match(incidentSource, /url: '=\/incidents\/\{\{\$parameter\.incidentId\}\}'/);
	assert.match(incidentSource, /method: 'PATCH'/);
	assert.match(incidentSource, /url: '=\/incidents\/\{\{\$parameter\.incidentId\}\}\/replay'/);
	assert.match(incidentSource, /property: 'requests_per_minute'/);
	assert.match(incidentSource, /property: 'status'/);
	assert.match(incidentSource, /default: 'all'/);
	assert.match(incidentSource, /default: 50/);
	assert.match(incidentSource, /Filter by Cause or Destination/);
});

test('destination resource routes create to POST /destinations with Zapier fields', () => {
	assert.match(destinationSource, /method: 'POST',\s*url: '\/destinations'/);
	assert.match(destinationSource, /property: 'name'/);
	assert.match(destinationSource, /property: 'url'/);
	assert.match(destinationSource, /property: 'endpoint_id'/);
	assert.doesNotMatch(destinationSource, /headers/);
	assert.doesNotMatch(destinationSource, /tunnel_id/);
	assert.doesNotMatch(destinationSource, /transformation/);
});

test('regular node registers Destination and Incident resources', () => {
	assert.match(nodeSource, /name: 'Destination'/);
	assert.match(nodeSource, /value: 'destination'/);
	assert.match(nodeSource, /name: 'Incident'/);
	assert.match(nodeSource, /value: 'incident'/);
});

test('trigger node lists incident lifecycle event values from the backend', () => {
	assert.match(triggerSource, /value: 'incident\.created'/);
	assert.match(triggerSource, /value: 'incident\.investigating'/);
	assert.match(triggerSource, /value: 'incident\.resolved'/);
	assert.match(triggerSource, /value: 'incident\.update_added'/);
	assert.match(triggerSource, /name: 'New Incident'/);
});
