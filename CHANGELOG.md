# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0]

### Added
- `client.account`: `get`, `balance`, `usage`, `pauseChecks` and `resumeChecks`.
- `client.cert.findings`: `get`, `getAll`, `dismiss` and `restore`.
- `client.cert.monitors.check(id)` queues a check now, and `client.cert.errors.count()` returns
  the number of current certificate errors.
- Request options as the last argument of every method: `idempotencyKey`, `requestId`,
  `ifNoneMatch` and `fields`.
- An `Idempotency-Key` is sent automatically on requests that create something or start a check
  (creates, contact resend and confirm, certificate monitor delete, RBL check start, certificate
  check now). It is generated once per call and reused on every retry, so a retried request is not
  applied twice. A key you pass yourself is used instead.
- Responses expose `requestId`, `etag`, `replayed` and `notModified`, and `Exception` carries the
  `requestId`. A 304 answer to `ifNoneMatch` is a normal response with `notModified` set.

### Changed
- A `Retry-After` longer than 60 seconds is not waited out: the 429 is thrown as the error.

### Fixed
- Requests that failed with a 5xx or 429 status were never retried; only network errors were.
  They are now retried with the configured backoff.
- The `User-Agent` header reported version 2.0.0.

## [2.0.1]

### Changed
- Error detection now reads the API `status_code` and `status_message` fields and treats any
  `status_code` (or HTTP status) of 400 or greater as an error, throwing `Exception` with the
  API's `status_message`. Previously the handler only looked for a `success` flag that the v4.0
  API does not send, so server-side errors could pass through undetected.
- `Exception` now carries a `statusCode` property so callers can branch on the specific code.

## [2.0.0]

### Added
- Initial release with v4.0 API support
- TypeScript with strict compilation
- axios HTTP client with axios-retry
- Automatic retries on network errors, 5xx errors, and 429 rate limits
- `Retry-After` header support on 429 responses — retry delay respects the server-specified wait time
- Exponential backoff retry logic (1s, 2s, 4s delays)
- 30 second request timeout
- RBL monitoring endpoints (hosts, profiles, sources, check, listings)
- Contact management endpoints (contacts, groups)
- Certificate monitoring endpoints (monitors, profiles, errors)
- Pagination support for list endpoints
- Configuration options for timeout and retry settings
- `ApiResponse` wrapper class preserving direct property access with `rateLimitInfo` property
- `RateLimitInfo` interface exposing `limit`, `remaining`, and `reset` from IETF draft rate limit headers
- Webhook signature verification with HMAC-SHA256 and constant-time comparison
- Credential validation (account SID and auth token format)
- Comprehensive test suite with Jest
- Comprehensive examples
- Code coverage reporting
- Security policy documentation
- Node.js 18+ support

### Changed
- Switched to plural-only endpoint naming convention
- Simplified exception handling with single Exception class

### Security
- Added User-Agent header for API analytics
- Implemented secure credential validation
