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
 * Get current RBL listings
 */
export class Listings extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get current RBL listings
   */
  async get(params?: Record<string, any>): Promise<any> {
    return this.handler.get('rbl/listings', params);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'listings';
  }
}
