/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler, RequestOptions } from './request-handler';

/**
 * Account namespace: the account, its balance, its usage and its scheduled checks
 */
export class Account {
  constructor(private handler: RequestHandler) {}

  /**
   * Get the account: its balance, whether its checks are running, and plan usage
   */
  async get(options?: RequestOptions): Promise<any> {
    return this.handler.get('account', undefined, options);
  }

  /**
   * Get the account balance
   */
  async balance(options?: RequestOptions): Promise<number> {
    return parseFloat(await this.handler.getPlain('account/balance', options));
  }

  /**
   * Get the account's usage by month (months)
   */
  async usage(params?: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.get('account/usage', params, options);
  }

  /**
   * Pause the account's scheduled checks
   */
  async pauseChecks(options?: RequestOptions): Promise<any> {
    return this.handler.post('account/checks/pause', undefined, options);
  }

  /**
   * Resume the account's scheduled checks
   */
  async resumeChecks(options?: RequestOptions): Promise<any> {
    return this.handler.post('account/checks/resume', undefined, options);
  }
}
