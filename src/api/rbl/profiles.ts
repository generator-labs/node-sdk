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
 * Manage RBL monitoring profiles
 */
export class Profiles extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get profiles or a single profile
   */
  async get(idOrParams?: string | Record<string, any>, options?: RequestOptions): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single profile
      return this.handler.get(`rbl/profiles/${idOrParams}`, undefined, options);
    } else {
      // List profiles
      return this.handler.get('rbl/profiles', idOrParams, options);
    }
  }

  /**
   * Create a new monitoring profile
   */
  async create(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('rbl/profiles', params, options, true);
  }

  /**
   * Update an existing profile
   */
  async update(profileId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.put(`rbl/profiles/${profileId}`, params, options);
  }

  /**
   * Delete a profile
   */
  async delete(profileId: string, options?: RequestOptions): Promise<any> {
    return this.handler.delete(`rbl/profiles/${profileId}`, options);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'profiles';
  }
}
