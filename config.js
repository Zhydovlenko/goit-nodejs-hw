require("dotenv").config();
const path = require("path");

module.exports = {
  port: process.env.PORT,
  databaseConnectionUrl: process.env.DATABASE_URL,
  databaseName: process.env.DATABASE_NAME,
  jwtPrivateKey: process.env.TOKEN_PRIVATE_KEY,
  tempPath: path.join(process.cwd(), "tmp"),
  avaPath: path.join(__dirname, "src", "public", "images"),
};
