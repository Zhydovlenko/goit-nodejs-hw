const jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");

async function avatarGenerator(email, size) {
  const avatarPath = path.join(process.cwd(), "src", "public", "images");
  const avatarName = Date.now() + ".png";

  const avatar = jdenticon.toPng(email, size);
  await fs.promises.writeFile(avatarPath + "/" + avatarName, avatar);

  return `http://localhost:${process.env.PORT}/images/${avatarName}`;
}

module.exports = avatarGenerator;
