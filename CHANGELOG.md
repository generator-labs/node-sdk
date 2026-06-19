# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
