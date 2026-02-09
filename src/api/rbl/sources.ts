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
 * Manage RBL sources
 */
export class Sources extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get sources or a single source
   */
  async get(idOrParams?: string | Record<string, any>): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single source
      return this.handler.get(`rbl/sources/${idOrParams}`);
    } else {
      // List sources
      return this.handler.get('rbl/sources', idOrParams);
    }
  }

  /**
   * Create a new RBL source
   */
  async create(params: Record<string, any>): Promise<any> {
    return this.handler.post('rbl/sources', params);
  }

  /**
   * Update an existing source
   */
  async update(sourceId: string, params: Record<string, any>): Promise<any> {
    return this.handler.put(`rbl/sources/${sourceId}`, params);
  }

  /**
   * Delete a source
   */
  async delete(sourceId: string): Promise<any> {
    return this.handler.delete(`rbl/sources/${sourceId}`);
  }

  /**
   * Pause a source
   */
  async pause(sourceId: string): Promise<any> {
    return this.handler.post(`rbl/sources/${sourceId}/pause`);
  }

  /**
   * Resume a source
   */
  async resume(sourceId: string): Promise<any> {
    return this.handler.post(`rbl/sources/${sourceId}/resume`);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'sources';
  }
}
