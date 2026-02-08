/**
 * Example: Verifying webhook signatures
 *
 * This example shows how to verify incoming webhook requests from Generator Labs
 * using the SDK's built-in signature verification helper.
 */

import { Webhook, Exception } from '../src';
import { createServer, IncomingMessage, ServerResponse } from 'http';

/**
 * Your webhook's signing secret, available in the Edit Webhook panel of the Portal.
 * Store this securely (e.g., environment variable), never hard-code it.
 */
const signingSecret = process.env.GENERATOR_LABS_WEBHOOK_SECRET;

if (!signingSecret) {
  console.error('Error: Set GENERATOR_LABS_WEBHOOK_SECRET environment variable');
  process.exit(1);
}

/**
 * Helper to read the raw request body as a string.
 */
function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * Example webhook endpoint using Node's built-in http server.
 */
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  const header = req.headers['x-webhook-signature'] as string || '';
  const body = await getRawBody(req);

  /**
   * Example 1: Basic verification
   *
   * Verify the signature with the default 5-minute tolerance window.
   * On success, returns the decoded JSON payload.
   * Throws an Exception if verification fails.
   */
  try {
    const payload = Webhook.verify(body, header, signingSecret!);

    console.log('Webhook verified successfully!');
    console.log('Event:', payload.event || 'unknown');

    // Process the event
    switch (payload.event) {
      case 'rbl.host.listed':
        // Handle host listed event
        break;
      case 'rbl.host.delisted':
        // Handle host delisted event
        break;
      case 'billing.balance.alert':
        // Handle low balance alert
        break;
      default:
        // Unknown event type
        break;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));

  } catch (error) {
    if (error instanceof Exception) {
      console.error('Verification failed:', error.message);
    }
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid signature' }));
  }
});

/**
 * Example 2: Custom tolerance
 *
 * Set a custom tolerance window (in seconds) for timestamp validation.
 * Use 0 to disable timestamp checking entirely.
 */
function verifyWithCustomTolerance(body: string, header: string): void {
  try {
    // 10-minute tolerance
    const payload = Webhook.verify(body, header, signingSecret!, 600);
    console.log('Verified with custom tolerance:', payload);
  } catch (error) {
    console.error('Verification failed');
  }
}

server.listen(3000, () => {
  console.log('Webhook endpoint listening on http://localhost:3000');
});
