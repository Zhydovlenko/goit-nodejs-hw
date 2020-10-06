const joi = require("joi");
const jwt = require("jsonwebtoken");
const UserModel = require("../database/models/UserModel");
const validate = require("../helpers/validate");
const config = require("../../config");
const errorWrapper = require("../helpers/errorWrapper");

const { UnauthorizedError, ForbiddenError } = require("../helpers/errorHelper");

module.exports = errorWrapper(async (req, res, next) => {
  const token = req.headers["access-token"];

  validate(joi.string().min(20).required(), token);

  const user = await UserModel.findOne({ "tokens.token": token });

  if (!user) {
    throw new UnauthorizedError({ message: "Not authorized" });
  }

  const tokenRecord = user.tokens.find(
    (userToken) => userToken.token === token
  );

  if (new Date(tokenRecord.expires) < new Date()) {
    user.tokens = user.tokens.filter((userToken) => userToken.token !== token);

    await user.save();

    throw new ForbiddenError("Token time left");
  }

  jwt.decode(tokenRecord.token, config.jwtPrivateKey);

  req.user = user;

  next();
});
