/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Rate limit information from API response headers.
 */
export interface RateLimitInfo {
  /** Active rate limit policies, e.g. "1000;w=3600, 100;w=1" */
  limit: string;
  /** Requests remaining in the most restrictive active window */
  remaining: number;
  /** Seconds until the most restrictive window resets */
  reset: number;
}

/**
 * API response wrapper that preserves direct property access to response data
 * while also exposing rate limit information.
 *
 * All properties from the API JSON response are copied directly onto this object,
 * so existing access patterns (e.g., response.data, response.success) work unchanged.
 */
export class ApiResponse {
  /** Rate limit information from response headers, or null if not present */
  readonly rateLimitInfo: RateLimitInfo | null;
  [key: string]: any;

  constructor(data: Record<string, any>, rateLimitInfo: RateLimitInfo | null) {
    Object.assign(this, data);
    this.rateLimitInfo = rateLimitInfo;
  }
}
