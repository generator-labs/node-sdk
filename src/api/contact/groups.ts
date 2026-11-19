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
 * Manage contact groups
 */
export class Groups extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get groups or a single group
   */
  async get(idOrParams?: string | Record<string, any>, options?: RequestOptions): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single group
      return this.handler.get(`contact/groups/${idOrParams}`, undefined, options);
    } else {
      // List groups
      return this.handler.get('contact/groups', idOrParams, options);
    }
  }

  /**
   * Create a new contact group
   */
  async create(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('contact/groups', params, options, true);
  }

  /**
   * Update an existing group
   */
  async update(groupId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.put(`contact/groups/${groupId}`, params, options);
  }

  /**
   * Delete a group
   */
  async delete(groupId: string, options?: RequestOptions): Promise<any> {
    return this.handler.delete(`contact/groups/${groupId}`, options);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'groups';
  }
}
