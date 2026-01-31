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
 * Manage contact groups
 */
export class Groups {
  constructor(private handler: RequestHandler) {}

  /**
   * Get groups or a single group
   */
  async get(idOrParams?: string | Record<string, any>): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single group
      return this.handler.get(`contact/groups/${idOrParams}`);
    } else {
      // List groups
      return this.handler.get('contact/groups', idOrParams);
    }
  }

  /**
   * Create a new contact group
   */
  async create(params: Record<string, any>): Promise<any> {
    return this.handler.post('contact/groups', params);
  }

  /**
   * Update an existing group
   */
  async update(groupId: string, params: Record<string, any>): Promise<any> {
    return this.handler.put(`contact/groups/${groupId}`, params);
  }

  /**
   * Delete a group
   */
  async delete(groupId: string): Promise<any> {
    return this.handler.delete(`contact/groups/${groupId}`);
  }
}
