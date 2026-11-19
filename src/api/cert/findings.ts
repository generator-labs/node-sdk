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
 * List, dismiss and restore certificate findings
 */
export class Findings extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get the current findings on the active certificate monitors
   */
  async get(params?: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.get('cert/findings', params, options);
  }

  /**
   * Dismiss findings (finding_id, monitors); without monitors, from every active monitor
   * that has the finding
   */
  async dismiss(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('cert/findings/dismiss', params, options);
  }

  /**
   * Restore dismissed findings (finding_id, monitors); without monitors, on every monitor
   * the finding is dismissed from
   */
  async restore(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('cert/findings/restore', params, options);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'data';
  }
}
