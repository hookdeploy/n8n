import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	HOOKDEPLOY_TRIGGER_EVENTS,
	parseHookDeployWebhookBody,
} from './hookDeployWebhookValidation';

test('parseHookDeployWebhookBody accepts hookdeploy metadata envelope', () => {
	const parsed = parseHookDeployWebhookBody({
		hookdeploy: {
			event_type: 'request.received',
			request_id: 'req-1',
		},
		body: { hello: 'world' },
	});

	assert.equal(parsed.success, true);
	if (parsed.success) {
		assert.equal(parsed.data.hookdeploy.event_type, 'request.received');
		assert.deepEqual(parsed.data.body, { hello: 'world' });
	}
});

test('parseHookDeployWebhookBody rejects payloads without hookdeploy metadata', () => {
	const parsed = parseHookDeployWebhookBody({ hello: 'world' });
	assert.equal(parsed.success, false);
});

test('HOOKDEPLOY_TRIGGER_EVENTS lists webhook subscription events', () => {
	assert.deepEqual(HOOKDEPLOY_TRIGGER_EVENTS, [
		'request.received',
		'forwarding.succeeded',
		'forwarding.failed',
	]);
});
