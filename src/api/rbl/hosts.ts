/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler, RequestOptions } from '../request-handler';
import { PaginationMixin } from '../pagination';

/**
 * Manage RBL monitored hosts
 */
export class Hosts extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get hosts or a single host
   */
  async get(idOrParams?: string | Record<string, any>, options?: RequestOptions): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single host
      return this.handler.get(`rbl/hosts/${idOrParams}`, undefined, options);
    } else {
      // List hosts
      return this.handler.get('rbl/hosts', idOrParams, options);
    }
  }

  /**
   * Create a new monitored host
   */
  async create(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('rbl/hosts', params, options, true);
  }

  /**
   * Update an existing host
   */
  async update(hostId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.put(`rbl/hosts/${hostId}`, params, options);
  }

  /**
   * Delete a host
   */
  async delete(hostId: string, options?: RequestOptions): Promise<any> {
    return this.handler.delete(`rbl/hosts/${hostId}`, options);
  }

  /**
   * Pause monitoring for a host
   */
  async pause(hostId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`rbl/hosts/${hostId}/pause`, undefined, options);
  }

  /**
   * Resume monitoring for a host
   */
  async resume(hostId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`rbl/hosts/${hostId}/resume`, undefined, options);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'hosts';
  }
}
