/**
 * Example: Paginate through large result sets
 */

import { Client, Exception } from '../src';

const accountSid = process.env.GENERATOR_LABS_ACCOUNT_SID;
const authToken = process.env.GENERATOR_LABS_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('Error: Set GENERATOR_LABS_ACCOUNT_SID and GENERATOR_LABS_AUTH_TOKEN environment variables');
  process.exit(1);
}

async function main() {
  try {
    const client = new Client(accountSid!, authToken!);

    console.log('=== Fetching all hosts with pagination ===');

    const allHosts = [];
    let page = 1;
    const pageSize = 50;

    while (true) {
      console.log(`Fetching page ${page}...`);

      const response = await client.rbl.hosts().get({
        page,
        page_size: pageSize
      });

      const hosts = response.hosts || [];
      allHosts.push(...hosts);

      console.log(`  Retrieved ${hosts.length} hosts`);

      // Check if there are more pages
      const hasMore = response.has_more || false;
      if (!hasMore) {
        break;
      }

      page++;
    }

    console.log(`\nTotal hosts retrieved: ${allHosts.length}`);

    // Alternative: Use the built-in pagination helper
    console.log('\n=== Using pagination helper ===');

    const allHostsHelper = await client.rbl.hosts().getAll({ page_size: 50 });
    console.log(`Total hosts via helper: ${allHostsHelper.length}`);

  } catch (error) {
    if (error instanceof Exception) {
      console.error(`API Error: ${error.message}`);
    } else {
      console.error(`Error: ${error}`);
    }
    process.exit(1);
  }
}

main();
