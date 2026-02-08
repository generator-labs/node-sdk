/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { Exception } from './exception';

/**
 * Default tolerance in seconds for timestamp validation (5 minutes).
 */
const DEFAULT_TOLERANCE = 300;

/**
 * Webhook signature verification utility.
 *
 * Verifies that incoming webhook requests were sent by Generator Labs
 * using HMAC-SHA256 signatures.
 */
export class Webhook {
  /**
   * Verify a webhook signature and return the decoded payload.
   *
   * @param body - The raw request body string
   * @param header - The X-Webhook-Signature header value
   * @param secret - Your webhook's signing secret
   * @param tolerance - Maximum age in seconds (0 to disable, default: 300)
   * @returns The decoded JSON payload
   * @throws Exception if verification fails
   */
  static verify(body: string, header: string, secret: string, tolerance: number = DEFAULT_TOLERANCE): Record<string, unknown> {
    if (!header) {
      throw new Exception('Missing X-Webhook-Signature header.');
    }

    // Parse the header: t=timestamp,v1=signature
    const parts: Record<string, string> = {};
    for (const part of header.split(',')) {
      const [key, ...rest] = part.split('=');
      parts[key] = rest.join('=');
    }

    if (!parts.t || !parts.v1) {
      throw new Exception('Invalid X-Webhook-Signature header format.');
    }

    // Check timestamp tolerance
    if (tolerance > 0 && Math.abs(Math.floor(Date.now() / 1000) - parseInt(parts.t, 10)) > tolerance) {
      throw new Exception('Webhook timestamp is outside the tolerance window.');
    }

    // Compute and compare the signature
    const expected = createHmac('sha256', secret).update(`${parts.t}.${body}`).digest('hex');

    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))) {
      throw new Exception('Webhook signature verification failed.');
    }

    // Decode and return the payload
    return JSON.parse(body);
  }
}
