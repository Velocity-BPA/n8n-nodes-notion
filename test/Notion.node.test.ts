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
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.notion.com/v1'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('createPage operation', () => {
    it('should create a page successfully', async () => {
      const mockResponse = { id: 'page-123', object: 'page' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createPage')
        .mockReturnValueOnce({ database_id: 'db-123' })
        .mockReturnValueOnce({ Name: { title: [{ text: { content: 'Test Page' } }] } })
        .mockReturnValueOnce([])
        .mockReturnValueOnce({})
        .mockReturnValueOnce({});

      const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.notion.com/v1/pages',
        headers: {
          'Authorization': 'Bearer test-key',
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: {
          parent: { database_id: 'db-123' },
          properties: { Name: { title: [{ text: { content: 'Test Page' } }] } },
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle create page error', async () => {
      const mockError = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createPage');

      await expect(executePageOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
    });
  });

  describe('getPage operation', () => {
    it('should get a page successfully', async () => {
      const mockResponse = { id: 'page-123', object: 'page', properties: {} };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPage')
        .mockReturnValueOnce('page-123')
        .mockReturnValueOnce('');

      const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.notion.com/v1/pages/page-123',
        headers: {
          'Authorization': 'Bearer test-key',
          'Notion-Version': '2022-06-28',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle get page error', async () => {
      const mockError = new Error('Page not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPage')
        .mockReturnValueOnce('page-123');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Page not found' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('updatePage operation', () => {
    it('should update a page successfully', async () => {
      const mockResponse = { id: 'page-123', object: 'page', archived: false };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updatePage')
        .mockReturnValueOnce('page-123')
        .mockReturnValueOnce({ Name: { title: [{ text: { content: 'Updated Page' } }] } })
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})
        .mockReturnValueOnce(false);

      const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://api.notion.com/v1/pages/page-123',
        headers: {
          'Authorization': 'Bearer test-key',
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: {
          properties: { Name: { title: [{ text: { content: 'Updated Page' } }] } },
          archived: false,
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getPageProperty operation', () => {
    it('should get page property successfully', async () => {
      const mockResponse = { object: 'property_item', property: { id: 'prop-123' } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPageProperty')
        .mockReturnValueOnce('page-123')
        .mockReturnValueOnce('prop-123')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(100);

      const result = await executePageOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.notion.com/v1/pages/page-123/properties/prop-123',
        headers: {
          'Authorization': 'Bearer test-key',
          'Notion-Version': '2022-06-28',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Database Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				token: 'test-token',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should create a database successfully', async () => {
		const mockResponse = {
			id: 'test-database-id',
			object: 'database',
			title: [{ type: 'text', text: { content: 'Test Database' } }],
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createDatabase')
			.mockReturnValueOnce('{"type": "page_id", "page_id": "test-page-id"}')
			.mockReturnValueOnce('Test Database')
			.mockReturnValueOnce('{"Name": {"title": {}}}')
			.mockReturnValueOnce('')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(false);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json).toEqual(mockResponse);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.notion.com/v1/databases',
			headers: {
				'Authorization': 'Bearer test-token',
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json',
			},
			json: true,
			body: {
				parent: { type: 'page_id', page_id: 'test-page-id' },
				title: [{ type: 'text', text: { content: 'Test Database' } }],
				properties: { Name: { title: {} } },
				is_inline: false,
			},
		});
	});

	it('should get a database successfully', async () => {
		const mockResponse = {
			id: 'test-database-id',
			object: 'database',
			title: [{ type: 'text', text: { content: 'Test Database' } }],
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getDatabase')
			.mockReturnValueOnce('test-database-id');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json).toEqual(mockResponse);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.notion.com/v1/databases/test-database-id',
			headers: {
				'Authorization': 'Bearer test-token',
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json',
			},
			json: true,
		});
	});

	it('should query a database successfully', async () => {
		const mockResponse = {
			results: [{ id: 'page-1' }, { id: 'page-2' }],
			has_more: false,
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('queryDatabase')
			.mockReturnValueOnce('test-database-id')
			.mockReturnValueOnce('{"property": "Name", "rich_text": {"contains": "test"}}')
			.mockReturnValueOnce('')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(100);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json).toEqual(mockResponse);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.notion.com/v1/databases/test-database-id/query',
			headers: {
				'Authorization': 'Bearer test-token',
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json',
			},
			json: true,
			body: {
				filter: { property: 'Name', rich_text: { contains: 'test' } },
				page_size: 100,
			},
		});
	});

	it('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getDatabase')
			.mockReturnValueOnce('invalid-id');

		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Database not found'));

		const result = await executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json.error).toBe('Database not found');
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getDatabase')
			.mockReturnValueOnce('invalid-id');

		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Database not found'));

		await expect(
			executeDatabaseOperations.call(mockExecuteFunctions, [{ json: {} }]),
		).rejects.toThrow('Database not found');
	});
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        token: 'test-token' 
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

  test('should get block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('block-id-123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: 'block-id-123',
      type: 'paragraph',
      object: 'block'
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.id).toBe('block-id-123');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/block-id-123',
      headers: {
        'Authorization': 'Bearer test-token',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should get block children successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockChildren')
      .mockReturnValueOnce('block-id-123')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(50);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      results: [{ id: 'child-1', type: 'paragraph' }],
      has_more: false
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.results).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.notion.com/v1/blocks/block-id-123/children?page_size=50',
      headers: {
        'Authorization': 'Bearer test-token',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should update block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateBlock')
      .mockReturnValueOnce('block-id-123')
      .mockReturnValueOnce('paragraph')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('{"rich_text": [{"type": "text", "text": {"content": "Updated text"}}]}');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: 'block-id-123',
      type: 'paragraph',
      archived: false
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.id).toBe('block-id-123');
  });

  test('should delete block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('deleteBlock')
      .mockReturnValueOnce('block-id-123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: 'block-id-123',
      archived: true
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.archived).toBe(true);
  });

  test('should append block children successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('appendBlockChildren')
      .mockReturnValueOnce('block-id-123')
      .mockReturnValueOnce('[{"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "New child block"}}]}}]')
      .mockReturnValueOnce('');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      results: [{ id: 'new-child-id', type: 'paragraph' }]
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.results).toHaveLength(1);
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('invalid-block-id');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Block not found');
  });
});
});
