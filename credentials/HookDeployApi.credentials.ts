import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HookDeployApi implements ICredentialType {
	name = 'hookDeployApi';

	displayName = 'HookDeploy API';

	icon: Icon = {
		light: 'file:../nodes/HookDeploy/hookdeploy.svg',
		dark: 'file:../nodes/HookDeploy/hookdeploy.dark.svg',
	};

	documentationUrl = 'https://hookdeploy.dev';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			placeholder: 'hd_live_xxxx',
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.hookdeploy.dev/v1',
			url: '/me',
			method: 'GET',
		},
	};
}
