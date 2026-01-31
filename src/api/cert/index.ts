/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler } from '../request-handler';
import { Errors } from './errors';
import { Monitors } from './monitors';
import { Profiles } from './profiles';

/**
 * Certificate monitoring namespace
 */
export class Cert {
  private _errors?: Errors;
  private _monitors?: Monitors;
  private _profiles?: Profiles;

  constructor(private handler: RequestHandler) {}

  /**
   * Get the Errors endpoint
   */
  get errors(): Errors {
    if (!this._errors) {
      this._errors = new Errors(this.handler);
    }
    return this._errors;
  }

  /**
   * Get the Monitors endpoint
   */
  get monitors(): Monitors {
    if (!this._monitors) {
      this._monitors = new Monitors(this.handler);
    }
    return this._monitors;
  }

  /**
   * Get the Profiles endpoint
   */
  get profiles(): Profiles {
    if (!this._profiles) {
      this._profiles = new Profiles(this.handler);
    }
    return this._profiles;
  }
}

export { Errors, Monitors, Profiles };
