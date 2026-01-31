/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler } from '../request-handler';

/**
 * Manage RBL monitored hosts
 */
export class Hosts {
  constructor(private handler: RequestHandler) {}

  /**
   * Get hosts or a single host
   */
  async get(idOrParams?: string | Record<string, any>): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single host
      return this.handler.get(`rbl/hosts/${idOrParams}`);
    } else {
      // List hosts
      return this.handler.get('rbl/hosts', idOrParams);
    }
  }

  /**
   * Create a new monitored host
   */
  async create(params: Record<string, any>): Promise<any> {
    return this.handler.post('rbl/hosts', params);
  }

  /**
   * Update an existing host
   */
  async update(hostId: string, params: Record<string, any>): Promise<any> {
    return this.handler.put(`rbl/hosts/${hostId}`, params);
  }

  /**
   * Delete a host
   */
  async delete(hostId: string): Promise<any> {
    return this.handler.delete(`rbl/hosts/${hostId}`);
  }

  /**
   * Pause monitoring for a host
   */
  async pause(hostId: string): Promise<any> {
    return this.handler.post(`rbl/hosts/${hostId}/pause`);
  }

  /**
   * Resume monitoring for a host
   */
  async resume(hostId: string): Promise<any> {
    return this.handler.post(`rbl/hosts/${hostId}/resume`);
  }
}
