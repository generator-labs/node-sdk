/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Exception } from '../exception';

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
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      validateStatus: () => true // Handle all status codes ourselves
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
