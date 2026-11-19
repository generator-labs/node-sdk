/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { randomUUID } from 'crypto';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Exception } from '../exception';
import { Client } from '../client';
import { ClientConfig, defaultConfig } from '../config';
import { ApiResponse, RateLimitInfo } from '../response';

/**
 * The longest Retry-After (in seconds) that is waited out before a retry. A longer wait is
 * not slept: the response is returned as the error instead.
 */
export const MAX_RETRY_AFTER = 60;

/**
 * Options any request accepts
 */
export interface RequestOptions {
  /**
   * The Idempotency-Key of a request that creates something, or starts a check. A repeat with
   * the same key returns the first answer. One is generated when this is left out.
   */
  idempotencyKey?: string;

  /** The X-Request-Id to send; the API generates one otherwise */
  requestId?: string;

  /** The ETag of an earlier response; the answer is notModified when nothing changed */
  ifNoneMatch?: string;

  /** The keys to keep in each object of the response data (GET requests) */
  fields?: string | string[];
}

/**
 * The Retry-After header of a response in seconds, or 0 without one
 */
function retryAfter(response?: AxiosResponse): number {
  const seconds = parseInt(response?.headers?.['retry-after'], 10);
  return !isNaN(seconds) && seconds > 0 ? seconds : 0;
}

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
      timeout: this.config.timeout
    });

    // Configure retry logic with exponential backoff
    axiosRetry(this.axiosInstance, {
      retries: this.config.maxRetries,
      // Every status below 500 except 429 is an answer; the rest go through retryCondition
      validateResponse: (response) => response.status < 500 && response.status !== 429,
      retryDelay: (retryCount, error) => {
        // Respect Retry-After header from rate limit responses
        const seconds = retryAfter(error?.response);
        if (seconds > 0) {
          return seconds * 1000;
        }

        // Exponential backoff with configurable factor
        return 1000 * this.config.retryBackoff * Math.pow(2, retryCount - 1);
      },
      retryCondition: (error) => {
        // Retry on connection errors
        if (axiosRetry.isNetworkError(error)) {
          return true;
        }

        // Retry on 5xx server errors and 429 rate limit, unless the wait asked for is too long
        if (error.response) {
          return retryAfter(error.response) <= MAX_RETRY_AFTER;
        }

        return false;
      }
    });
  }

  /**
   * Send an HTTP request to the API
   */
  private async send(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    params?: Record<string, any>,
    options: RequestOptions = {},
    idempotent = false,
    plain = false
  ): Promise<AxiosResponse> {
    const url = `${path}.json`;

    // The headers are set once per call, so every retry of the call sends the same
    // Idempotency-Key and the API answers a repeat with the first result
    const headers: Record<string, string> = {};
    if (options.idempotencyKey !== undefined) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    } else if (idempotent) {
      headers['Idempotency-Key'] = randomUUID();
    }
    if (options.requestId !== undefined) {
      headers['X-Request-Id'] = options.requestId;
    }
    if (options.ifNoneMatch !== undefined) {
      headers['If-None-Match'] = options.ifNoneMatch;
    }

    // Field selection applies to GET requests
    if (method === 'GET' && options.fields !== undefined) {
      params = { ...params, fields: options.fields };
    }

    // Convert array values to comma-separated strings for form encoding
    if (params) {
      for (const key of Object.keys(params)) {
        if (Array.isArray(params[key])) {
          params[key] = params[key].join(',');
        }
      }
    }

    const config: AxiosRequestConfig = { headers };
    if (plain) {
      config.responseType = 'text';
    }

    try {
      if (method === 'GET') {
        return await this.axiosInstance.get(url, { ...config, params });
      } else if (method === 'POST') {
        return await this.axiosInstance.post(url, new URLSearchParams(params).toString(), config);
      } else if (method === 'PUT') {
        return await this.axiosInstance.put(url, new URLSearchParams(params).toString(), config);
      } else if (method === 'DELETE') {
        return await this.axiosInstance.delete(url, config);
      } else {
        throw new Exception(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        // A 5xx or 429 that was not retried, or whose retries ran out, is handled as a response
        if (error.response) {
          return error.response;
        }
        throw new Exception(`API request failed: ${error.message}`);
      }
      throw new Exception(`Unexpected error: ${error}`);
    }
  }

  /**
   * Make an HTTP request to the API
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions,
    idempotent = false
  ): Promise<ApiResponse> {
    const response = await this.send(method, path, params, options, idempotent);
    const requestId: string | null = response.headers['x-request-id'] || null;

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

    // 304 Not Modified has no body: the copy the caller's ETag came from is still current
    if (response.status === 304) {
      return new ApiResponse({}, rateLimitInfo, {
        requestId,
        etag: response.headers['etag'] || null,
        notModified: true
      });
    }

    // Determine success vs failure from the API status_code (which mirrors the HTTP status).
    if (response.data && typeof response.data === 'object') {
      const code =
        typeof response.data.status_code === 'number'
          ? response.data.status_code
          : response.status;
      if (code >= 400 || response.status >= 400) {
        const errorMsg = response.data.status_message || `HTTP ${response.status} error`;
        throw new Exception(`API error: ${errorMsg}`, code, requestId);
      }
    } else if (response.status >= 400) {
      throw new Exception(`HTTP ${response.status} error`, response.status, requestId);
    }

    return new ApiResponse(response.data, rateLimitInfo, {
      requestId,
      etag: response.headers['etag'] || null,
      replayed: response.headers['idempotent-replayed'] === 'true'
    });
  }

  /**
   * Make a GET request
   */
  async get(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse> {
    return this.makeRequest('GET', path, params, options);
  }

  /**
   * Make a GET request to an endpoint that answers in plain text, and return the body
   */
  async getPlain(path: string, options?: RequestOptions): Promise<string> {
    const response = await this.send('GET', path, undefined, options, false, true);

    if (response.status >= 400) {
      throw new Exception(
        `HTTP ${response.status} error`,
        response.status,
        response.headers['x-request-id'] || null
      );
    }

    return String(response.data).trim();
  }

  /**
   * Make a POST request; idempotent is set for an endpoint that accepts an Idempotency-Key
   */
  async post(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions,
    idempotent = false
  ): Promise<ApiResponse> {
    return this.makeRequest('POST', path, params, options, idempotent);
  }

  /**
   * Make a PUT request
   */
  async put(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse> {
    return this.makeRequest('PUT', path, params, options);
  }

  /**
   * Make a DELETE request; idempotent is set for an endpoint that accepts an Idempotency-Key
   */
  async delete(path: string, options?: RequestOptions, idempotent = false): Promise<ApiResponse> {
    return this.makeRequest('DELETE', path, undefined, options, idempotent);
  }
}
