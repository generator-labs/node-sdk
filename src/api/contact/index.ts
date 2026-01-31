/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler } from '../request-handler';
import { Contacts } from './contacts';
import { Groups } from './groups';

/**
 * Contact management namespace
 */
export class Contact {
  private _contacts?: Contacts;
  private _groups?: Groups;

  constructor(private handler: RequestHandler) {}

  /**
   * Get the Contacts endpoint
   */
  get contacts(): Contacts {
    if (!this._contacts) {
      this._contacts = new Contacts(this.handler);
    }
    return this._contacts;
  }

  /**
   * Get the Groups endpoint
   */
  get groups(): Groups {
    if (!this._groups) {
      this._groups = new Groups(this.handler);
    }
    return this._groups;
  }
}

export { Contacts, Groups };
