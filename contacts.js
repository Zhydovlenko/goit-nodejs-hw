const path = require("path");
const fs = require("fs");
const shortid = require("shortid");

const contactsPath = path.join(__dirname, "./db/contacts.json");

function listContacts() {
  fs.promises
    .readFile(contactsPath, "utf-8")
    .then((data) => JSON.parse(data))
    .then((contacts) => console.table(contacts))
    .catch((err) => console.log(err));
}

function getContactById(contactId) {
  fs.promises
    .readFile(contactsPath, "utf-8")
    .then((data) => JSON.parse(data))
    .then((contacts) => contacts.find(({ id }) => id === contactId))
    .then((contactById) => console.log(contactById))
    .catch((err) => console.log(err));
}

function removeContact(contactId) {
  fs.promises
    .readFile(contactsPath, "utf-8")
    .then((data) => JSON.parse(data))
    .then((contacts) => contacts.filter(({ id }) => id !== contactId))
    .then((newList) => {
      fs.promises.writeFile(contactsPath, JSON.stringify(newList));
      console.table(newList);
    })
    .catch((err) => console.log(err));
}

function addContact(name, email, phone) {
  const id = shortid.generate();
  const newContact = { id, name, email, phone };

  fs.promises
    .readFile(contactsPath, "utf-8")
    .then((data) => JSON.parse(data))
    .then((contacts) => {
      const newList = [...contacts, newContact];
      fs.promises.writeFile(contactsPath, JSON.stringify(newList));
      console.table(newList);
    })
    .catch((err) => console.log(err));
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
