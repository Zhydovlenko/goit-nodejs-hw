const mongoose = require("mongoose");
const passwordHash = require("password-hash");
const jsonWebToken = require("jsonwebtoken");
const config = require("../../../config");

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: String,
  password: String,
  avatarURL: String,
  avatarPath: String,
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  tokens: [
    {
      token: { type: String, required: true },
      expires: { type: Date, required: true },
    },
  ],
  status: {
    type: String,
    required: true,
    enum: ["Verified", "Created"],
    default: "Created",
  },
  verificationToken: { type: String, required: false },
});

UserSchema.static("hashPasssword", (password) => {
  return passwordHash.generate(password);
});

UserSchema.method("isPasswordValid", function (password) {
  return password.verify(password, this.password);
});

UserSchema.method("generateAndSaveToken", async function () {
  const token = jsonWebToken.sign({ id: this._id }, config.jwtPrivateKey);

  this.tokens.push({
    token,
    expires: new Date().getTime() + 24 * 60 * 60 * 1e3,
  });

  await this.save();

  return token;
});

UserSchema.pre("save", function () {
  if (this.isNew) {
    this.password = this.constructor.hashPasssword(this.password);
  }
});

module.exports = mongoose.model("User", UserSchema);
