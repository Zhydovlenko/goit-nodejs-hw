const multer = require("multer");
const path = require("path");
const config = require("../../config");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.avaPath);
  },
  filename: (req, file, cb) => {
    const { ext } = path.parse(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

module.exports = multer({ storage });
