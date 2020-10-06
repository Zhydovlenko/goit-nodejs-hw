const jdenticon = require("jdenticon");
const config = require("../../config");
const fs = require("fs");

async function avatarGenerator(email, size) {
  const avatarName = Date.now() + ".png";

  const avatar = jdenticon.toPng(email, size);
  await fs.promises.writeFile(`${config.avaPath}/${avatarName}`, avatar);

  return `${config.serverURL}/images/${avatarName}`;
}

module.exports = avatarGenerator;
