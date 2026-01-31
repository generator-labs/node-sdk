/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Pagination support for list endpoints
 */
export abstract class PaginationMixin {
  /**
   * Get all items with automatic pagination
   */
  async getAll(params: Record<string, any> = {}): Promise<any[]> {
    const allItems: any[] = [];
    let page = 1;
    const pageSize = params.page_size || 100;

    while (true) {
      // Merge pagination params
      const paramsWithPage = {
        ...params,
        page,
        page_size: pageSize
      };

      // Make the request (implemented by child class)
      const response = await (this as any).get(paramsWithPage);

      // Extract items from response
      const items = this.extractItems(response);
      allItems.push(...items);

      // Check if there are more pages
      const hasMore = response.has_more || false;
      if (!hasMore) {
        break;
      }

      page++;
    }

    return allItems;
  }

  /**
   * Extract items from API response
   * Override in child class if needed
   */
  protected extractItems(response: any): any[] {
    // Try common response patterns
    const resourceName = this.getResourceName();

    if (response[resourceName]) {
      return response[resourceName];
    }

    if (response.data) {
      return response.data;
    }

    if (response.items) {
      return response.items;
    }

    return [];
  }

  /**
   * Get the resource name for extracting items
   * Override in child class
   */
  protected getResourceName(): string {
    // Default to lowercase class name
    return this.constructor.name.toLowerCase();
  }
}
