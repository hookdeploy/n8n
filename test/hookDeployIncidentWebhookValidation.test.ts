import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS,
	isHookDeployIncidentEvent,
	parseHookDeployIncidentWebhookBody,
} from '../nodes/HookDeploy/shared/hookDeployIncidentWebhookValidation';

test('parseHookDeployIncidentWebhookBody accepts incident lifecycle payloads', () => {
	const parsed = parseHookDeployIncidentWebhookBody({
		incident_id: 'inc-1',
		organization_id: 'org-1',
		status: 'open',
		scope: 'endpoint',
		event_type: 'incident.created',
	});

	assert.equal(parsed.success, true);
});

test('parseHookDeployIncidentWebhookBody rejects incomplete payloads', () => {
	const parsed = parseHookDeployIncidentWebhookBody({ incident_id: 'inc-1' });
	assert.equal(parsed.success, false);
});

test('isHookDeployIncidentEvent guards incident trigger events', () => {
	for (const event of HOOKDEPLOY_INCIDENT_TRIGGER_EVENTS) {
		assert.equal(isHookDeployIncidentEvent(event), true);
	}
	assert.equal(isHookDeployIncidentEvent('request.received'), false);
});
