const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connection = require("./database/Connection");
const config = require("./config");
const responseNormalizer = require("./normalizers/responseNormalizer");
const contactsRouter = require("./routers/contactsRouter");
const usersRouter = require("./routers/usersRouter");
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

async function main() {
  try {
    await connection.connect();

    app.use(morgan("tiny"));
    app.use(express.json());
    app.use(cors());

    app.use("/api/contacts", contactsRouter);
    app.use("/users", usersRouter);

    app.use((err, req, res, next) => {
      if (err) {
        return res.status(500).send(responseNormalizer(err));
      }
      next();
    });

    app.listen(config.port, () => {
      console.log("server started at port", config.port);
    });

    process.on("SIGINT", () => {
      connection.close();
    });

    console.log("Database connection successful");
  } catch (e) {
    console.error(e);
  }
}

main();
