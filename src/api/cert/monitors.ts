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
 * Manage certificate monitors
 */
export class Monitors extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get monitors or a single monitor
   */
  async get(idOrParams?: string | Record<string, any>, options?: RequestOptions): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single monitor
      return this.handler.get(`cert/monitors/${idOrParams}`, undefined, options);
    } else {
      // List monitors
      return this.handler.get('cert/monitors', idOrParams, options);
    }
  }

  /**
   * Create a new certificate monitor
   */
  async create(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('cert/monitors', params, options, true);
  }

  /**
   * Update an existing monitor
   */
  async update(monitorId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.put(`cert/monitors/${monitorId}`, params, options);
  }

  /**
   * Delete a monitor
   */
  async delete(monitorId: string, options?: RequestOptions): Promise<any> {
    return this.handler.delete(`cert/monitors/${monitorId}`, options, true);
  }

  /**
   * Pause monitoring for a certificate
   */
  async pause(monitorId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`cert/monitors/${monitorId}/pause`, undefined, options);
  }

  /**
   * Resume monitoring for a certificate
   */
  async resume(monitorId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`cert/monitors/${monitorId}/resume`, undefined, options);
  }

  /**
   * Queue a check of a certificate monitor now
   */
  async check(monitorId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`cert/monitors/${monitorId}/check`, undefined, options, true);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'monitors';
  }
}
