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
 * Manage certificate monitoring profiles
 */
export class Profiles extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get profiles or a single profile
   */
  async get(idOrParams?: string | Record<string, any>): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single profile
      return this.handler.get(`cert/profiles/${idOrParams}`);
    } else {
      // List profiles
      return this.handler.get('cert/profiles', idOrParams);
    }
  }

  /**
   * Create a new certificate monitoring profile
   */
  async create(params: Record<string, any>): Promise<any> {
    return this.handler.post('cert/profiles', params);
  }

  /**
   * Update an existing profile
   */
  async update(profileId: string, params: Record<string, any>): Promise<any> {
    return this.handler.put(`cert/profiles/${profileId}`, params);
  }

  /**
   * Delete a profile
   */
  async delete(profileId: string): Promise<any> {
    return this.handler.delete(`cert/profiles/${profileId}`);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'profiles';
  }
}
