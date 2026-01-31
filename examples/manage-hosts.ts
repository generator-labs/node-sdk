/**
 * Example: Manage monitored hosts (create, list, update, delete)
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

    // List all hosts
    console.log('=== Listing all monitored hosts ===');
    const hosts = await client.rbl.hosts().get();
    console.log(`Total hosts: ${hosts.hosts?.length || 0}\n`);

    for (const host of hosts.hosts || []) {
      console.log(`ID: ${host.id}, IP: ${host.ip}, Description: ${host.description || 'N/A'}`);
    }

    // Create a new host
    console.log('\n=== Creating a new host ===');
    const newHost = await client.rbl.hosts().create({
      ip: '203.0.113.10',
      description: 'Example host from Node.js SDK',
      profile_id: 1  // Use your profile ID
    });
    console.log(`Created host ID: ${newHost.host.id}`);
    const hostId = newHost.host.id;

    // Get specific host
    console.log('\n=== Getting specific host ===');
    const host = await client.rbl.hosts().get(hostId);
    console.log('Host details:');
    console.log(host);

    // Update host
    console.log('\n=== Updating host ===');
    await client.rbl.hosts().update(hostId, {
      description: 'Updated description from Node.js SDK'
    });
    console.log('Updated host description');

    // Delete host
    console.log('\n=== Deleting host ===');
    await client.rbl.hosts().delete(hostId);
    console.log(`Deleted host ID: ${hostId}`);

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
