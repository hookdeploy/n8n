import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput } from '../../shared/postReceive';

const showOnlyForMemberInvite = {
	operation: ['invite'],
	resource: ['member'],
};

export const memberInviteDescription: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@example.com',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForMemberInvite,
		},
		routing: {
			send: {
				type: 'body',
				property: 'email',
			},
		},
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		options: [
			{ name: 'Admin', value: 'admin' },
			{ name: 'Developer', value: 'developer' },
			{ name: 'Finance', value: 'finance' },
			{ name: 'Super Admin', value: 'super_admin' },
			{ name: 'Viewer', value: 'viewer' },
		],
		default: 'developer',
		required: true,
		displayOptions: {
			show: showOnlyForMemberInvite,
		},
		routing: {
			send: {
				type: 'body',
				property: 'role',
			},
		},
	},
];

const showOnlyForMemberDeactivate = {
	operation: ['deactivate'],
	resource: ['member'],
};

export const memberDeactivateDescription: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@example.com',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForMemberDeactivate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'email',
			},
		},
	},
];

const showOnlyForMemberReactivate = {
	operation: ['reactivate'],
	resource: ['member'],
};

export const memberReactivateDescription: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@example.com',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForMemberReactivate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'email',
			},
		},
	},
];

const showOnlyForMember = {
	resource: ['member'],
};

export const memberDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMember,
		},
		options: [
			{
				name: 'Invite',
				value: 'invite',
				action: 'Invite a member',
				description: 'Invite a new organization member',
				routing: {
					request: {
						method: 'POST',
						url: '/members/invite',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Deactivate',
				value: 'deactivate',
				action: 'Deactivate a member',
				description: 'Deactivate an organization member',
				routing: {
					request: {
						method: 'POST',
						url: '/members/deactivate',
					},
					...unwrapDataOutput,
				},
			},
			{
				name: 'Reactivate',
				value: 'reactivate',
				action: 'Reactivate a member',
				description: 'Reactivate a deactivated organization member',
				routing: {
					request: {
						method: 'POST',
						url: '/members/reactivate',
					},
					...unwrapDataOutput,
				},
			},
		],
		default: 'invite',
	},
	...memberInviteDescription,
	...memberDeactivateDescription,
	...memberReactivateDescription,
];
