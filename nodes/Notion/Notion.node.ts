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
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['page'] } },
  options: [
    { name: 'Create Page', value: 'createPage', description: 'Create a new page in a database or as a child page', action: 'Create a page' },
    { name: 'Get Page', value: 'getPage', description: 'Retrieve a page by its ID', action: 'Get a page' },
    { name: 'Update Page', value: 'updatePage', description: 'Update page properties, icon, cover, or archived status', action: 'Update a page' },
    { name: 'Get Page Property', value: 'getPageProperty', description: 'Retrieve a specific property from a page', action: 'Get page property' }
  ],
  default: 'createPage',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['database'],
		},
	},
	options: [
		{
			name: 'Create Database',
			value: 'createDatabase',
			description: 'Create a new database',
			action: 'Create a database',
		},
		{
			name: 'Get Database',
			value: 'getDatabase',
			description: 'Retrieve database schema and metadata',
			action: 'Get a database',
		},
		{
			name: 'Update Database',
			value: 'updateDatabase',
			description: 'Update database title, description, or properties schema',
			action: 'Update a database',
		},
		{
			name: 'Query Database',
			value: 'queryDatabase',
			description: 'Query database pages with filters and sorting',
			action: 'Query a database',
		},
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
    { name: 'Get Block', value: 'getBlock', description: 'Retrieve a specific block by its ID', action: 'Get block' },
    { name: 'Get Block Children', value: 'getBlockChildren', description: 'Retrieve child blocks of a parent block', action: 'Get block children' },
    { name: 'Update Block', value: 'updateBlock', description: 'Update block content and properties', action: 'Update block' },
    { name: 'Delete Block', value: 'deleteBlock', description: 'Delete a block', action: 'Delete block' },
    { name: 'Append Block Children', value: 'appendBlockChildren', description: 'Append new child blocks to a parent block', action: 'Append block children' }
  ],
  default: 'getBlock',
},
{
  displayName: 'Parent',
  name: 'parent',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['page'], operation: ['createPage'] } },
  default: '{}',
  description: 'Parent database or page where this page will be created',
},
{
  displayName: 'Properties',
  name: 'properties',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['page'], operation: ['createPage'] } },
  default: '{}',
  description: 'Page properties as a JSON object',
},
{
  displayName: 'Children',
  name: 'children',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['createPage'] } },
  default: '[]',
  description: 'Block content for the page',
},
{
  displayName: 'Icon',
  name: 'icon',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['createPage', 'updatePage'] } },
  default: '{}',
  description: 'Page icon object',
},
{
  displayName: 'Cover',
  name: 'cover',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['createPage', 'updatePage'] } },
  default: '{}',
  description: 'Page cover image object',
},
{
  displayName: 'Page ID',
  name: 'pageId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['page'], operation: ['getPage', 'updatePage', 'getPageProperty'] } },
  default: '',
  description: 'ID of the page to retrieve or update',
},
{
  displayName: 'Filter Properties',
  name: 'filterProperties',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['getPage'] } },
  default: '',
  description: 'Comma-separated list of property IDs to retrieve',
},
{
  displayName: 'Properties',
  name: 'properties',
  type: 'json',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['updatePage'] } },
  default: '{}',
  description: 'Page properties to update as a JSON object',
},
{
  displayName: 'Archived',
  name: 'archived',
  type: 'boolean',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['updatePage'] } },
  default: false,
  description: 'Whether the page should be archived',
},
{
  displayName: 'Property ID',
  name: 'propertyId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['page'], operation: ['getPageProperty'] } },
  default: '',
  description: 'ID of the property to retrieve',
},
{
  displayName: 'Start Cursor',
  name: 'startCursor',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['getPageProperty'] } },
  default: '',
  description: 'Cursor for pagination',
},
{
  displayName: 'Page Size',
  name: 'pageSize',
  type: 'number',
  required: false,
  displayOptions: { show: { resource: ['page'], operation: ['getPageProperty'] } },
  default: 100,
  description: 'Number of items to retrieve per page',
},
{
	displayName: 'Database ID',
	name: 'databaseId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['getDatabase', 'updateDatabase', 'queryDatabase'],
		},
	},
	default: '',
	description: 'The ID of the database to operate on',
},
{
	displayName: 'Parent',
	name: 'parent',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['createDatabase'],
		},
	},
	default: '{"type": "page_id", "page_id": ""}',
	description: 'Parent page or workspace where the database will be created',
},
{
	displayName: 'Title',
	name: 'title',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['createDatabase'],
		},
	},
	default: '',
	description: 'Title of the database',
},
{
	displayName: 'Properties',
	name: 'properties',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['createDatabase'],
		},
	},
	default: '{}',
	description: 'Database properties schema definition',
},
{
	displayName: 'Icon',
	name: 'icon',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['createDatabase', 'updateDatabase'],
		},
	},
	default: '',
	description: 'Icon for the database (emoji or external URL)',
},
{
	displayName: 'Cover',
	name: 'cover',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['createDatabase', 'updateDatabase'],
		},
	},
	default: '',
	description: 'Cover image for the database',
},
{
	displayName: 'Is Inline',
	name: 'isInline',
	type: 'boolean',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['createDatabase'],
		},
	},
	default: false,
	description: 'Whether the database should be displayed inline in the parent page',
},
{
	displayName: 'Title',
	name: 'title',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['updateDatabase'],
		},
	},
	default: '',
	description: 'New title for the database',
},
{
	displayName: 'Description',
	name: 'description',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['updateDatabase'],
		},
	},
	default: '',
	description: 'New description for the database',
},
{
	displayName: 'Properties',
	name: 'properties',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['updateDatabase'],
		},
	},
	default: '',
	description: 'Updated properties schema for the database',
},
{
	displayName: 'Filter',
	name: 'filter',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['queryDatabase'],
		},
	},
	default: '',
	description: 'Filter conditions for querying the database',
},
{
	displayName: 'Sorts',
	name: 'sorts',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['queryDatabase'],
		},
	},
	default: '',
	description: 'Sort criteria for the query results',
},
{
	displayName: 'Start Cursor',
	name: 'startCursor',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['queryDatabase'],
		},
	},
	default: '',
	description: 'Cursor for pagination',
},
{
	displayName: 'Page Size',
	name: 'pageSize',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['database'],
			operation: ['queryDatabase'],
		},
	},
	default: 100,
	description: 'Number of results to return (max 100)',
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
  description: 'Pagination cursor for starting position',
},
{
  displayName: 'Page Size',
  name: 'pageSize',
  type: 'number',
  displayOptions: { show: { resource: ['block'], operation: ['getBlockChildren'] } },
  default: 100,
  description: 'Number of results to return (max 100)',
},
{
  displayName: 'Block Type',
  name: 'blockType',
  type: 'options',
  displayOptions: { show: { resource: ['block'], operation: ['updateBlock'] } },
  options: [
    { name: 'Paragraph', value: 'paragraph' },
    { name: 'Heading 1', value: 'heading_1' },
    { name: 'Heading 2', value: 'heading_2' },
    { name: 'Heading 3', value: 'heading_3' },
    { name: 'Bulleted List Item', value: 'bulleted_list_item' },
    { name: 'Numbered List Item', value: 'numbered_list_item' },
    { name: 'To Do', value: 'to_do' },
    { name: 'Toggle', value: 'toggle' }
  ],
  default: 'paragraph',
  description: 'The type of block to update',
},
{
  displayName: 'Archived',
  name: 'archived',
  type: 'boolean',
  displayOptions: { show: { resource: ['block'], operation: ['updateBlock'] } },
  default: false,
  description: 'Whether the block is archived',
},
{
  displayName: 'Block Content',
  name: 'blockContent',
  type: 'json',
  displayOptions: { show: { resource: ['block'], operation: ['updateBlock'] } },
  default: '{}',
  description: 'Block content in JSON format',
},
{
  displayName: 'Children',
  name: 'children',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['block'], operation: ['appendBlockChildren'] } },
  default: '[]',
  description: 'Array of child blocks to append in JSON format',
},
{
  displayName: 'After Block ID',
  name: 'after',
  type: 'string',
  displayOptions: { show: { resource: ['block'], operation: ['appendBlockChildren'] } },
  default: '',
  description: 'Insert after this block ID',
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
        case 'createPage': {
          const parent = this.getNodeParameter('parent', i) as object;
          const properties = this.getNodeParameter('properties', i) as object;
          const children = this.getNodeParameter('children', i, []) as any[];
          const icon = this.getNodeParameter('icon', i, null) as object;
          const cover = this.getNodeParameter('cover', i, null) as object;

          const body: any = {
            parent,
            properties,
          };

          if (children && children.length > 0) {
            body.children = children;
          }
          if (icon && Object.keys(icon).length > 0) {
            body.icon = icon;
          }
          if (cover && Object.keys(cover).length > 0) {
            body.cover = cover;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/pages`,
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

        case 'getPage': {
          const pageId = this.getNodeParameter('pageId', i) as string;
          const filterProperties = this.getNodeParameter('filterProperties', i, '') as string;

          let url = `${credentials.baseUrl}/pages/${pageId}`;
          if (filterProperties) {
            url += `?filter_properties=${encodeURIComponent(filterProperties)}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updatePage': {
          const pageId = this.getNodeParameter('pageId', i) as string;
          const properties = this.getNodeParameter('properties', i, {}) as object;
          const icon = this.getNodeParameter('icon', i, null) as object;
          const cover = this.getNodeParameter('cover', i, null) as object;
          const archived = this.getNodeParameter('archived', i, false) as boolean;

          const body: any = {};

          if (properties && Object.keys(properties).length > 0) {
            body.properties = properties;
          }
          if (icon && Object.keys(icon).length > 0) {
            body.icon = icon;
          }
          if (cover && Object.keys(cover).length > 0) {
            body.cover = cover;
          }
          if (archived !== undefined) {
            body.archived = archived;
          }

          const options: any = {
            method: 'PATCH',
            url: `${credentials.baseUrl}/pages/${pageId}`,
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

        case 'getPageProperty': {
          const pageId = this.getNodeParameter('pageId', i) as string;
          const propertyId = this.getNodeParameter('propertyId', i) as string;
          const startCursor = this.getNodeParameter('startCursor', i, '') as string;
          const pageSize = this.getNodeParameter('pageSize', i, 100) as number;

          let url = `${credentials.baseUrl}/pages/${pageId}/properties/${propertyId}`;
          const queryParams: string[] = [];

          if (startCursor) {
            queryParams.push(`start_cursor=${encodeURIComponent(startCursor)}`);
          }
          if (pageSize && pageSize !== 100) {
            queryParams.push(`page_size=${pageSize}`);
          }

          if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Notion-Version': '2022-06-28',
            },
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

			const baseOptions: any = {
				headers: {
					'Authorization': `Bearer ${credentials.token}`,
					'Notion-Version': '2022-06-28',
					'Content-Type': 'application/json',
				},
				json: true,
			};

			switch (operation) {
				case 'createDatabase': {
					const parent = this.getNodeParameter('parent', i) as any;
					const title = this.getNodeParameter('title', i) as string;
					const properties = this.getNodeParameter('properties', i) as any;
					const icon = this.getNodeParameter('icon', i) as any;
					const cover = this.getNodeParameter('cover', i) as any;
					const isInline = this.getNodeParameter('isInline', i) as boolean;

					const body: any = {
						parent: typeof parent === 'string' ? JSON.parse(parent) : parent,
						title: [
							{
								type: 'text',
								text: {
									content: title,
								},
							},
						],
						properties: typeof properties === 'string' ? JSON.parse(properties) : properties,
						is_inline: isInline,
					};

					if (icon) {
						body.icon = typeof icon === 'string' ? JSON.parse(icon) : icon;
					}

					if (cover) {
						body.cover = typeof cover === 'string' ? JSON.parse(cover) : cover;
					}

					const options: any = {
						...baseOptions,
						method: 'POST',
						url: 'https://api.notion.com/v1/databases',
						body,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getDatabase': {
					const databaseId = this.getNodeParameter('databaseId', i) as string;

					const options: any = {
						...baseOptions,
						method: 'GET',
						url: `https://api.notion.com/v1/databases/${databaseId}`,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'updateDatabase': {
					const databaseId = this.getNodeParameter('databaseId', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					const properties = this.getNodeParameter('properties', i) as any;
					const icon = this.getNodeParameter('icon', i) as any;
					const cover = this.getNodeParameter('cover', i) as any;

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

					if (description) {
						body.description = [
							{
								type: 'text',
								text: {
									content: description,
								},
							},
						];
					}

					if (properties) {
						body.properties = typeof properties === 'string' ? JSON.parse(properties) : properties;
					}

					if (icon) {
						body.icon = typeof icon === 'string' ? JSON.parse(icon) : icon;
					}

					if (cover) {
						body.cover = typeof cover === 'string' ? JSON.parse(cover) : cover;
					}

					const options: any = {
						...baseOptions,
						method: 'PATCH',
						url: `https://api.notion.com/v1/databases/${databaseId}`,
						body,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'queryDatabase': {
					const databaseId = this.getNodeParameter('databaseId', i) as string;
					const filter = this.getNodeParameter('filter', i) as any;
					const sorts = this.getNodeParameter('sorts', i) as any;
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
						...baseOptions,
						method: 'POST',
						url: `https://api.notion.com/v1/databases/${databaseId}/query`,
						body,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
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
            url: `https://api.notion.com/v1/blocks/${blockId}`,
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

        case 'getBlockChildren': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const startCursor = this.getNodeParameter('startCursor', i, '') as string;
          const pageSize = this.getNodeParameter('pageSize', i, 100) as number;
          
          let queryParams = `?page_size=${pageSize}`;
          if (startCursor) {
            queryParams += `&start_cursor=${encodeURIComponent(startCursor)}`;
          }

          const options: any = {
            method: 'GET',
            url: `https://api.notion.com/v1/blocks/${blockId}/children${queryParams}`,
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

        case 'updateBlock': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const blockType = this.getNodeParameter('blockType', i) as string;
          const archived = this.getNodeParameter('archived', i, false) as boolean;
          const blockContent = this.getNodeParameter('blockContent', i, '{}') as string;

          let body: any = {
            archived,
          };

          try {
            const contentObj = JSON.parse(blockContent);
            body[blockType] = contentObj;
          } catch (error: any) {
            throw new Error(`Invalid JSON in block content: ${error.message}`);
          }

          const options: any = {
            method: 'PATCH',
            url: `https://api.notion.com/v1/blocks/${blockId}`,
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

        case 'deleteBlock': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const options: any = {
            method: 'DELETE',
            url: `https://api.notion.com/v1/blocks/${blockId}`,
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

        case 'appendBlockChildren': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          const children = this.getNodeParameter('children', i) as string;
          const after = this.getNodeParameter('after', i, '') as string;

          let body: any = {};

          try {
            body.children = JSON.parse(children);
          } catch (error: any) {
            throw new Error(`Invalid JSON in children: ${error.message}`);
          }

          if (after) {
            body.after = after;
          }

          const options: any = {
            method: 'PATCH',
            url: `https://api.notion.com/v1/blocks/${blockId}/children`,
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
