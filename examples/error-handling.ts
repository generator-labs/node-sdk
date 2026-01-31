/**
 * Example: Proper error handling and configuration
 */

import { Client, ClientConfig, Exception } from '../src';

const accountSid = process.env.GENERATOR_LABS_ACCOUNT_SID;
const authToken = process.env.GENERATOR_LABS_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('Error: Set GENERATOR_LABS_ACCOUNT_SID and GENERATOR_LABS_AUTH_TOKEN environment variables');
  process.exit(1);
}

async function main() {
  try {
    // Initialize client with custom configuration
    const config: ClientConfig = {
      timeout: 45000,        // 45 second timeout
      maxRetries: 5,         // 5 retry attempts
      retryBackoff: 2        // 2x backoff multiplier (2s, 4s, 8s, 16s, 32s)
    };
    const client = new Client(accountSid!, authToken!, config);

    console.log('=== Example 1: Handling API errors ===');
    try {
      // Try to get a non-existent host
      await client.rbl.hosts().get('999999');
    } catch (error) {
      if (error instanceof Exception) {
        console.log(`Caught error: ${error.message}`);
        console.log('This is expected for a non-existent resource\n');
      }
    }

    console.log('=== Example 2: Invalid credentials ===');
    try {
      new Client('INVALID', authToken!);
    } catch (error) {
      if (error instanceof Exception) {
        console.log(`Caught error: ${error.message}`);
        console.log('Credential validation works!\n');
      }
    }

    console.log('=== Example 3: Network resilience ===');
    // The SDK automatically retries on:
    // - Network errors
    // - 5xx server errors
    // - 429 rate limit errors
    // With exponential backoff

    const result = await client.rbl.check('1.1.1.1');
    console.log('Request succeeded (with automatic retries if needed)');

    console.log('\n=== Example 4: Graceful degradation ===');
    try {
      const hosts = await client.rbl.hosts().get();
      console.log(`Successfully retrieved ${hosts.hosts?.length || 0} hosts`);
    } catch (error) {
      // Log error and continue with cached/default data
      console.error(`API error: ${error}`);
      console.log('Using cached data due to API error');
      const hosts = { hosts: [] };  // Fallback to empty array
    }

  } catch (error) {
    console.error(`Fatal error: ${error}`);
    process.exit(1);
  }

  console.log('\nAll examples completed!');
}

main();
