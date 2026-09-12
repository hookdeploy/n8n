import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IHookFunctions, IWebhookFunctions } from 'n8n-workflow';
import {
	createHookDeployWebhookMethods,
	handleHookDeployWebhook,
	subscriptionMatchesParameters,
} from '../nodes/HookDeploy/shared/hookDeployWebhookTrigger';

test('subscriptionMatchesParameters requires stored subscription metadata', () => {
	assert.equal(
		subscriptionMatchesParameters(
			{ subscriptionId: 'sub-1', endpointId: 'ep-1', eventType: 'request.received' },
			'ep-1',
			'request.received',
		),
		true,
	);
	assert.equal(
		subscriptionMatchesParameters(
			{ subscriptionId: 'sub-1', endpointId: 'ep-1', eventType: 'request.received' },
			'ep-2',
			'request.received',
		),
		false,
	);
});

test('handleHookDeployWebhook returns empty workflow data for invalid payloads', async () => {
	const warnings: string[] = [];
	const ctx = {
		getRequestObject: () => ({ body: { not_hookdeploy: true } }),
		logger: { warn: (message: string) => warnings.push(message) },
		helpers: { returnJsonArray: (items: unknown[]) => items },
	} as unknown as IWebhookFunctions;

	const result = await handleHookDeployWebhook.call(ctx);
	assert.deepEqual(result.workflowData, [[]]);
	assert.equal(warnings.length, 1);
});

test('handleHookDeployWebhook returns parsed payload for valid webhook bodies', async () => {
	const ctx = {
		getRequestObject: () => ({
			body: {
				hookdeploy: { event_type: 'request.received', request_id: 'req-1' },
				foo: 'bar',
			},
		}),
		logger: { warn: () => undefined },
		helpers: { returnJsonArray: (items: unknown[]) => items },
	} as unknown as IWebhookFunctions;

	const result = await handleHookDeployWebhook.call(ctx);
	assert.equal(Array.isArray(result.workflowData?.[0]), true);
	assert.equal(
		(result.workflowData?.[0] as Array<{ hookdeploy: { request_id: string } }>)[0].hookdeploy
			.request_id,
		'req-1',
	);
});

test('createHookDeployWebhookMethods posts subscription create payload to HookDeploy API', async () => {
	const requests: Array<{ method?: string; url?: string; body?: unknown }> = [];
	const staticData: Record<string, unknown> = {};

	const ctx = {
		getWorkflowStaticData: () => staticData,
		getNodeParameter: (name: string) => {
			if (name === 'endpointId') return 'ep-123';
			if (name === 'event') return 'forwarding.failed';
			return '';
		},
		getNodeWebhookUrl: () => 'https://n8n.example/webhook/abc',
		helpers: {
			httpRequestWithAuthentication: async (
				_cred: string,
				options: { method?: string; url?: string; body?: unknown },
			) => {
				requests.push(options);
				return { id: 'sub-999' };
			},
		},
	} as unknown as IHookFunctions;

	const methods = createHookDeployWebhookMethods();
	const created = await methods.default.create.call(ctx);
	assert.equal(created, true);
	assert.deepEqual(requests[0], {
		method: 'POST',
		url: 'https://api.hookdeploy.dev/v1/subscriptions',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: {
			endpoint_id: 'ep-123',
			target_url: 'https://n8n.example/webhook/abc',
			platform: 'n8n',
			event_type: 'forwarding.failed',
		},
	});
	assert.equal(staticData.subscriptionId, 'sub-999');
});

test('createHookDeployWebhookMethods deletes stored subscription on teardown', async () => {
	const requests: Array<{ method?: string; url?: string }> = [];
	const staticData = {
		subscriptionId: 'sub-999',
		endpointId: 'ep-123',
		eventType: 'request.received',
	};

	const ctx = {
		getWorkflowStaticData: () => staticData,
		helpers: {
			httpRequestWithAuthentication: async (
				_cred: string,
				options: { method?: string; url?: string },
			) => {
				requests.push(options);
				return {};
			},
		},
		logger: { warn: () => undefined },
	} as unknown as IHookFunctions;

	const methods = createHookDeployWebhookMethods();
	const deleted = await methods.default.delete.call(ctx);
	assert.equal(deleted, true);
	assert.deepEqual(requests[0], {
		method: 'DELETE',
		url: 'https://api.hookdeploy.dev/v1/subscriptions/sub-999',
		headers: { Accept: 'application/json' },
	});
	assert.equal(staticData.subscriptionId, undefined);
});
