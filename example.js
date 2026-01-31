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
client.rbl.hosts.get('HTee06c4fa7c23aa8a3a4e8d66922b0834')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Create a new host
client.rbl.hosts.create({
  name: 'My Mail Server',
  host: '192.168.1.100',
  type: 'rbl',
  rbl_profile: 'RP15d4e891d784977cacbfcbb00c48f133',
  contact_group: 'CG37106c6baa1ec90a2b3f5c8ec54afe9d'
})
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Update a host
client.rbl.hosts.update('HTee06c4fa7c23aa8a3a4e8d66922b0834', {
  name: 'Updated Mail Server Name'
})
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Delete a host
client.rbl.hosts.delete('HTee06c4fa7c23aa8a3a4e8d66922b0834')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Pause/Resume a host
client.rbl.hosts.pause('HTee06c4fa7c23aa8a3a4e8d66922b0834')
  .then(() => client.rbl.hosts.resume('HTee06c4fa7c23aa8a3a4e8d66922b0834'))
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
    await client.contact.contacts.update('CT1234567890abcdef', {
      email: 'updated@example.com'
    });

    // Confirm a contact
    await client.contact.contacts.confirm('CT1234567890abcdef', {
      authcode: '123456'
    });

    // Delete a contact
    await client.contact.contacts.delete('CT1234567890abcdef');
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
    await client.contact.groups.update('CG1234567890abcdef', {
      name: 'Updated Group Name'
    });

    // Delete a contact group
    await client.contact.groups.delete('CG1234567890abcdef');
  } catch (err) {
    console.error(err);
  }
})();
