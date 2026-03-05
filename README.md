# n8n-nodes-notion

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Notion's API, enabling you to work with 3 core resources: Pages, Databases, and Blocks. Automate content creation, database management, and block-level operations within your Notion workspace through powerful n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Notion API](https://img.shields.io/badge/Notion-API%20v1-black)
![Pages](https://img.shields.io/badge/Resources-Pages%7CDatabases%7CBlocks-green)

## Features

- **Page Management** - Create, retrieve, update, and delete Notion pages with full property support
- **Database Operations** - Query databases, create entries, update records, and manage database schemas
- **Block Manipulation** - Read, create, update, and delete blocks with support for all block types
- **Rich Content Support** - Handle rich text, media embeds, callouts, code blocks, and complex formatting
- **Property Handling** - Full support for all Notion property types including relations, formulas, and rollups
- **Batch Operations** - Efficiently process multiple items with built-in pagination and rate limiting
- **Error Recovery** - Robust error handling with automatic retries and detailed error reporting
- **Type Safety** - Complete TypeScript implementation with full type definitions

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
| API Key | Your Notion integration token from the Notion developer portal | Yes |

## Resources & Operations

### 1. Page

| Operation | Description |
|-----------|-------------|
| Create | Create a new page in a database or as a child page |
| Get | Retrieve a page by ID with all properties |
| Update | Update page properties and content |
| Delete | Move a page to trash |
| Search | Search for pages across your workspace |
| Get Properties | Retrieve all properties of a page |
| Archive | Archive a page |
| Restore | Restore an archived page |

### 2. Database

| Operation | Description |
|-----------|-------------|
| Create | Create a new database with custom properties |
| Get | Retrieve database schema and metadata |
| Update | Update database title and properties |
| Query | Query database entries with filters and sorting |
| List | List all databases in workspace |
| Create Entry | Add a new entry to a database |
| Update Entry | Update an existing database entry |
| Delete Entry | Remove an entry from a database |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a block by ID |
| Update | Update block content and properties |
| Delete | Delete a block |
| Get Children | Get all child blocks of a parent block |
| Append Children | Add new blocks as children |
| Create | Create a new block |
| Move | Move a block to a different parent |
| Duplicate | Duplicate a block and its children |

## Usage Examples

```javascript
// Create a new page in a database
{
  "parent": {
    "database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "properties": {
    "Title": {
      "title": [
        {
          "text": {
            "content": "New Project Proposal"
          }
        }
      ]
    },
    "Status": {
      "select": {
        "name": "In Progress"
      }
    }
  }
}
```

```javascript
// Query database with filters
{
  "filter": {
    "and": [
      {
        "property": "Status",
        "select": {
          "equals": "In Progress"
        }
      },
      {
        "property": "Priority",
        "select": {
          "equals": "High"
        }
      }
    ]
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
  "children": [
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Project Overview"
            }
          }
        ]
      }
    },
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "This project aims to improve our automation workflows."
            }
          }
        ]
      }
    }
  ]
}
```

```javascript
// Update page properties
{
  "properties": {
    "Status": {
      "select": {
        "name": "Completed"
      }
    },
    "Completion Date": {
      "date": {
        "start": "2024-01-15"
      }
    },
    "Notes": {
      "rich_text": [
        {
          "text": {
            "content": "Project completed successfully ahead of schedule."
          }
        }
      ]
    }
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or missing API key | Verify your Notion integration token in credentials |
| 403 Forbidden | Insufficient permissions | Ensure integration has access to the requested resource |
| 404 Not Found | Page, database, or block doesn't exist | Check the ID and ensure the resource exists |
| 429 Rate Limited | Too many requests | Node automatically retries with exponential backoff |
| 400 Bad Request | Invalid request format or parameters | Check request body format and required fields |
| 500 Internal Error | Notion server error | Retry the operation or check Notion status page |

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