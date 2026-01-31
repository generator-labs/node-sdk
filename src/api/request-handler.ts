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

/**
 * HTTP request handler for the Generator Labs API
 */
export class RequestHandler {
  private axiosInstance: AxiosInstance;

  constructor(
    accountSid: string,
    authToken: string,
    apiUrl: string
  ) {
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
      timeout: 30000, // 30 second request timeout
      validateStatus: () => true // Handle all status codes ourselves
    });

    // Configure retry logic with exponential backoff
    axiosRetry(this.axiosInstance, {
      retries: 3, // Maximum number of retries
      retryDelay: (retryCount) => {
        // Exponential backoff: 1000ms, 2000ms, 4000ms
        return 1000 * Math.pow(2, retryCount - 1);
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
  ): Promise<any> {
    const url = `${path}.json`;

    try {
      let response: AxiosResponse;

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

      return response.data;
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
  async get(path: string, params?: Record<string, any>): Promise<any> {
    return this.makeRequest('GET', path, params);
  }

  /**
   * Make a POST request
   */
  async post(path: string, params?: Record<string, any>): Promise<any> {
    return this.makeRequest('POST', path, params);
  }

  /**
   * Make a PUT request
   */
  async put(path: string, params?: Record<string, any>): Promise<any> {
    return this.makeRequest('PUT', path, params);
  }

  /**
   * Make a DELETE request
   */
  async delete(path: string): Promise<any> {
    return this.makeRequest('DELETE', path);
  }
}
