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
 * Perform manual RBL checks
 */
export class Check {
  constructor(private handler: RequestHandler) {}

  /**
   * Start a manual RBL check
   */
  async start(params: Record<string, any>): Promise<any> {
    return this.handler.post('rbl/check/start', params);
  }

  /**
   * Get the status of a manual check
   */
  async status(checkId: string, params?: Record<string, any>): Promise<any> {
    return this.handler.get(`rbl/check/status/${checkId}`, params);
  }
}
