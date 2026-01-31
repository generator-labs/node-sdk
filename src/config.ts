/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Configuration options for the Generator Labs API client
 */
export interface ClientConfig {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Backoff multiplier for retries (default: 1) */
  retryBackoff?: number;

  /** Custom API base URL (default: https://api.generatorlabs.com/4.0/) */
  baseUrl?: string;
}

/**
 * Default configuration values
 */
export const defaultConfig: Required<ClientConfig> = {
  timeout: 30000,
  maxRetries: 3,
  retryBackoff: 1,
  baseUrl: 'https://api.generatorlabs.com/4.0/'
};
