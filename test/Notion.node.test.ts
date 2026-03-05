/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Notion } from '../nodes/Notion/Notion.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Notion Node', () => {
  let node: Notion;

  beforeAll(() => {
    node = new Notion();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Notion');
      expect(node.description.name).toBe('notion');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 3 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(3);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(3);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Page Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ token: 'test-token' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn() },
    };
  });
  
  it('should get a page successfully', async () => {
    const mockResponse = { id: 'page-123', properties: {} };
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getPage';
      if (param === 'pageId') return 'page-123';
      return undefined;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.notion.com/v1/pages/page-123',
      headers: {
        'Authorization': 'Bearer test-token',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });
  
  it('should update a page successfully', async () => {
    const mockResponse = { id: 'page-123', properties: { title: 'Updated' } };
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'updatePage';
      if (param === 'pageId') return 'page-123';
      if (param === 'properties') return { title: 'Updated' };
      if (param === 'archived') return false;
      return undefined;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });
  
  it('should create a page successfully', async () => {
    const mockResponse = { id: 'page-456', properties: {} };
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'createPage';
      if (param === 'parent') return { database_id: 'db-123' };
      if (param === 'properties') return {};
      if (param === 'children') return [];
      return undefined;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    
    const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });
  
  it('should handle errors when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getPage';
      if (param === 'pageId') return 'invalid-page';
      return undefined;
    });
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Page not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    
    const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toEqual([{ json: { error: 'Page not found' }, pairedItem: { item: 0 } }]);
  });
});

describe('Database Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.notion.com/v1'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			},
		};
	});

	describe('getDatabase operation', () => {
		it('should get database successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getDatabase')
				.mockReturnValueOnce('database-123');
			
			const mockResponse = { id: 'database-123', title: [{ text: { content: 'Test Database' } }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.notion.com/v1/databases/database-123',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
					'Notion-Version': '2022-06-28'
				},
				json: true,
			});
		});

		it('should handle errors gracefully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getDatabase')
				.mockReturnValueOnce('database-123');
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('queryDatabase operation', () => {
		it('should query database successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('queryDatabase')
				.mockReturnValueOnce('database-123')
				.mockReturnValueOnce('{"property": "Status", "select": {"equals": "Done"}}')
				.mockReturnValueOnce('[{"property": "Created", "direction": "descending"}]')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(50);

			const mockResponse = { results: [], has_more: false };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.notion.com/v1/databases/database-123/query',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
					'Notion-Version': '2022-06-28'
				},
				body: {
					filter: { property: 'Status', select: { equals: 'Done' } },
					sorts: [{ property: 'Created', direction: 'descending' }],
					page_size: 50
				},
				json: true,
			});
		});
	});

	describe('createDatabase operation', () => {
		it('should create database successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createDatabase')
				.mockReturnValueOnce({ parentType: [{ type: 'page_id', page_id: 'page-123' }] })
				.mockReturnValueOnce('New Database')
				.mockReturnValueOnce('{"Title": {"title": {}}}');

			const mockResponse = { id: 'database-456', title: [{ text: { content: 'New Database' } }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.notion.com/v1/databases',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
					'Notion-Version': '2022-06-28'
				},
				body: {
					parent: { page_id: 'page-123' },
					title: [{ type: 'text', text: { content: 'New Database' } }],
					properties: { Title: { title: {} } }
				},
				json: true,
			});
		});
	});

	describe('updateDatabase operation', () => {
		it('should update database successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateDatabase')
				.mockReturnValueOnce('database-123')
				.mockReturnValueOnce('Updated Database')
				.mockReturnValueOnce('{"NewProperty": {"text": {}}}');

			const mockResponse = { id: 'database-123', title: [{ text: { content: 'Updated Database' } }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				url: 'https://api.notion.com/v1/databases/database-123',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
					'Notion-Version': '2022-06-28'
				},
				body: {
					title: [{ type: 'text', text: { content: 'Updated Database' } }],
					properties: { NewProperty: { text: {} } }
				},
				json: true,
			});
		});
	});
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.notion.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get a block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('block-123');

    const mockBlock = { id: 'block-123', type: 'paragraph', object: 'block' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlock);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/block-123',
      headers: {
        'Authorization': 'Bearer test-key',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      json: true,
    });
    expect(result).toEqual([{ json: mockBlock, pairedItem: { item: 0 } }]);
  });

  it('should get block children successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockChildren')
      .mockReturnValueOnce('block-123')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(50);

    const mockChildren = { results: [], has_more: false };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockChildren);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/block-123/children?page_size=50',
      headers: {
        'Authorization': 'Bearer test-key',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      json: true,
    });
    expect(result).toEqual([{ json: mockChildren, pairedItem: { item: 0 } }]);
  });

  it('should update a block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateBlock')
      .mockReturnValueOnce('block-123')
      .mockReturnValueOnce('paragraph')
      .mockReturnValueOnce('{"rich_text": [{"text": {"content": "Updated text"}}]}');

    const mockUpdatedBlock = { id: 'block-123', type: 'paragraph' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockUpdatedBlock);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PATCH',
      url: 'https://api.notion.com/v1/blocks/block-123',
      headers: {
        'Authorization': 'Bearer test-key',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: {
        paragraph: {
          rich_text: [{ text: { content: 'Updated text' } }]
        }
      },
      json: true,
    });
    expect(result).toEqual([{ json: mockUpdatedBlock, pairedItem: { item: 0 } }]);
  });

  it('should delete a block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('deleteBlock')
      .mockReturnValueOnce('block-123');

    const mockDeletedBlock = { id: 'block-123', archived: true };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockDeletedBlock);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      url: 'https://api.notion.com/v1/blocks/block-123',
      headers: {
        'Authorization': 'Bearer test-key',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      json: true,
    });
    expect(result).toEqual([{ json: mockDeletedBlock, pairedItem: { item: 0 } }]);
  });

  it('should append block children successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('appendBlockChildren')
      .mockReturnValueOnce('block-123')
      .mockReturnValueOnce('[{"type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "New paragraph"}}]}}]');

    const mockResult = { results: [], has_more: false };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResult);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PATCH',
      url: 'https://api.notion.com/v1/blocks/block-123/children',
      headers: {
        'Authorization': 'Bearer test-key',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: {
        children: [{
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content: 'New paragraph' } }]
          }
        }]
      },
      json: true,
    });
    expect(result).toEqual([{ json: mockResult, pairedItem: { item: 0 } }]);
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('invalid-block');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));

    await expect(
      executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Block not found');
  });

  it('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('invalid-block');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'Block not found' }, pairedItem: { item: 0 } }]);
  });
});
});
