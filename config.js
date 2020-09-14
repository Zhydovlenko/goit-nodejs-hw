require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  databaseConnectionUrl: process.env.DATABASE_URL,
  databaseName: process.env.DATABASE_NAME,
};
