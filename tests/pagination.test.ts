/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { PaginationMixin } from '../src/api/pagination';

class MockResource extends PaginationMixin {
  public getMock: jest.Mock;

  constructor() {
    super();
    this.getMock = jest.fn();
  }

  async get(params?: Record<string, any>): Promise<any> {
    return this.getMock(params);
  }

  protected getResourceName(): string {
    return 'hosts';
  }
}

function makeResponse(
  items: any[],
  page: number,
  totalPages: number,
  total: number,
  pageSize: number = 100
): any {
  return {
    total,
    page,
    total_pages: totalPages,
    page_size: pageSize,
    data: items
  };
}

function makeHosts(count: number, offset: number = 0): any[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `host_${i + offset + 1}`
  }));
}

describe('PaginationMixin', () => {
  describe('getAll', () => {
    it('should return all items from a single page', async () => {
      const resource = new MockResource();
      const hosts = makeHosts(3);

      resource.getMock.mockResolvedValueOnce(makeResponse(hosts, 1, 1, 3));

      const result = await resource.getAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('host_1');
      expect(result[2].name).toBe('host_3');
      expect(resource.getMock).toHaveBeenCalledTimes(1);
    });

    it('should aggregate items across multiple pages', async () => {
      const resource = new MockResource();

      resource.getMock
        .mockResolvedValueOnce(makeResponse(makeHosts(2, 0), 1, 3, 5, 2))
        .mockResolvedValueOnce(makeResponse(makeHosts(2, 2), 2, 3, 5, 2))
        .mockResolvedValueOnce(makeResponse(makeHosts(1, 4), 3, 3, 5, 2));

      const result = await resource.getAll({ page_size: 2 });

      expect(result).toHaveLength(5);
      expect(result[0].name).toBe('host_1');
      expect(result[4].name).toBe('host_5');
      expect(resource.getMock).toHaveBeenCalledTimes(3);
    });

    it('should return empty array for empty response', async () => {
      const resource = new MockResource();

      resource.getMock.mockResolvedValueOnce(makeResponse([], 1, 1, 0));

      const result = await resource.getAll();

      expect(result).toHaveLength(0);
      expect(resource.getMock).toHaveBeenCalledTimes(1);
    });

    it('should pass custom page_size', async () => {
      const resource = new MockResource();

      resource.getMock.mockResolvedValueOnce(
        makeResponse([{ name: 'host_1' }], 1, 1, 1, 50)
      );

      const result = await resource.getAll({ page_size: 50 });

      expect(result).toHaveLength(1);
      expect(resource.getMock).toHaveBeenCalledWith(
        expect.objectContaining({ page_size: 50 })
      );
    });

    it('should extract items by resource name key', async () => {
      const resource = new MockResource();

      resource.getMock.mockResolvedValueOnce({
        total: 2,
        page: 1,
        total_pages: 1,
        page_size: 100,
        hosts: [{ name: 'a' }, { name: 'b' }]
      });

      const result = await resource.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('a');
    });
  });
});
