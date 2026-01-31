/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Client, Exception, RBL, Contact, Cert } from '../src';

describe('Client', () => {
  describe('constructor', () => {
    it('should create a client with valid credentials', () => {
      const client = new Client('AC' + 'a'.repeat(32), 'b'.repeat(64));
      expect(client.accountSid).toBe('AC' + 'a'.repeat(32));
      expect(client.authToken).toBe('b'.repeat(64));
    });

    it('should throw an exception with invalid account SID', () => {
      expect(() => {
        new Client('invalid', 'b'.repeat(64));
      }).toThrow(Exception);
      expect(() => {
        new Client('invalid', 'b'.repeat(64));
      }).toThrow('Invalid account SID format');
    });

    it('should throw an exception with invalid auth token', () => {
      expect(() => {
        new Client('AC' + 'a'.repeat(32), 'invalid');
      }).toThrow(Exception);
      expect(() => {
        new Client('AC' + 'a'.repeat(32), 'invalid');
      }).toThrow('Invalid auth token format');
    });
  });

  describe('namespaces', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client('AC' + 'a'.repeat(32), 'b'.repeat(64));
    });

    it('should provide access to RBL namespace', () => {
      expect(client.rbl).toBeInstanceOf(RBL);
      // Test lazy loading - should return same instance
      expect(client.rbl).toBe(client.rbl);
    });

    it('should provide access to Contact namespace', () => {
      expect(client.contact).toBeInstanceOf(Contact);
      // Test lazy loading - should return same instance
      expect(client.contact).toBe(client.contact);
    });

    it('should provide access to Cert namespace', () => {
      expect(client.cert).toBeInstanceOf(Cert);
      // Test lazy loading - should return same instance
      expect(client.cert).toBe(client.cert);
    });

    it('should provide access to Cert errors endpoint', () => {
      expect(client.cert.errors).toBeDefined();
      expect(client.cert.errors).not.toBeNull();
    });

    it('should provide access to Cert monitors endpoint', () => {
      expect(client.cert.monitors).toBeDefined();
      expect(client.cert.monitors).not.toBeNull();
    });

    it('should provide access to Cert profiles endpoint', () => {
      expect(client.cert.profiles).toBeDefined();
      expect(client.cert.profiles).not.toBeNull();
    });
  });

  describe('version', () => {
    it('should have the correct version', () => {
      expect(Client.VERSION).toBe('2.0.0');
    });
  });
});
