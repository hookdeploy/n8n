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
