/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RequestHandler } from '../request-handler';
import { Hosts } from './hosts';
import { Check } from './check';
import { Listings } from './listings';
import { Profiles } from './profiles';
import { Sources } from './sources';

/**
 * RBL monitoring namespace
 */
export class RBL {
  private _hosts?: Hosts;
  private _check?: Check;
  private _listings?: Listings;
  private _profiles?: Profiles;
  private _sources?: Sources;

  constructor(private handler: RequestHandler) {}

  /**
   * Get the Hosts endpoint
   */
  get hosts(): Hosts {
    if (!this._hosts) {
      this._hosts = new Hosts(this.handler);
    }
    return this._hosts;
  }

  /**
   * Get the Check endpoint
   */
  get check(): Check {
    if (!this._check) {
      this._check = new Check(this.handler);
    }
    return this._check;
  }

  /**
   * Get the Listings endpoint
   */
  get listings(): Listings {
    if (!this._listings) {
      this._listings = new Listings(this.handler);
    }
    return this._listings;
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

  /**
   * Get the Sources endpoint
   */
  get sources(): Sources {
    if (!this._sources) {
      this._sources = new Sources(this.handler);
    }
    return this._sources;
  }
}

export { Hosts, Check, Listings, Profiles, Sources };
