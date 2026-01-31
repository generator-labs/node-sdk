/**
 * Example: Check if an IP address is listed on any RBLs
 */

import { Client, Exception } from '../src';

// Get credentials from environment variables
const accountSid = process.env.GENERATOR_LABS_ACCOUNT_SID;
const authToken = process.env.GENERATOR_LABS_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('Error: Set GENERATOR_LABS_ACCOUNT_SID and GENERATOR_LABS_AUTH_TOKEN environment variables');
  process.exit(1);
}

async function main() {
  try {
    // Initialize client
    const client = new Client(accountSid!, authToken!);

    // Check a single IP address
    const ip = '8.8.8.8';
    console.log(`Checking IP: ${ip}`);

    const result = await client.rbl.check(ip);

    console.log('Results:');
    console.log(result);

    // Check if IP is listed
    if (result.listed) {
      console.log(`\nWARNING: IP ${ip} is listed on one or more RBLs!`);
      if (result.listings) {
        console.log(`Listed on: ${result.listings.length} RBL(s)`);
      }
    } else {
      console.log(`\nIP ${ip} is clean - not listed on any RBLs`);
    }

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
