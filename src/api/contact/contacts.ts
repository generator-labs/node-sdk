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
 * Manage notification contacts
 */
export class Contacts extends PaginationMixin {
  constructor(private handler: RequestHandler) {
    super();
  }

  /**
   * Get contacts or a single contact
   */
  async get(idOrParams?: string | Record<string, any>, options?: RequestOptions): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single contact
      return this.handler.get(`contact/contacts/${idOrParams}`, undefined, options);
    } else {
      // List contacts
      return this.handler.get('contact/contacts', idOrParams, options);
    }
  }

  /**
   * Create a new contact
   */
  async create(params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post('contact/contacts', params, options, true);
  }

  /**
   * Update an existing contact
   */
  async update(contactId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.put(`contact/contacts/${contactId}`, params, options);
  }

  /**
   * Delete a contact
   */
  async delete(contactId: string, options?: RequestOptions): Promise<any> {
    return this.handler.delete(`contact/contacts/${contactId}`, options);
  }

  /**
   * Pause a contact
   */
  async pause(contactId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/pause`, undefined, options);
  }

  /**
   * Resume a contact
   */
  async resume(contactId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/resume`, undefined, options);
  }

  /**
   * Confirm a contact with an auth code
   */
  async confirm(contactId: string, params: Record<string, any>, options?: RequestOptions): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/confirm`, params, options, true);
  }

  /**
   * Resend confirmation to a contact
   */
  async resend(contactId: string, options?: RequestOptions): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/resend`, undefined, options, true);
  }

  /**
   * Get the resource name for pagination
   */
  protected getResourceName(): string {
    return 'contacts';
  }
}
