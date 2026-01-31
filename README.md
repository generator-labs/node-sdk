# Generator Labs Node.js SDK

[![Tests](https://github.com/generator-labs/node-sdk/actions/workflows/tests.yml/badge.svg)](https://github.com/generator-labs/node-sdk/actions/workflows/tests.yml)
[![CodeQL](https://github.com/generator-labs/node-sdk/actions/workflows/codeql.yml/badge.svg)](https://github.com/generator-labs/node-sdk/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/generator-labs/node-sdk/branch/master/graph/badge.svg)](https://codecov.io/gh/generator-labs/node-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official Node.js SDK for the [Generator Labs](https://generatorlabs.com) API v4.0.

## Features

- Full support for Generator Labs API v4.0
- Automatic retry logic with exponential backoff (configurable)
- Configurable timeouts and retry behavior
- Automatic pagination support for large result sets
- RESTful endpoint design with proper HTTP verbs (GET, POST, PUT, DELETE)
- RBL and DNSBL monitoring
- Contact and contact group management
- Manual RBL checks
- Monitoring profiles and sources
- Written in TypeScript with full type definitions
- Promise-based API with async/await support
- axios with connection pooling
- Compatible with Node.js 18+

## Prerequisites

Before using this library, you must have:

* A Generator Labs account - [Sign up](https://portal.generatorlabs.com/signup/) or [Login](https://portal.generatorlabs.com/login/)
* Valid API credentials (Account SID and Auth Token) from the [Portal](https://portal.generatorlabs.com/login/)
* Node.js >= 18.0.0

## Installation

Install via npm:

```bash
npm install generatorlabs
```

Or with yarn:

```bash
yarn add generatorlabs
```

## Quick Start

### Initialize the Client

```javascript
const { Client } = require('generatorlabs');

// Basic initialization
const client = new Client('your_account_sid', 'your_auth_token');

// With custom configuration
const client = new Client(
  'your_account_sid',
  'your_auth_token',
  {
    timeout: 45000,     // Request timeout in milliseconds
    maxRetries: 5,      // Maximum retry attempts
    retryBackoff: 2     // Backoff multiplier (2x: 1s, 2s, 4s, 8s, 16s)
  }
);
```

Or with TypeScript:

```typescript
import { Client, ClientConfig } from 'generatorlabs';

const client = new Client('your_account_sid', 'your_auth_token');
```

Or with ES6 imports:

```javascript
import { Client } from 'generatorlabs';

const client = new Client('your_account_sid', 'your_auth_token');
```

### List Hosts

```javascript
try {
  const hosts = await client.rbl.hosts.get({ page_size: 10, page: 1 });
  console.log(hosts);
} catch (err) {
  console.error(err);
}
```

### Get a Single Host

```javascript
try {
  const host = await client.rbl.hosts.get('HTee06c4fa7c23aa8a3a4e8d66922b0834');
  console.log(host);
} catch (err) {
  console.error(err);
}
```

### Create a New Host

```javascript
try {
  const result = await client.rbl.hosts.create({
    name: 'My Mail Server',
    host: '192.168.1.100',
    type: 'rbl',
    rbl_profile: 'RP15d4e891d784977cacbfcbb00c48f133',
    contact_group: 'CG37106c6baa1ec90a2b3f5c8ec54afe9d'
  });
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Update a Host

```javascript
try {
  const result = await client.rbl.hosts.update('HTee06c4fa7c23aa8a3a4e8d66922b0834', {
    name: 'Updated Mail Server Name'
  });
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Delete a Host

```javascript
try {
  const result = await client.rbl.hosts.delete('HTee06c4fa7c23aa8a3a4e8d66922b0834');
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Pause/Resume a Host

```javascript
try {
  // Pause monitoring
  await client.rbl.hosts.pause('HTee06c4fa7c23aa8a3a4e8d66922b0834');

  // Resume monitoring
  await client.rbl.hosts.resume('HTee06c4fa7c23aa8a3a4e8d66922b0834');
} catch (err) {
  console.error(err);
}
```

### Start a Manual RBL Check

```javascript
try {
  const result = await client.rbl.check.start({
    host: '192.168.1.100',
    callback: 'https://myserver.com/callback',
    details: 1
  });

  const checkId = result.data.id;

  // Get check status
  const status = await client.rbl.check.status(checkId, { details: 1 });
  console.log(status);
} catch (err) {
  console.error(err);
}
```

### Manage Contacts

```javascript
try {
  // List contacts
  const contacts = await client.contact.contacts.get();

  // Create a contact
  const result = await client.contact.contacts.create({
    email: 'admin@example.com',
    type: 'email'
  });

  // Update a contact
  await client.contact.contacts.update('CT1234567890abcdef', {
    email: 'updated@example.com'
  });

  // Confirm a contact
  await client.contact.contacts.confirm('CT1234567890abcdef', {
    authcode: '123456'
  });

  // Delete a contact
  await client.contact.contacts.delete('CT1234567890abcdef');
} catch (err) {
  console.error(err);
}
```

### Manage Contact Groups

```javascript
try {
  // List contact groups
  const groups = await client.contact.groups.get();

  // Create a contact group
  const result = await client.contact.groups.create({
    name: 'Primary Contacts',
    contacts: 'CT123...,CT456...'
  });

  // Update a contact group
  await client.contact.groups.update('CG1234567890abcdef', {
    name: 'Updated Group Name'
  });

  // Delete a contact group
  await client.contact.groups.delete('CG1234567890abcdef');
} catch (err) {
  console.error(err);
}
```

## API Documentation

Full API documentation is available at the [Generator Labs Developer Site](https://docs.generatorlabs.com/api/v4/).

## API Structure

The v4.0 API follows a RESTful design with two main resource namespaces:

### RBL Namespace (`client.rbl`)

- **hosts** - List, get, create, update, delete, pause, and resume hosts
- **listings** - Get currently listed hosts
- **check** - Start manual checks and get status
- **profiles** - List, get, create, update, and delete monitoring profiles
- **sources** - List, get, create, update, delete, pause, and resume RBL sources

### Contact Namespace (`client.contact`)

- **contacts** - List, get, create, update, delete, pause, resume, confirm, and resend contacts
- **groups** - List, get, create, update, and delete contact groups

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions. TypeScript users get full IntelliSense and type checking out of the box:

```typescript
import { Client, Exception } from 'generatorlabs';

const client = new Client('your_account_sid', 'your_auth_token');

// TypeScript knows the return types
const hosts = await client.rbl.hosts.get();
```

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Lint

```bash
npm run lint
```

## Release History

### v2.0.0 (2026-01-31)
* Complete rewrite for Generator Labs API v4.0
* Migrated to TypeScript with full type definitions
* RESTful endpoint design with proper HTTP verbs
* Updated to use Generator Labs branding (formerly RBLTracker)
* Minimum Node.js version bumped to 18.0.0
* Replaced deprecated `request` library with `axios`
* Added full Jest test coverage
* Added GitHub Actions CI/CD workflow
* Organized endpoints under `/rbl/` and `/contact/` namespaces
* Added support for PUT and DELETE methods
* Improved error handling for v4.0 response format
* Promise-based API with async/await support

### v1.1.0
* Updated to use the new API endpoint URL
* Added support for Monitoring Profiles
* Added support for the ACLs endpoint

### v1.0.0
* Initial release

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For questions, issues, or feature requests:

- GitHub Issues: https://github.com/generator-labs/node-sdk/issues
- Email: support@generatorlabs.com
- Documentation: https://docs.generatorlabs.com

## License

This library is released under the MIT License. See [LICENSE](LICENSE) for details.

## Links

- [Generator Labs Website](https://generatorlabs.com/)
- [API Documentation](https://docs.generatorlabs.com/api/v4/)
- [Sign Up](https://portal.generatorlabs.com/signup/)
- [Portal Login](https://portal.generatorlabs.com/login/)
