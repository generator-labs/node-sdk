/**
 * Example: Certificate monitoring - list errors, manage monitors and profiles
 */

import { Client } from '../src';

const accountSid = process.env.GENERATOR_LABS_ACCOUNT_SID;
const authToken = process.env.GENERATOR_LABS_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('Error: Set GENERATOR_LABS_ACCOUNT_SID and GENERATOR_LABS_AUTH_TOKEN environment variables');
  process.exit(1);
}

async function main() {
  try {
    const client = new Client(accountSid!, authToken!);

    // ===================================================================
    // Certificate Errors
    // ===================================================================
    console.log('=== Listing Certificate Errors ===');
    const errors = await client.cert.errors.get();
    console.log(`Total errors: ${errors.errors?.length || 0}\n`);

    for (const error of errors.errors || []) {
      console.log(`Error ID: ${error.id}`);
      console.log(`  Monitor: ${error.monitor_name}`);
      console.log(`  Type: ${error.error_type}`);
      console.log(`  Message: ${error.message}\n`);
    }

    // ===================================================================
    // Certificate Profiles
    // ===================================================================
    console.log('=== Managing Certificate Profiles ===');

    // List all profiles
    const profiles = await client.cert.profiles.get();
    console.log(`Total profiles: ${profiles.profiles?.length || 0}`);

    // Create a new profile
    console.log('\n=== Creating a new certificate profile ===');
    const newProfile = await client.cert.profiles.create({
      name: 'Example Certificate Profile',
      expiration_warning_days: 30,
      expiration_critical_days: 7,
      check_self_signed: true,
      check_hostname_mismatch: true
    });
    console.log(`Created profile ID: ${newProfile.profile?.id}`);
    const profileId = newProfile.profile?.id!;

    // Get specific profile
    console.log('\n=== Getting specific profile ===');
    const profile = await client.cert.profiles.get(profileId);
    console.log(`Profile name: ${profile.profile?.name}`);
    console.log(`Expiration warning days: ${profile.profile?.expiration_warning_days}`);

    // Update profile
    console.log('\n=== Updating profile ===');
    const updatedProfile = await client.cert.profiles.update(profileId, {
      expiration_warning_days: 45
    });
    console.log('Updated profile warning days to 45');

    // ===================================================================
    // Certificate Monitors
    // ===================================================================
    console.log('\n=== Managing Certificate Monitors ===');

    // List all monitors
    const monitors = await client.cert.monitors.get();
    console.log(`Total monitors: ${monitors.monitors?.length || 0}`);

    // Create a new HTTPS monitor
    console.log('\n=== Creating HTTPS certificate monitor ===');
    const httpsMonitor = await client.cert.monitors.create({
      name: 'Example HTTPS Monitor',
      hostname: 'example.com',
      port: 443,
      protocol: 'https',
      cert_profile: profileId,
      contact_group: 'CG4f3e2d1c0b9a8776655443322110fed' // Use your contact group ID
    });
    console.log(`Created HTTPS monitor ID: ${httpsMonitor.monitor?.id}`);
    const httpsMonitorId = httpsMonitor.monitor?.id!;

    // Create a mail server monitor (SMTPS)
    console.log('\n=== Creating SMTPS certificate monitor ===');
    const smtpsMonitor = await client.cert.monitors.create({
      name: 'Example Mail Server Monitor',
      hostname: 'mail.example.com',
      port: 465,
      protocol: 'smtps',
      cert_profile: profileId,
      contact_group: 'CG4f3e2d1c0b9a8776655443322110fed'
    });
    console.log(`Created SMTPS monitor ID: ${smtpsMonitor.monitor?.id}`);
    const smtpsMonitorId = smtpsMonitor.monitor?.id!;

    // Get specific monitor
    console.log('\n=== Getting specific monitor ===');
    const monitor = await client.cert.monitors.get(httpsMonitorId);
    console.log(`Monitor name: ${monitor.monitor?.name}`);
    console.log(`Hostname: ${monitor.monitor?.hostname}`);
    console.log(`Protocol: ${monitor.monitor?.protocol}`);
    console.log(`Status: ${monitor.monitor?.status}`);

    // Update monitor
    console.log('\n=== Updating monitor ===');
    const updatedMonitor = await client.cert.monitors.update(httpsMonitorId, {
      name: 'Updated HTTPS Monitor Name'
    });
    console.log('Updated monitor name');

    // Pause monitoring
    console.log('\n=== Pausing monitor ===');
    await client.cert.monitors.pause(httpsMonitorId);
    console.log(`Paused monitor ID: ${httpsMonitorId}`);

    // Resume monitoring
    console.log('\n=== Resuming monitor ===');
    await client.cert.monitors.resume(httpsMonitorId);
    console.log(`Resumed monitor ID: ${httpsMonitorId}`);

    // ===================================================================
    // Cleanup
    // ===================================================================
    console.log('\n=== Cleaning up - Deleting created resources ===');

    // Delete monitors
    await client.cert.monitors.delete(httpsMonitorId);
    console.log(`Deleted HTTPS monitor ID: ${httpsMonitorId}`);

    await client.cert.monitors.delete(smtpsMonitorId);
    console.log(`Deleted SMTPS monitor ID: ${smtpsMonitorId}`);

    // Delete profile
    await client.cert.profiles.delete(profileId);
    console.log(`Deleted profile ID: ${profileId}`);

    console.log('\n=== Certificate Monitoring Example Complete ===');

  } catch (err) {
    console.error('API Error:', err);
    process.exit(1);
  }
}

main();
