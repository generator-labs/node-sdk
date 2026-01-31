/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from './exception';
import { RequestHandler } from './api/request-handler';
import { RBL } from './api/rbl';
import { Contact } from './api/contact';
import { Cert } from './api/cert';
import { ClientConfig, defaultConfig } from './config';

/**
 * Generator Labs API client
 */
export class Client {
  static readonly VERSION = '2.0.0';

  private handler: RequestHandler;
  private _rbl?: RBL;
  private _contact?: Contact;
  private _cert?: Cert;
  public readonly config: Required<ClientConfig>;

  /**
   * Initialize the Generator Labs client
   */
  constructor(
    public readonly accountSid: string,
    public readonly authToken: string,
    config?: ClientConfig
  ) {
    // Validate account SID
    if (!/^[A-Z]{2}[0-9a-fA-F]{32}$/.test(accountSid)) {
      throw new Exception(`Invalid account SID format: ${accountSid}`);
    }

    // Validate auth token
    if (!/^[0-9a-fA-F]{64}$/.test(authToken)) {
      throw new Exception(`Invalid auth token format: ${authToken}`);
    }

    // Merge config with defaults
    this.config = { ...defaultConfig, ...config };

    // Initialize request handler
    this.handler = new RequestHandler(
      accountSid,
      authToken,
      this.config.baseURL,
      this.config
    );
  }

  /**
   * Get the RBL monitoring API namespace
   */
  get rbl(): RBL {
    if (!this._rbl) {
      this._rbl = new RBL(this.handler);
    }
    return this._rbl;
  }

  /**
   * Get the Contact management API namespace
   */
  get contact(): Contact {
    if (!this._contact) {
      this._contact = new Contact(this.handler);
    }
    return this._contact;
  }

  /**
   * Get the Certificate monitoring API namespace
   */
  get cert(): Cert {
    if (!this._cert) {
      this._cert = new Cert(this.handler);
    }
    return this._cert;
  }
}
