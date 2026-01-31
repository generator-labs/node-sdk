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
 * Manage notification contacts
 */
export class Contacts {
  constructor(private handler: RequestHandler) {}

  /**
   * Get contacts or a single contact
   */
  async get(idOrParams?: string | Record<string, any>): Promise<any> {
    if (typeof idOrParams === 'string') {
      // Get single contact
      return this.handler.get(`contact/contacts/${idOrParams}`);
    } else {
      // List contacts
      return this.handler.get('contact/contacts', idOrParams);
    }
  }

  /**
   * Create a new contact
   */
  async create(params: Record<string, any>): Promise<any> {
    return this.handler.post('contact/contacts', params);
  }

  /**
   * Update an existing contact
   */
  async update(contactId: string, params: Record<string, any>): Promise<any> {
    return this.handler.put(`contact/contacts/${contactId}`, params);
  }

  /**
   * Delete a contact
   */
  async delete(contactId: string): Promise<any> {
    return this.handler.delete(`contact/contacts/${contactId}`);
  }

  /**
   * Pause a contact
   */
  async pause(contactId: string): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/pause`);
  }

  /**
   * Resume a contact
   */
  async resume(contactId: string): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/resume`);
  }

  /**
   * Confirm a contact with an auth code
   */
  async confirm(contactId: string, params: Record<string, any>): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/confirm`, params);
  }

  /**
   * Resend confirmation to a contact
   */
  async resend(contactId: string): Promise<any> {
    return this.handler.post(`contact/contacts/${contactId}/resend`);
  }
}
