/**
 * This file is part of the Generator Labs Node SDK package.
 *
 * (c) Generator Labs <support@generatorlabs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const { Client } = require('generatorlabs');

// Initialize the client
const client = new Client('your_account_sid', 'your_auth_token');

// List hosts
client.rbl.hosts.get({ page_size: 10, page: 1 })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Get a single host
client.rbl.hosts.get('HT1a2b3c4d5e6f7890abcdef1234567890')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Create a new host
client.rbl.hosts.create({
  name: 'My Mail Server',
  host: '192.168.1.100',
  type: 'rbl',
  rbl_profile: 'RP9f8e7d6c5b4a3210fedcba0987654321',
  contact_group: 'CG4f3e2d1c0b9a8776655443322110fed'
})
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Update a host
client.rbl.hosts.update('HT1a2b3c4d5e6f7890abcdef1234567890', {
  name: 'Updated Mail Server Name'
})
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Delete a host
client.rbl.hosts.delete('HT1a2b3c4d5e6f7890abcdef1234567890')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Pause/Resume a host
client.rbl.hosts.pause('HT1a2b3c4d5e6f7890abcdef1234567890')
  .then(() => client.rbl.hosts.resume('HT1a2b3c4d5e6f7890abcdef1234567890'))
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Start a manual RBL check
client.rbl.check.start({
  host: '192.168.1.100',
  callback: 'https://myserver.com/callback',
  details: 1
})
  .then(result => {
    const checkId = result.data.id;
    // Get check status
    return client.rbl.check.status(checkId, { details: 1 });
  })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Manage contacts
(async () => {
  try {
    // List contacts
    const contacts = await client.contact.contacts.get();
    console.log(contacts);

    // Create a contact
    const result = await client.contact.contacts.create({
      email: 'admin@example.com',
      type: 'email'
    });
    console.log(result);

    // Update a contact
    await client.contact.contacts.update('COabcdef1234567890abcdef1234567890', {
      email: 'updated@example.com'
    });

    // Confirm a contact
    await client.contact.contacts.confirm('COabcdef1234567890abcdef1234567890', {
      authcode: '123456'
    });

    // Delete a contact
    await client.contact.contacts.delete('COabcdef1234567890abcdef1234567890');
  } catch (err) {
    console.error(err);
  }
})();

// Manage contact groups
(async () => {
  try {
    // List contact groups
    const groups = await client.contact.groups.get();
    console.log(groups);

    // Create a contact group
    const result = await client.contact.groups.create({
      name: 'Primary Contacts',
      contacts: 'CT123...,CT456...'
    });
    console.log(result);

    // Update a contact group
    await client.contact.groups.update('CG4f3e2d1c0b9a8776655443322110fed', {
      name: 'Updated Group Name'
    });

    // Delete a contact group
    await client.contact.groups.delete('CG4f3e2d1c0b9a8776655443322110fed');
  } catch (err) {
    console.error(err);
  }
})();
