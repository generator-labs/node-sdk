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
  constructor(message: string) {
    super(message);
    this.name = 'GeneratorLabsException';
    Object.setPrototypeOf(this, Exception.prototype);
  }
}
