/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler } from '../request-handler';
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
  async get(idOrParams?: string | Record<string, any>): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single monitor
      return this.handler.get(`cert/monitors/${idOrParams}`);
    } else {
      // List monitors
      return this.handler.get('cert/monitors', idOrParams);
    }
  }

  /**
   * Create a new certificate monitor
   */
  async create(params: Record<string, any>): Promise<any> {
    return this.handler.post('cert/monitors', params);
  }

  /**
   * Update an existing monitor
   */
  async update(monitorId: string, params: Record<string, any>): Promise<any> {
    return this.handler.put(`cert/monitors/${monitorId}`, params);
  }

  /**
   * Delete a monitor
   */
  async delete(monitorId: string): Promise<any> {
    return this.handler.delete(`cert/monitors/${monitorId}`);
  }

  /**
   * Pause monitoring for a certificate
   */
  async pause(monitorId: string): Promise<any> {
    return this.handler.post(`cert/monitors/${monitorId}/pause`);
  }

  /**
   * Resume monitoring for a certificate
   */
  async resume(monitorId: string): Promise<any> {
    return this.handler.post(`cert/monitors/${monitorId}/resume`);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'monitors';
  }
}
