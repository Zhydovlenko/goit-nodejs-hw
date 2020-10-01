const config = require("../../config");
const mongoose = require("mongoose");

class Connection {
  constructor() {
    this.connection = null;
    this.database = null;
  }

  getCollection(name) {
    return this.database.collection(name);
  }

  async connect() {
    const connectionStatePromise = new Promise((resolve, reject) => {
      mongoose.connection.on("error", (e) => {
        process.exit(1);
      });
      mongoose.connection.on("open", () => {
        resolve();
      });
    });

    await mongoose.connect(
      `${config.databaseConnectionUrl}/${config.databaseName}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );

    return connectionStatePromise;
  }
  async close() {
    mongoose.connection.close();
  }
}

module.exports = new Connection();
