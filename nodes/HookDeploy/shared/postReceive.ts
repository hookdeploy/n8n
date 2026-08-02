import type {
	IDataObject,
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
} from 'n8n-workflow';

export const unwrapDataOutput = {
	output: {
		postReceive: [
			{
				type: 'rootProperty' as const,
				properties: {
					property: 'data',
				},
			},
		],
	},
};

/** Unwrap `{ data: { data: [...], meta } }` list envelopes into one item per row. */
export const unwrapNestedListDataOutput = {
	output: {
		postReceive: [
			{
				type: 'rootProperty' as const,
				properties: {
					property: 'data',
				},
			},
			{
				type: 'rootProperty' as const,
				properties: {
					property: 'data',
				},
			},
		],
	},
};

/**
 * Destination Create may return `{ data, attachment_error }` on partial attach
 * failure. Keep both in the output item.
 */
export async function unwrapDestinationCreateOutput(
	this: IExecuteSingleFunctions,
	_items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const body = (response.body ?? {}) as IDataObject;
	const data = (body.data ?? {}) as IDataObject;
	const attachmentError = body.attachment_error ?? null;

	return [
		{
			json: {
				...data,
				attachment_error: attachmentError,
			},
		},
	];
}
