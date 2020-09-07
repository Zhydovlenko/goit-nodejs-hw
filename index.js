const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const config = require("./config");
const contacts = require("./contacts");
const contactsRouter = require("./routers/contactsRouter");
const argv = require("yargs").argv;

const app = express();

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      contacts.listContacts();
      break;

    case "get":
      contacts.getContactById(id);
      break;

    case "add":
      contacts.addContact(name, email, phone);
      break;

    case "remove":
      contacts.removeContact(id);
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());

app.use("/api/contacts", contactsRouter);

app.listen(config.port, (err) => {
  if (err) {
    return console.error(err);
  }

  console.info("server started at port", config.port);
});
