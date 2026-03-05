/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-notion/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Notion implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Notion',
    name: 'notion',
    icon: 'file:notion.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Notion API',
    defaults: {
      name: 'Notion',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'notionApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Page',
            value: 'page',
          },
          {
            name: 'Database',
            value: 'database',
          },
          {
            name: 'Block',
            value: 'block',
          }
        ],
        default: 'page',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['page'] } },
  options: [
    { name: 'Get Page', value: 'getPage', description: 'Retrieve a specific page by ID', action: 'Get a page' },
    { name: 'Update Page', value: 'updatePage', description: 'Update page properties and content', action: 'Update a page' },
    { name: 'Create Page', value: 'createPage', description: 'Create a new page in a database or as a child page', action: 'Create a page' }
  ],
  default: 'getPage',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['database'] } },
	options: [
		{ name: 'Get Database', value: 'getDatabase', description: 'Retrieve database schema and properties', action: 'Get database' },
		{ name: 'Update Database', value: 'updateDatabase', description: 'Update database title and properties schema', action: 'Update database' },
		{ name: 'Query Database', value: 'queryDatabase', description: 'Query database entries with filters and sorting', action: 'Query database' },
		{ name: 'Create Database', value: 'createDatabase', description: 'Create a new database', action: 'Create database' },
	],
	default: 'getDatabase',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['block'] } },
  options: [
    { name: 'Get Block', value: 'getBlock', description: 'Retrieve a specific block by ID', action: 'Get a block' },
    { name: 'Get Block Children', value: 'getBlockChildren', description: 'Get all child blocks of a parent block', action: 'Get block children' },
    { name: 'Update Block', value: 'updateBlock', description: 'Update block content and properties', action: 'Update a block' },
    { name: 'Delete Block', value: 'deleteBlock', description: 'Delete a specific block', action: 'Delete a block' },
    { name: 'Append Block Children', value: 'appendBlockChildren', description: 'Add new blocks as children to a parent block', action: 'Append block children' }
  ],
  default: 'getBlock',
},
      // Parameter definitions
{
  displayName: 'Page ID',
  name: 'pageId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['page'], operation: ['getPage', 'updatePage'] } },
  default: '',
  description: 'The ID of the page to retrieve or update',
},
{
  displayName: 'Parent',
  name: 'parent',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['page'], operation: ['createPage'] } },
  default: '{}',
  description: 'Parent object specifying where to create the page (database_id or page_id)',
},
{
  displayName: 'Properties',
  name: 'properties',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['createPage', 'updatePage'] } },
  default: '{}',
  description: 'Properties of the page as a JSON object',
},
{
  displayName: 'Children',
  name: 'children',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['createPage'] } },
  default: '[]',
  description: 'Array of block objects to be appended as children of the page',
},
{
  displayName: 'Archived',
  name: 'archived',
  type: 'boolean',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['updatePage'] } },
  default: false,
  description: 'Whether the page is archived',
},
{
	displayName: 'Database ID',
	name: 'databaseId',
	type: 'string',
	required: true,
	displayOptions: { show: { resource: ['database'], operation: ['getDatabase', 'updateDatabase', 'queryDatabase'] } },
	default: '',
	description: 'The ID of the database',
},
{
	displayName: 'Parent',
	name: 'parent',
	type: 'fixedCollection',
	required: true,
	displayOptions: { show: { resource: ['database'], operation: ['createDatabase'] } },
	default: {},
	description: 'The parent of the database',
	typeOptions: {
		multipleValues: false,
	},
	options: [
		{
			displayName: 'Parent Type',
			name: 'parentType',
			values: [
				{
					displayName: 'Type',
					name: 'type',
					type: 'options',
					options: [
						{ name: 'Page', value: 'page_id' },
						{ name: 'Database', value: 'database_id' },
					],
					default: 'page_id',
				},
				{
					displayName: 'Page ID',
					name: 'page_id',
					type: 'string',
					displayOptions: { show: { type: ['page_id'] } },
					default: '',
				},
				{
					displayName: 'Database ID',
					name: 'database_id',
					type: 'string',
					displayOptions: { show: { type: ['database_id'] } },
					default: '',
				},
			],
		},
	],
},
{
	displayName: 'Title',
	name: 'title',
	type: 'string',
	required: true,
	displayOptions: { show: { resource: ['database'], operation: ['createDatabase', 'updateDatabase'] } },
	default: '',
	description: 'The title of the database',
},
{
	displayName: 'Properties',
	name: 'properties',
	type: 'json',
	displayOptions: { show: { resource: ['database'], operation: ['createDatabase', 'updateDatabase'] } },
	default: '{}',
	description: 'The properties schema of the database',
},
{
	displayName: 'Filter',
	name: 'filter',
	type: 'json',
	displayOptions: { show: { resource: ['database'], operation: ['queryDatabase'] } },
	default: '{}',
	description: 'Filter conditions for the query',
},
{
	displayName: 'Sorts',
	name: 'sorts',
	type: 'json',
	displayOptions: { show: { resource: ['database'], operation: ['queryDatabase'] } },
	default: '[]',
	description: 'Sort conditions for the query',
},
{
	displayName: 'Start Cursor',
	name: 'startCursor',
	type: 'string',
	displayOptions: { show: { resource: ['database'], operation: ['queryDatabase'] } },
	default: '',
	description: 'Cursor for pagination',
},
{
	displayName: 'Page Size',
	name: 'pageSize',
	type: 'number',
	displayOptions: { show: { resource: ['database'], operation: ['queryDatabase'] } },
	default: 100,
	description: 'Number of results per page (max 100)',
	typeOptions: {
		minValue: 1,
		maxValue: 100,
	},
},
{
  displayName: 'Block ID',
  name: 'blockId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['block'], operation: ['getBlock', 'getBlockChildren', 'updateBlock', 'deleteBlock', 'appendBlockChildren'] } },
  default: '',
  description: 'The ID of the block',
},
{
  displayName: 'Start Cursor',
  name: 'startCursor',
  type: 'string',
  displayOptions: { show: { resource: ['block'], operation: ['getBlockChildren'] } },
  default: '',
  description: 'Pagination cursor for retrieving child blocks',
},
{
  displayName: 'Page Size',
  name: 'pageSize',
  type: 'number',
  displayOptions: { show: { resource: ['block'], operation: ['getBlockChildren'] } },
  default: 100,
  description: 'Number of results to return per page',
},
{
  displayName: 'Block Type',
  name: 'type',
  type: 'options',
  displayOptions: { show: { resource: ['block'], operation: ['updateBlock'] } },
  options: [
    { name: 'Paragraph', value: 'paragraph' },
    { name: 'Heading 1', value: 'heading_1' },
    { name: 'Heading 2', value: 'heading_2' },
    { name: 'Heading 3', value: 'heading_3' },
    { name: 'Bulleted List Item', value: 'bulleted_list_item' },
    { name: 'Numbered List Item', value: 'numbered_list_item' },
    { name: 'To Do', value: 'to_do' }
  ],
  default: 'paragraph',
  description: 'The type of block to update',
},
{
  displayName: 'Content',
  name: 'content',
  type: 'json',
  displayOptions: { show: { resource: ['block'], operation: ['updateBlock'] } },
  default: '{}',
  description: 'The content of the block in JSON format',
},
{
  displayName: 'Children',
  name: 'children',
  type: 'json',
  displayOptions: { show: { resource: ['block'], operation: ['appendBlockChildren'] } },
  default: '[]',
  description: 'Array of child blocks to append in JSON format',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'page':
        return [await executePageOperations.call(this, items)];
      case 'database':
        return [await executeDatabaseOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executePageOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('notionApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getPage': {
          const pageId = this.getNodeParameter('pageId', i) as string;
          const options: any = {
            method: 'GET',
            url: `https://api.notion.com/v1/pages/${pageId}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updatePage': {
          const pageId = this.getNodeParameter('pageId', i) as string;
          const properties = this.getNodeParameter('properties', i, {}) as any;
          const archived = this.getNodeParameter('archived', i, false) as boolean;
          
          const body: any = {};
          if (Object.keys(properties).length > 0) {
            body.properties = properties;
          }
          if (archived !== undefined) {
            body.archived = archived;
          }
          
          const options: any = {
            method: 'PATCH',
            url: `https://api.notion.com/v1/pages/${pageId}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'createPage': {
          const parent = this.getNodeParameter('parent', i) as any;
          const properties = this.getNodeParameter('properties', i, {}) as any;
          const children = this.getNodeParameter('children', i, []) as any;
          
          const body: any = {
            parent,
          };
          
          if (Object.keys(properties).length > 0) {
            body.properties = properties;
          }
          
          if (Array.isArray(children) && children.length > 0) {
            body.children = children;
          }
          
          const options: any = {
            method: 'POST',
            url: 'https://api.notion.com/v1/pages',
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}

async function executeDatabaseOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('notionApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			const baseHeaders = {
				'Authorization': `Bearer ${credentials.apiKey}`,
				'Content-Type': 'application/json',
				'Notion-Version': '2022-06-28',
			};

			switch (operation) {
				case 'getDatabase': {
					const databaseId = this.getNodeParameter('databaseId', i) as string;
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/databases/${databaseId}`,
						headers: baseHeaders,
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'updateDatabase': {
					const databaseId = this.getNodeParameter('databaseId', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const properties = this.getNodeParameter('properties', i) as string;

					const body: any = {};
					if (title) {
						body.title = [
							{
								type: 'text',
								text: {
									content: title,
								},
							},
						];
					}
					if (properties) {
						body.properties = typeof properties === 'string' ? JSON.parse(properties) : properties;
					}

					const options: any = {
						method: 'PATCH',
						url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/databases/${databaseId}`,
						headers: baseHeaders,
						body,
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'queryDatabase': {
					const databaseId = this.getNodeParameter('databaseId', i) as string;
					const filter = this.getNodeParameter('filter', i) as string;
					const sorts = this.getNodeParameter('sorts', i) as string;
					const startCursor = this.getNodeParameter('startCursor', i) as string;
					const pageSize = this.getNodeParameter('pageSize', i) as number;

					const body: any = {};
					if (filter) {
						body.filter = typeof filter === 'string' ? JSON.parse(filter) : filter;
					}
					if (sorts) {
						body.sorts = typeof sorts === 'string' ? JSON.parse(sorts) : sorts;
					}
					if (startCursor) {
						body.start_cursor = startCursor;
					}
					if (pageSize) {
						body.page_size = pageSize;
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/databases/${databaseId}/query`,
						headers: baseHeaders,
						body,
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'createDatabase': {
					const parent = this.getNodeParameter('parent', i) as any;
					const title = this.getNodeParameter('title', i) as string;
					const properties = this.getNodeParameter('properties', i) as string;

					const body: any = {
						parent: {},
						title: [
							{
								type: 'text',
								text: {
									content: title,
								},
							},
						],
						properties: typeof properties === 'string' ? JSON.parse(properties) : properties,
					};

					if (parent.parentType && parent.parentType.length > 0) {
						const parentType = parent.parentType[0];
						if (parentType.type === 'page_id') {
							body.parent = { page_id: parentType.page_id };
						} else if (parentType.type === 'database_id') {
							body.parent = { database_id: parentType.database_id };
						}
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/databases`,
						headers: baseHeaders,
						body,
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({ json: result, pairedItem: { item: i } });
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeBlockOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('notionApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getBlock': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/blocks/${blockId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockChildren': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const startCursor = this.getNodeParameter('startCursor', i, '') as string;
          const pageSize = this.getNodeParameter('pageSize', i, 100) as number;

          let url = `${credentials.baseUrl || 'https://api.notion.com/v1'}/blocks/${blockId}/children?page_size=${pageSize}`;
          if (startCursor) {
            url += `&start_cursor=${startCursor}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateBlock': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const type = this.getNodeParameter('type', i) as string;
          const content = this.getNodeParameter('content', i, '{}') as string;

          let parsedContent: any;
          try {
            parsedContent = JSON.parse(content);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in content parameter: ${error.message}`);
          }

          const body: any = {
            [type]: parsedContent,
          };

          const options: any = {
            method: 'PATCH',
            url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/blocks/${blockId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteBlock': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/blocks/${blockId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'appendBlockChildren': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const children = this.getNodeParameter('children', i, '[]') as string;

          let parsedChildren: any;
          try {
            parsedChildren = JSON.parse(children);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in children parameter: ${error.message}`);
          }

          const body: any = {
            children: parsedChildren,
          };

          const options: any = {
            method: 'PATCH',
            url: `${credentials.baseUrl || 'https://api.notion.com/v1'}/blocks/${blockId}/children`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
