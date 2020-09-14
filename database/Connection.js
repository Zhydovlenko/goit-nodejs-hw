const mongodb = require("mongodb");
const config = require("../config");

class Connection {
  constructor() {
    this.connection = null;
    this.database = null;
  }

  getCollection(name) {
    return this.database.collection(name);
  }

  async connect() {
    const { MongoClient } = mongodb;

    this.connection = await MongoClient.connect(config.databaseConnectionUrl, {
      useUnifiedTopology: true,
    });
    this.database = this.connection.db(config.databaseName);
  }

  async close() {
    this.connection.close();
  }
}

module.exports = new Connection();
