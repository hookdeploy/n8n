import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS,
	HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS,
	HOOKDEPLOY_TRIGGER_EVENTS,
	parseHookDeployWebhookBody,
} from '../nodes/HookDeploy/shared/hookDeployWebhookValidation';

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

test('HOOKDEPLOY_TRIGGER_EVENTS lists endpoint and incident subscription events', () => {
	assert.deepEqual(HOOKDEPLOY_ENDPOINT_TRIGGER_EVENTS, [
		'request.received',
		'forwarding.succeeded',
		'forwarding.failed',
	]);
	assert.deepEqual(HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS, [
		'incident.created',
		'incident.investigating',
		'incident.resolved',
		'incident.update_added',
	]);
	assert.deepEqual(HOOKDEPLOY_TRIGGER_EVENTS, [
		'request.received',
		'forwarding.succeeded',
		'forwarding.failed',
		'incident.created',
		'incident.investigating',
		'incident.resolved',
		'incident.update_added',
	]);
});

test('parseHookDeployWebhookBody accepts incident lifecycle envelopes', () => {
	const parsed = parseHookDeployWebhookBody({
		incident_id: 'inc-1',
		organization_id: 'org-1',
		status: 'open',
		scope: 'destination',
		event_type: 'incident.created',
		likely_cause: 'Forwards to Sample Destination are failing',
	});

	assert.equal(parsed.success, true);
	if (parsed.success && 'incident_id' in parsed.data) {
		assert.equal(parsed.data.incident_id, 'inc-1');
		assert.equal(parsed.data.event_type, 'incident.created');
	}
});
