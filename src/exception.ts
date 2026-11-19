/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Base exception class for all Generator Labs SDK errors
 */
export class Exception extends Error {
  public readonly statusCode?: number;
  /** The X-Request-Id of the failed request; quote it when contacting support */
  public readonly requestId?: string | null;

  constructor(message: string, statusCode?: number, requestId?: string | null) {
    super(message);
    this.name = 'GeneratorLabsException';
    this.statusCode = statusCode;
    this.requestId = requestId;
    Object.setPrototypeOf(this, Exception.prototype);
  }
}
