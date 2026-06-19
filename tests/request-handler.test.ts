/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as http from 'http';
import { RequestHandler } from '../src/api/request-handler';
import { Exception } from '../src/exception';

function createTestServer(
  handler: (body: string, req: http.IncomingMessage) => void
): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        handler(body, req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status_code: 200, status_message: 'OK' }));
      });
    });
    server.listen(0, () => resolve(server));
  });
}

function getPort(server: http.Server): number {
  const addr = server.address();
  return (addr as any).port;
}

describe('RequestHandler', () => {
  describe('array parameter conversion', () => {
    it('should convert array values to comma-separated strings in POST', async () => {
      let capturedBody = '';

      const server = await createTestServer((body) => {
        capturedBody = body;
      });

      try {
        const handler = new RequestHandler(
          'AC' + 'a'.repeat(32),
          'b'.repeat(64),
          `http://localhost:${getPort(server)}/`
        );

        await handler.post('rbl/hosts', {
          name: 'Test Host',
          host: '1.2.3.4',
          contact_group: [
            'CG11111111111111111111111111111111',
            'CG22222222222222222222222222222222'
          ]
        });

        const params = new URLSearchParams(capturedBody);
        expect(params.get('contact_group')).toBe(
          'CG11111111111111111111111111111111,CG22222222222222222222222222222222'
        );
        expect(params.get('name')).toBe('Test Host');
      } finally {
        server.close();
      }
    });

    it('should convert array values to comma-separated strings in PUT', async () => {
      let capturedBody = '';

      const server = await createTestServer((body) => {
        capturedBody = body;
      });

      try {
        const handler = new RequestHandler(
          'AC' + 'a'.repeat(32),
          'b'.repeat(64),
          `http://localhost:${getPort(server)}/`
        );

        await handler.put('rbl/hosts/HT11111111111111111111111111111111', {
          contact_group: [
            'CG11111111111111111111111111111111',
            'CG22222222222222222222222222222222'
          ]
        });

        const params = new URLSearchParams(capturedBody);
        expect(params.get('contact_group')).toBe(
          'CG11111111111111111111111111111111,CG22222222222222222222222222222222'
        );
      } finally {
        server.close();
      }
    });

    it('should pass string values unchanged', async () => {
      let capturedBody = '';

      const server = await createTestServer((body) => {
        capturedBody = body;
      });

      try {
        const handler = new RequestHandler(
          'AC' + 'a'.repeat(32),
          'b'.repeat(64),
          `http://localhost:${getPort(server)}/`
        );

        await handler.post('rbl/hosts', {
          name: 'Test Host',
          contact_group: 'CG11111111111111111111111111111111'
        });

        const params = new URLSearchParams(capturedBody);
        expect(params.get('contact_group')).toBe(
          'CG11111111111111111111111111111111'
        );
      } finally {
        server.close();
      }
    });
  });

  describe('error responses', () => {
    function createErrorServer(status: number, body: object): Promise<http.Server> {
      return new Promise((resolve) => {
        const server = http.createServer((_req, res) => {
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(body));
        });
        server.listen(0, () => resolve(server));
      });
    }

    async function expectError(status: number, body: object): Promise<Exception> {
      const server = await createErrorServer(status, body);
      try {
        const handler = new RequestHandler(
          'AC' + 'a'.repeat(32),
          'b'.repeat(64),
          `http://localhost:${getPort(server)}/`
        );

        let caught: unknown;
        try {
          await handler.get('rbl/hosts/HT11111111111111111111111111111111');
        } catch (e) {
          caught = e;
        }

        expect(caught).toBeInstanceOf(Exception);
        return caught as Exception;
      } finally {
        server.close();
      }
    }

    it('throws with the status_message and statusCode on 400', async () => {
      const err = await expectError(400, {
        status_code: 400,
        status_message: 'Invalid host id provided.'
      });
      expect(err.message).toContain('Invalid host id provided.');
      expect(err.statusCode).toBe(400);
    });

    it('throws on 404', async () => {
      const err = await expectError(404, {
        status_code: 404,
        status_message: 'Not found.'
      });
      expect(err.statusCode).toBe(404);
    });

    it('throws on 422 with the validation message', async () => {
      const err = await expectError(422, {
        status_code: 422,
        status_message: 'Validation failed.'
      });
      expect(err.message).toContain('Validation failed.');
      expect(err.statusCode).toBe(422);
    });

    it('throws on 500', async () => {
      const err = await expectError(500, {
        status_code: 500,
        status_message: 'Server error.'
      });
      expect(err.statusCode).toBe(500);
    });
  });
});
