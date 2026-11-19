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
 * Manage RBL sources
 */
export class Sources extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get sources or a single source
   */
  async get(idOrParams?: string | Record<string, any>, options?: RequestOptions): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single source
      return this.handler.get(`rbl/sources/${idOrParams}`, undefined, options);
    } else {
      // List sources
      return this.handler.get('rbl/sources', idOrParams, options);
    }
  }

  /**
   * Create a new RBL source
   */
  async create(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('rbl/sources', params, options, true);
  }

  /**
   * Update an existing source
   */
  async update(sourceId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.put(`rbl/sources/${sourceId}`, params, options);
  }

  /**
   * Delete a source
   */
  async delete(sourceId: string, options?: RequestOptions): Promise<any> {
    return this.handler.delete(`rbl/sources/${sourceId}`, options);
  }

  /**
   * Pause a source
   */
  async pause(sourceId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`rbl/sources/${sourceId}/pause`, undefined, options);
  }

  /**
   * Resume a source
   */
  async resume(sourceId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`rbl/sources/${sourceId}/resume`, undefined, options);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'sources';
  }
}
