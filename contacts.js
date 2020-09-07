const path = require("path");
const fs = require("fs");
const shortid = require("shortid");

const contactsPath = path.join(__dirname, "./db/contacts.json");

async function listContacts() {
  const data = await fs.promises.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

async function getContactById(contactId) {
  const data = await fs.promises.readFile(contactsPath, "utf-8");
  return (contactById = JSON.parse(data).find(({ id }) => id === contactId));
}

async function removeContact(contactId) {
  const data = await listContacts();

  const dataId = await data.findIndex(({ id }) => id === contactId);
  if (dataId === -1) {
    return false;
  } else {
    const newList = data.filter(({ id }) => id !== contactId);
    await fs.promises.writeFile(contactsPath, JSON.stringify(newList));
    return true;
  }
}

async function addContact(name, email, phone) {
  const id = shortid.generate();
  const newContact = { id, name, email, phone };

  const data = await listContacts();
  const newList = [...data, newContact];

  await fs.promises.writeFile(contactsPath, JSON.stringify(newList));
  return { id, name, email, phone };
}

async function updateContact(contactId, updatedData) {
  const contact = await getContactById(contactId);
  if (!contact) {
    return;
  }
  const data = await listContacts();
  const foundIndexContact = await data.findIndex(({ id }) => id === contactId);

  if (foundIndexContact === -1) {
    return false;
  } else {
    const updatedContact = { ...contact, ...updatedData };
    data[foundIndexContact] = updatedContact;
    await fs.promises.writeFile(contactsPath, JSON.stringify(data));
    return updatedContact;
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
