# n8n-nodes-notion

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Notion integration with 3 resources (Page, Database, Block) that enables seamless automation of content management, database operations, and workspace organization within your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Notion API](https://img.shields.io/badge/Notion%20API-2022--06--28-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Documentation](https://img.shields.io/badge/docs-complete-brightgreen)

## Features

- **Page Management** - Create, retrieve, update, and archive Notion pages with full property support
- **Database Operations** - Query databases, create records, update entries, and manage database schemas
- **Block Manipulation** - Add, update, delete, and retrieve blocks for rich content creation
- **Rich Content Support** - Handle text formatting, embeds, files, and multimedia content
- **Property Handling** - Support for all Notion property types including relations, formulas, and rollups
- **Bulk Operations** - Efficient batch processing for large-scale data operations
- **Error Recovery** - Robust error handling with automatic retry mechanisms
- **Type Safety** - Full TypeScript implementation with comprehensive type definitions

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-notion`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-notion
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-notion.git
cd n8n-nodes-notion
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-notion
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Notion integration token from https://www.notion.so/my-integrations | Yes |
| Environment | API environment (defaults to production) | No |

## Resources & Operations

### 1. Page

| Operation | Description |
|-----------|-------------|
| Create | Create a new page with specified properties and content |
| Get | Retrieve page details including properties and metadata |
| Update | Update page properties, title, and archived status |
| Archive | Archive a page (set archived status to true) |
| Get All | List all pages accessible by the integration |

### 2. Database

| Operation | Description |
|-----------|-------------|
| Query | Query database entries with filters, sorts, and pagination |
| Create | Create a new database with specified schema and properties |
| Update | Update database title, description, and properties |
| Get | Retrieve database schema and configuration details |
| Get All | List all databases accessible by the integration |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Append | Append new blocks to a page or existing block |
| Get | Retrieve block content and metadata |
| Update | Update block content and formatting |
| Delete | Delete a block from a page |
| Get Children | Get all child blocks of a parent block |

## Usage Examples

```javascript
// Create a new page in a database
{
  "parent": {
    "database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "properties": {
    "Name": {
      "title": [{"text": {"content": "New Project"}}]
    },
    "Status": {
      "select": {"name": "In Progress"}
    }
  }
}
```

```javascript
// Query database with filters
{
  "database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filter": {
    "property": "Status",
    "select": {
      "equals": "Done"
    }
  },
  "sorts": [
    {
      "property": "Created",
      "direction": "descending"
    }
  ]
}
```

```javascript
// Append blocks to a page
{
  "block_id": "page_id_here",
  "children": [
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{"text": {"content": "This is a new paragraph."}}]
      }
    }
  ]
}
```

```javascript
// Update page properties
{
  "page_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "properties": {
    "Status": {
      "select": {"name": "Completed"}
    },
    "Last Updated": {
      "date": {"start": "2024-01-15"}
    }
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or missing API key | Verify API token in credentials and ensure integration has proper permissions |
| 404 Not Found | Page, database, or block doesn't exist | Check resource ID and ensure integration has access to the workspace |
| 400 Bad Request | Invalid request format or missing required fields | Validate request parameters and property types |
| 429 Rate Limited | Too many requests in a short period | Implement exponential backoff and reduce request frequency |
| 403 Forbidden | Insufficient permissions for the operation | Grant necessary permissions to the integration in Notion |
| 500 Internal Server Error | Notion API service error | Retry the request after a brief delay or check Notion status page |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-notion/issues)
- **Notion API Documentation**: [developers.notion.com](https://developers.notion.com)
- **Notion Community**: [notion.so/community](https://www.notion.so/community)