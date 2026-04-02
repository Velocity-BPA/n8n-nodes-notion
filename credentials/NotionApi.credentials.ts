import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NotionApi implements ICredentialType {
	name = 'notionApi';
	displayName = 'Notion API';
	documentationUrl = 'https://developers.notion.com/docs/getting-started';
	properties: INodeProperties[] = [
		{
			displayName: 'Bearer Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Bearer token for your Notion integration. Create an internal integration in your Notion workspace settings to get this token.',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.notion.com/v1',
			description: 'The base URL for the Notion API',
		},
	];
}