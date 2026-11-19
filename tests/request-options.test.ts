/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as http from 'http';
import { Client } from '../src/client';
import { Exception } from '../src/exception';

interface Recorded {
  method: string;
  path: string;
  query: Record<string, string>;
  body: Record<string, string>;
  headers: http.IncomingHttpHeaders;
}

interface Reply {
  status?: number;
  headers?: Record<string, string>;
  body?: object | string;
}

const OK = { status_code: 200, status_message: 'OK' };

/**
 * A local API that records each request and answers with the queued replies
 */
class ApiServer {
  requests: Recorded[] = [];
  replies: Reply[] = [];
  private server!: http.Server;

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const url = new URL(req.url || '', 'http://localhost');
          this.requests.push({
            method: req.method || '',
            path: url.pathname,
            query: Object.fromEntries(url.searchParams),
            body: Object.fromEntries(new URLSearchParams(body)),
            headers: req.headers
          });

          const reply = this.replies.shift() || {};
          const content = reply.body === undefined ? OK : reply.body;
          res.writeHead(reply.status || 200, { 'Content-Type': 'application/json', ...reply.headers });
          res.end(typeof content === 'string' ? content : JSON.stringify(content));
        });
      });
      this.server.listen(0, () => resolve());
    });
  }

  stop(): void {
    this.server.close();
  }

  reply(reply: Reply): void {
    this.replies.push(reply);
  }

  client(): Client {
    return new Client('AC' + 'a'.repeat(32), 'b'.repeat(64), {
      baseUrl: `http://localhost:${(this.server.address() as any).port}/4.0/`,
      retryBackoff: 0.001
    });
  }
}

async function expectError(promise: Promise<any>): Promise<Exception> {
  let caught: unknown;
  try {
    await promise;
  } catch (e) {
    caught = e;
  }

  expect(caught).toBeInstanceOf(Exception);
  return caught as Exception;
}

describe('request options', () => {
  let api: ApiServer;

  beforeEach(async () => {
    api = new ApiServer();
    await api.start();
  });

  afterEach(() => {
    api.stop();
  });

  describe('Idempotency-Key', () => {
    it('sends the same key on every retry', async () => {
      api.reply({ status: 500, body: { status_code: 500, status_message: 'Server error.' } });
      api.reply({});

      await api.client().rbl.hosts.create({ name: 'Test', host: '192.0.2.1' });

      expect(api.requests).toHaveLength(2);
      const key = api.requests[0].headers['idempotency-key'];
      expect(key).toHaveLength(36);
      expect(api.requests[1].headers['idempotency-key']).toBe(key);
    });

    it('sends a new key for each call', async () => {
      const client = api.client();
      await client.rbl.hosts.create({ name: 'One', host: '192.0.2.1' });
      await client.rbl.hosts.create({ name: 'Two', host: '192.0.2.2' });

      expect(api.requests[0].headers['idempotency-key']).not.toBe(
        api.requests[1].headers['idempotency-key']
      );
    });

    it('sends the key the caller gave', async () => {
      await api.client().rbl.check.start({ host: '192.0.2.1' }, { idempotencyKey: 'my-key' });

      expect(api.requests[0].headers['idempotency-key']).toBe('my-key');
    });

    it('sends a key on the endpoints that accept one', async () => {
      const client = api.client();
      await client.contact.contacts.resend('COx');
      await client.contact.contacts.confirm('COx', { authcode: '1234' });
      await client.cert.monitors.delete('CMx');
      await client.cert.monitors.check('CMx');

      for (const request of api.requests) {
        expect(request.headers['idempotency-key']).toBeDefined();
      }
    });

    it('sends no key on other writes', async () => {
      const client = api.client();
      await client.rbl.hosts.update('HTx', { name: 'Test' });
      await client.rbl.hosts.pause('HTx');
      await client.rbl.hosts.delete('HTx');

      for (const request of api.requests) {
        expect(request.headers['idempotency-key']).toBeUndefined();
      }
    });

    it('reports a replayed answer', async () => {
      api.reply({ headers: { 'Idempotent-Replayed': 'true' } });
      api.reply({});
      const client = api.client();

      expect((await client.rbl.hosts.create({ name: 'Test' })).replayed).toBe(true);
      expect((await client.rbl.hosts.create({ name: 'Test' })).replayed).toBe(false);
    });
  });

  describe('request ids, conditional requests and field selection', () => {
    it('sends and returns the request id', async () => {
      api.reply({ headers: { 'X-Request-Id': 'req-1' } });

      const response = await api.client().rbl.hosts.get(undefined, { requestId: 'req-1' });

      expect(api.requests[0].headers['x-request-id']).toBe('req-1');
      expect(response.requestId).toBe('req-1');
    });

    it('carries the request id on an error', async () => {
      api.reply({
        status: 404,
        headers: { 'X-Request-Id': 'req-2' },
        body: { status_code: 404, status_message: 'Not found.' }
      });

      const err = await expectError(api.client().rbl.hosts.get('HTx'));

      expect(err.statusCode).toBe(404);
      expect(err.requestId).toBe('req-2');
    });

    it('returns the ETag and reports 304 as notModified', async () => {
      api.reply({ headers: { ETag: 'W/"abc"' }, body: { ...OK, data: [] } });
      api.reply({ status: 304, headers: { ETag: 'W/"abc"' }, body: '' });
      const client = api.client();

      const first = await client.rbl.hosts.get();
      const second = await client.rbl.hosts.get(undefined, { ifNoneMatch: first.etag });

      expect(first.etag).toBe('W/"abc"');
      expect(first.notModified).toBe(false);
      expect(api.requests[1].headers['if-none-match']).toBe('W/"abc"');
      expect(second.notModified).toBe(true);
      expect(second.data).toBeUndefined();
    });

    it('selects fields on a single get', async () => {
      await api.client().rbl.hosts.get('HTx', { fields: ['id', 'host'] });

      expect(api.requests[0].path).toBe('/4.0/rbl/hosts/HTx.json');
      expect(api.requests[0].query).toEqual({ fields: 'id,host' });
    });

    it('selects fields on a list', async () => {
      await api.client().rbl.hosts.get({ page: 2 }, { fields: 'id,host' });

      expect(api.requests[0].query).toEqual({ page: '2', fields: 'id,host' });
    });
  });

  describe('retries', () => {
    it('retries a 429 with a short Retry-After', async () => {
      api.reply({
        status: 429,
        headers: { 'Retry-After': '1' },
        body: { status_code: 429, status_message: 'Slow down.' }
      });
      api.reply({});

      await api.client().rbl.hosts.get();

      expect(api.requests).toHaveLength(2);
    });

    it('returns a 429 with a long Retry-After as the error', async () => {
      api.reply({
        status: 429,
        headers: { 'Retry-After': '3600' },
        body: { status_code: 429, status_message: 'Slow down.' }
      });

      const err = await expectError(api.client().cert.monitors.check('CMx'));

      expect(err.statusCode).toBe(429);
      expect(err.message).toContain('Slow down.');
      expect(api.requests).toHaveLength(1);
    });

    it('throws the API error once the retries of a 500 run out', async () => {
      for (let i = 0; i < 4; i++) {
        api.reply({ status: 500, body: { status_code: 500, status_message: 'Server error.' } });
      }

      const err = await expectError(api.client().rbl.hosts.get());

      expect(err.statusCode).toBe(500);
      expect(err.message).toContain('Server error.');
      expect(api.requests).toHaveLength(4);
    });
  });

  describe('account', () => {
    it('gets the account', async () => {
      api.reply({ body: { ...OK, data: { balance: 80.1226 } } });

      const response = await api.client().account.get();

      expect(api.requests[0].method).toBe('GET');
      expect(api.requests[0].path).toBe('/4.0/account.json');
      expect(response.data.balance).toBe(80.1226);
    });

    it('gets the balance', async () => {
      api.reply({ headers: { 'Content-Type': 'text/plain' }, body: '80.1226\n' });

      expect(await api.client().account.balance()).toBe(80.1226);
      expect(api.requests[0].path).toBe('/4.0/account/balance.json');
    });

    it('throws when the balance is refused', async () => {
      api.reply({ status: 401, headers: { 'Content-Type': 'text/plain' }, body: '-1\n' });

      const err = await expectError(api.client().account.balance());

      expect(err.statusCode).toBe(401);
    });

    it('gets the usage', async () => {
      await api.client().account.usage({ months: 3 });

      expect(api.requests[0].path).toBe('/4.0/account/usage.json');
      expect(api.requests[0].query).toEqual({ months: '3' });
    });

    it('pauses and resumes the checks', async () => {
      const client = api.client();
      await client.account.pauseChecks();
      await client.account.resumeChecks();

      expect(api.requests.map((r) => [r.method, r.path])).toEqual([
        ['POST', '/4.0/account/checks/pause.json'],
        ['POST', '/4.0/account/checks/resume.json']
      ]);
    });
  });

  describe('cert', () => {
    it('lists the findings', async () => {
      await api.client().cert.findings.get({ dismissed: 1 });

      expect(api.requests[0].path).toBe('/4.0/cert/findings.json');
      expect(api.requests[0].query).toEqual({ dismissed: '1' });
    });

    it('pages through the findings', async () => {
      api.reply({ body: { ...OK, total_pages: 2, data: [{ id: 'CM1' }] } });
      api.reply({ body: { ...OK, total_pages: 2, data: [{ id: 'CM2' }] } });

      expect(await api.client().cert.findings.getAll()).toEqual([{ id: 'CM1' }, { id: 'CM2' }]);
    });

    it('dismisses and restores findings', async () => {
      const client = api.client();
      await client.cert.findings.dismiss({
        finding_id: ['CERT_CAA01', 'CERT_CAA02'],
        monitors: ['CM1', 'CM2']
      });
      await client.cert.findings.restore({ finding_id: 'CERT_CAA01' });

      expect(api.requests[0].path).toBe('/4.0/cert/findings/dismiss.json');
      expect(api.requests[0].body).toEqual({
        finding_id: 'CERT_CAA01,CERT_CAA02',
        monitors: 'CM1,CM2'
      });
      expect(api.requests[1].path).toBe('/4.0/cert/findings/restore.json');
      expect(api.requests[1].body).toEqual({ finding_id: 'CERT_CAA01' });
    });

    it('queues a monitor check', async () => {
      await api.client().cert.monitors.check('CMx');

      expect(api.requests[0].method).toBe('POST');
      expect(api.requests[0].path).toBe('/4.0/cert/monitors/CMx/check.json');
    });

    it('counts the errors', async () => {
      api.reply({ headers: { 'Content-Type': 'text/plain' }, body: '3\n' });

      expect(await api.client().cert.errors.count()).toBe(3);
      expect(api.requests[0].path).toBe('/4.0/cert/errors/count.json');
    });
  });
});
