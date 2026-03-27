/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Exception } from '../exception';
import { Client } from '../client';
import { ClientConfig, defaultConfig } from '../config';
import { ApiResponse, RateLimitInfo } from '../response';

/**
 * HTTP request handler for the Generator Labs API
 */
export class RequestHandler {
  private axiosInstance: AxiosInstance;
  private config: Required<ClientConfig>;

  constructor(
    accountSid: string,
    authToken: string,
    apiUrl: string,
    config?: ClientConfig
  ) {
    this.config = { ...defaultConfig, ...config };

    this.axiosInstance = axios.create({
      baseURL: apiUrl,
      auth: {
        username: accountSid,
        password: authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `GeneratorLabs-Node/${Client.VERSION}`,
        'Accept': 'application/json'
      },
      timeout: this.config.timeout,
      validateStatus: () => true // Handle all status codes ourselves
    });

    // Configure retry logic with exponential backoff
    axiosRetry(this.axiosInstance, {
      retries: this.config.maxRetries,
      retryDelay: (retryCount, error) => {
        // Respect Retry-After header from rate limit responses
        const retryAfter = error?.response?.headers?.['retry-after'];
        if (retryAfter) {
          const seconds = parseInt(retryAfter, 10);
          if (!isNaN(seconds) && seconds > 0) {
            return seconds * 1000;
          }
        }

        // Exponential backoff with configurable factor
        return 1000 * this.config.retryBackoff * Math.pow(2, retryCount - 1);
      },
      retryCondition: (error) => {
        // Retry on connection errors
        if (axiosRetry.isNetworkError(error)) {
          return true;
        }

        // Retry on 5xx server errors and 429 rate limit
        if (error.response) {
          const status = error.response.status;
          return status >= 500 || status === 429;
        }

        return false;
      }
    });
  }

  /**
   * Make an HTTP request to the API
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    params?: Record<string, any>
  ): Promise<ApiResponse> {
    const url = `${path}.json`;

    try {
      let response: AxiosResponse;

      // Convert array values to comma-separated strings for form encoding
      if (params) {
        for (const key of Object.keys(params)) {
          if (Array.isArray(params[key])) {
            params[key] = params[key].join(',');
          }
        }
      }

      if (method === 'GET') {
        response = await this.axiosInstance.get(url, { params });
      } else if (method === 'POST') {
        response = await this.axiosInstance.post(url, new URLSearchParams(params).toString());
      } else if (method === 'PUT') {
        response = await this.axiosInstance.put(url, new URLSearchParams(params).toString());
      } else if (method === 'DELETE') {
        response = await this.axiosInstance.delete(url);
      } else {
        throw new Exception(`Unsupported HTTP method: ${method}`);
      }

      // Check for v4.0 API error response format
      if (response.data && typeof response.data === 'object') {
        if (response.data.success === false) {
          const errorMsg = response.data.error?.message || 'Unknown API error';
          throw new Exception(`API error: ${errorMsg}`);
        }
      }

      // Parse rate limit headers
      let rateLimitInfo: RateLimitInfo | null = null;
      const limitHeader = response.headers['ratelimit-limit'];
      if (limitHeader) {
        rateLimitInfo = {
          limit: limitHeader,
          remaining: parseInt(response.headers['ratelimit-remaining'] || '0', 10),
          reset: parseInt(response.headers['ratelimit-reset'] || '0', 10)
        };
      }

      return new ApiResponse(response.data, rateLimitInfo);
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        throw new Exception(`API request failed: ${error.message}`);
      }
      throw new Exception(`Unexpected error: ${error}`);
    }
  }

  /**
   * Make a GET request
   */
  async get(path: string, params?: Record<string, any>): Promise<ApiResponse> {
    return this.makeRequest('GET', path, params);
  }

  /**
   * Make a POST request
   */
  async post(path: string, params?: Record<string, any>): Promise<ApiResponse> {
    return this.makeRequest('POST', path, params);
  }

  /**
   * Make a PUT request
   */
  async put(path: string, params?: Record<string, any>): Promise<ApiResponse> {
    return this.makeRequest('PUT', path, params);
  }

  /**
   * Make a DELETE request
   */
  async delete(path: string): Promise<ApiResponse> {
    return this.makeRequest('DELETE', path);
  }
}
