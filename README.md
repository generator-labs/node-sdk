# Generator Labs Node.js SDK

[![Tests](https://github.com/generator-labs/node-sdk/actions/workflows/tests.yml/badge.svg)](https://github.com/generator-labs/node-sdk/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/generator-labs/node-sdk/branch/master/graph/badge.svg)](https://codecov.io/gh/generator-labs/node-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official Node.js SDK for the [Generator Labs](https://generatorlabs.com) API v4.0.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [RBL Monitoring](#rbl-monitoring)
  - [List Hosts](#list-hosts)
  - [Get a Single Host](#get-a-single-host)
  - [Create a New Host](#create-a-new-host)
  - [Update a Host](#update-a-host)
  - [Delete a Host](#delete-a-host)
  - [Pause/Resume a Host](#pauseresume-a-host)
  - [Start a Manual RBL Check](#start-a-manual-rbl-check)
  - [Manage RBL Profiles](#manage-rbl-profiles)
  - [Manage RBL Sources](#manage-rbl-sources)
- [Contact Management](#contact-management)
  - [Manage Contacts](#manage-contacts)
  - [Manage Contact Groups](#manage-contact-groups)
- [Certificate Monitoring](#certificate-monitoring)
  - [List Certificate Errors](#list-certificate-errors)
  - [Manage Certificate Monitors](#manage-certificate-monitors)
  - [Manage Certificate Profiles](#manage-certificate-profiles)
- [Pagination](#pagination)
- [Webhook Verification](#webhook-verification)
- [Rate Limiting](#rate-limiting)
- [TypeScript Support](#typescript-support)
- [API Structure](#api-structure)
- [Development](#development)
- [Release History](#release-history)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Features

- Full support for Generator Labs API v4.0
- Automatic retry logic with exponential backoff and `Retry-After` header support
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

## RBL Monitoring

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
  const host = await client.rbl.hosts.get('HT1a2b3c4d5e6f7890abcdef1234567890');
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
    profile: 'RP9f8e7d6c5b4a3210fedcba0987654321',
    contact_group: [
      'CG4f3e2d1c0b9a8776655443322110fedc',
      'CG5a6b7c8d9e0f1234567890abcdef1234'
    ],
    tags: ['production', 'web']
  });
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Update a Host

```javascript
try {
  const result = await client.rbl.hosts.update('HT1a2b3c4d5e6f7890abcdef1234567890', {
    name: 'Updated Mail Server Name',
    tags: ['production', 'web']
  });
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Delete a Host

```javascript
try {
  const result = await client.rbl.hosts.delete('HT1a2b3c4d5e6f7890abcdef1234567890');
  console.log(result);
} catch (err) {
  console.error(err);
}
```

### Pause/Resume a Host

```javascript
try {
  // Pause monitoring
  await client.rbl.hosts.pause('HT1a2b3c4d5e6f7890abcdef1234567890');

  // Resume monitoring
  await client.rbl.hosts.resume('HT1a2b3c4d5e6f7890abcdef1234567890');
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

### Manage RBL Profiles

```javascript
try {
  // List all profiles
  const profiles = await client.rbl.profiles.get();

  // Get a specific profile
  const profile = await client.rbl.profiles.get('RP9f8e7d6c5b4a3210fedcba0987654321');

  // Create a new profile
  const result = await client.rbl.profiles.create({
    name: 'My Custom Profile',
    entries: [
      'RB1234567890abcdef1234567890abcdef',
      'RB0987654321fedcba0987654321fedcba'
    ]
  });

  // Update a profile
  await client.rbl.profiles.update('RP9f8e7d6c5b4a3210fedcba0987654321', {
    name: 'Updated Profile Name',
    entries: [
      'RB1234567890abcdef1234567890abcdef',
      'RB0987654321fedcba0987654321fedcba'
    ]
  });

  // Delete a profile
  await client.rbl.profiles.delete('RP9f8e7d6c5b4a3210fedcba0987654321');
} catch (err) {
  console.error(err);
}
```

### Manage RBL Sources

```javascript
try {
  // List all sources
  const sources = await client.rbl.sources.get();

  // Get a specific source
  const source = await client.rbl.sources.get('RB18c470cc518a09678bb280960dbdd524');

  // Create a custom source
  const result = await client.rbl.sources.create({
    host: 'custom.rbl.example.com',
    type: 'rbl',
    custom_codes: ['127.0.0.2', '127.0.0.3']
  });

  // Update a source
  await client.rbl.sources.update('RB18c470cc518a09678bb280960dbdd524', {
    host: 'updated.rbl.example.com',
    custom_codes: ['127.0.0.2', '127.0.0.3']
  });

  // Delete a source
  await client.rbl.sources.delete('RB18c470cc518a09678bb280960dbdd524');
} catch (err) {
  console.error(err);
}
```

## Contact Management

### Manage Contacts

```javascript
try {
  // List contacts
  const contacts = await client.contact.contacts.get();

  // Create a contact
  const result = await client.contact.contacts.create({
    contact: 'admin@example.com',
    type: 'email',
    schedule: 'every_check',
    contact_group: [
      'CG4f3e2d1c0b9a8776655443322110fedc',
      'CG5a6b7c8d9e0f1234567890abcdef1234'
    ]
  });

  // Update a contact
  await client.contact.contacts.update('COabcdef1234567890abcdef1234567890', {
    contact: 'updated@example.com',
    contact_group: [
      'CG4f3e2d1c0b9a8776655443322110fedc',
      'CG5a6b7c8d9e0f1234567890abcdef1234'
    ]
  });

  // Confirm a contact
  await client.contact.contacts.confirm('COabcdef1234567890abcdef1234567890', {
    authcode: '123456'
  });

  // Delete a contact
  await client.contact.contacts.delete('COabcdef1234567890abcdef1234567890');
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
    name: 'Primary Contacts'
  });

  // Update a contact group
  await client.contact.groups.update('CG4f3e2d1c0b9a8776655443322110fed', {
    name: 'Updated Group Name'
  });

  // Delete a contact group
  await client.contact.groups.delete('CG4f3e2d1c0b9a8776655443322110fed');
} catch (err) {
  console.error(err);
}
```

## Certificate Monitoring

Certificate monitoring allows you to monitor SSL/TLS certificates for expiration, validity, and configuration issues across HTTPS, SMTPS, IMAPS, and other TLS-enabled services.

### List Certificate Errors

```javascript
try {
  // List all certificate errors
  const errors = await client.cert.errors.get();

  // Get a specific error by ID
  const error = await client.cert.errors.get('CE5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a');

  console.log(errors);
} catch (err) {
  console.error(err);
}
```

### Manage Certificate Monitors

```javascript
try {
  // List all certificate monitors
  const monitors = await client.cert.monitors.get();

  // Get a specific monitor
  const monitor = await client.cert.monitors.get('CM62944aeeee2b46d7a28221164f38976a');

  // Create a new certificate monitor
  const monitor = await client.cert.monitors.create({
    name: 'Production Web Server',
    hostname: 'example.com',
    protocol: 'https',
    profile: 'CP79b597e61a984a35b5eb7dcdbc3de53c',
    contact_group: [
      'CG4f3e2d1c0b9a8776655443322110fedc',
      'CG5a6b7c8d9e0f1234567890abcdef1234'
    ],
    tags: ['production', 'web', 'ssl']
  });

  // Update a monitor
  const updatedMonitor = await client.cert.monitors.update('CM62944aeeee2b46d7a28221164f38976a', {
    name: 'Updated Server Name',
    tags: ['production', 'web', 'ssl']
  });

  // Delete a monitor
  await client.cert.monitors.delete('CM62944aeeee2b46d7a28221164f38976a');

  // Pause monitoring
  await client.cert.monitors.pause('CM62944aeeee2b46d7a28221164f38976a');

  // Resume monitoring
  await client.cert.monitors.resume('CM62944aeeee2b46d7a28221164f38976a');
} catch (err) {
  console.error(err);
}
```

### Manage Certificate Profiles

```javascript
try {
  // List all certificate profiles
  const profiles = await client.cert.profiles.get();

  // Get a specific profile
  const profile = await client.cert.profiles.get('CP79b597e61a984a35b5eb7dcdbc3de53c');

  // Create a new profile
  const profile = await client.cert.profiles.create({
    name: 'Standard Certificate Profile',
    expiration_thresholds: [30, 14, 7],
    alert_on_expiration: true,
    alert_on_name_mismatch: true,
    alert_on_misconfigurations: true,
    alert_on_changes: true
  });

  // Update a profile
  const updatedProfile = await client.cert.profiles.update('CP79b597e61a984a35b5eb7dcdbc3de53c', {
    expiration_thresholds: [45, 14, 7],
    alert_on_misconfigurations: true,
    alert_on_changes: true
  });

  // Delete a profile
  await client.cert.profiles.delete('CP79b597e61a984a35b5eb7dcdbc3de53c');
} catch (err) {
  console.error(err);
}
```

## Pagination

List endpoints return paginated results. You can manually pass `page` and `page_size` parameters, or use the `getAll()` helper to automatically fetch every page and return a flat array of all items:

```javascript
try {
  // Get all hosts across all pages (default page_size: 100)
  const allHosts = await client.rbl.hosts.getAll();

  for (const host of allHosts) {
    console.log(`${host.name} - ${host.host}`);
  }

  // With a custom page size
  const allHosts = await client.rbl.hosts.getAll({ page_size: 50 });

} catch (err) {
  console.error(err);
}
```

The `getAll()` method is available on all list endpoints:

- `client.rbl.hosts.getAll()`
- `client.rbl.profiles.getAll()`
- `client.rbl.sources.getAll()`
- `client.rbl.listings.getAll()`
- `client.contact.contacts.getAll()`
- `client.contact.groups.getAll()`
- `client.cert.monitors.getAll()`
- `client.cert.profiles.getAll()`
- `client.cert.errors.getAll()`

## Webhook Verification

The SDK includes a helper for verifying incoming webhook signatures. Each webhook is assigned a signing secret (available in the Portal), which is used to compute an HMAC-SHA256 signature sent with every request in the `X-Webhook-Signature` header.

```typescript
import { Webhook, Exception } from 'generatorlabs';

const header = req.headers['x-webhook-signature'] as string;
const body = req.body; // raw string body
const secret = process.env.GENERATOR_LABS_WEBHOOK_SECRET!;

try {
  const payload = Webhook.verify(body, header, secret);

  // payload is the decoded event data
  console.log(payload.event);

} catch (error) {
  // Signature verification failed
  res.status(403).json({ error: 'Invalid signature' });
}
```

The default timestamp tolerance is 5 minutes. You can customize it (in seconds), or pass `0` to disable:

```typescript
const payload = Webhook.verify(body, header, secret, 600);  // 10-minute tolerance
const payload = Webhook.verify(body, header, secret, 0);    // disable timestamp check
```

See `examples/webhook-verification.ts` for a complete example.

## API Documentation

Full API documentation is available at the [Generator Labs Developer Site](https://docs.generatorlabs.com/api/v4/).

## Rate Limiting

The API enforces two layers of rate limiting:

- **Hourly limit**: 1,000 requests per hour per application
- **Per-second limit**: varies by endpoint — 100 RPS for read operations, 50 RPS for write operations, and 20 RPS for manual check start

When a rate limit is exceeded, the API returns HTTP 429 with a `Retry-After` header indicating how many seconds to wait. The SDK automatically respects this header during retries, falling back to exponential backoff for other retryable errors.

All API responses include IETF draft rate limit headers, accessible via the `rateLimitInfo` property on every response:

| Header | Description | Example |
|--------|-------------|---------|
| `RateLimit-Limit` | Active rate limit policies | `1000;w=3600, 100;w=1` |
| `RateLimit-Remaining` | Requests remaining in the most restrictive window | `95` |
| `RateLimit-Reset` | Seconds until the most restrictive window resets | `1` |

```javascript
const response = await client.rbl.hosts.get();

// Access response data (property access works as before)
const hosts = response.data;

// Access rate limit info
if (response.rateLimitInfo) {
  console.log(`Remaining: ${response.rateLimitInfo.remaining}`);
  console.log(`Reset: ${response.rateLimitInfo.reset}s`);
}
```

## API Structure

The v4.0 API follows a RESTful design with three main resource namespaces:

### RBL Namespace (`client.rbl`)

- **hosts** - List, get, create, update, delete, pause, and resume hosts
- **listings** - Get currently listed hosts
- **check** - Start manual checks and get status
- **profiles** - List, get, create, update, and delete monitoring profiles
- **sources** - List, get, create, update, delete, pause, and resume RBL sources

### Contact Namespace (`client.contact`)

- **contacts** - List, get, create, update, delete, pause, resume, confirm, and resend contacts
- **groups** - List, get, create, update, and delete contact groups

### Certificate Namespace (`client.cert`)

- **errors** - List certificate errors and get specific error details
- **monitors** - List, get, create, update, delete, pause, and resume certificate monitors
- **profiles** - List, get, create, update, and delete certificate monitoring profiles

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

### v2.0.1 (2026-06-19)
* Error detection now reads the API `status_code` and `status_message`; any `status_code` (or HTTP status) of 400 or greater throws `Exception` with the API message
* `Exception` now carries a `statusCode` property

### v2.0.0 (2026-01-31)
* Complete rewrite for Generator Labs API v4.0
* Migrated to TypeScript with full type definitions
* RESTful endpoint design with proper HTTP verbs
* Updated to use Generator Labs branding (formerly RBLTracker)
* Minimum Node.js version bumped to 18.0.0
* Replaced deprecated `request` library with `axios`
* Added full Jest test coverage
* Added GitHub Actions CI/CD workflow
* Organized endpoints under `/rbl/`, `/contact/`, and `/cert/` namespaces
* Added support for PUT and DELETE methods
* Improved error handling for v4.0 response format
* Promise-based API with async/await support
* Automatic `Retry-After` header support on 429 rate limit responses
* `ApiResponse` wrapper exposes per-request rate limit info (`rateLimitInfo`)
* Added `RateLimitInfo` type with `limit`, `remaining`, and `reset` fields
* Webhook signature verification with HMAC-SHA256 and constant-time comparison
* Automatic pagination via `getAll()` for large result sets

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
