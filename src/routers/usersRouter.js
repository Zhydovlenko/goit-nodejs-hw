const express = require("express");
const joi = require("joi");
const fs = require("fs");
const passwordHash = require("password-hash");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const responseNormalizer = require("../normalizers/responseNormalizer");
const UserModel = require("../database/models/UserModel");
const errorWrapper = require("../helpers/errorWrapper");
const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../helpers/errorHelper");
const avatarGenerator = require("../helpers/avatarGenerator");
const authCheck = require("../middlewares/auth-check");
const multer = require("../helpers/multer");
const config = require("../../config");

const router = express.Router();

router.post(
  "/auth/register",
  errorWrapper(async (req, res) => {
    const error = await joi
      .object({
        email: joi.string().email().required(),
        password: joi.string().min(3).required(),
      })
      .validate(req.body);

    if (error.error) {
      throw new ValidationError(
        "Ошибка от Joi или другой валидационной библиотеки"
      );
    }
    const { email, password } = req.body;
    const [user] = await UserModel.find({ email });

    if (user) {
      throw new ConflictError("Email in use");
    }

    const avatarURL = await avatarGenerator(email, 200);
    const createdUser = await UserModel.create({
      email,
      avatarURL,
    });

    res.status(201).send({ createdUser });
  })
);

router.post(
  "/auth/login",
  errorWrapper(async (req, res) => {
    const error = await joi
      .object({
        email: joi.string().email().required(),
        password: joi.string().min(3).required(),
      })
      .validateAsync(req.body);

    if (error.error) {
      throw new ValidationError(
        "Ошибка от Joi или другой валидационной библиотеки"
      );
    }

    const { email, password, subscription } = req.body;

    const user = await UserModel.findOne({ email });
    const isValid = passwordHash.verify(password, user.password);

    if (!user && !isValid) {
      throw new UnauthorizedError("Email or password is wrong");
    }

    const token = await user.generateAndSaveToken();

    res.status(200).send({
      token: token,
      user: {
        email,
        subscription,
      },
    });
  })
);

router.post(
  "/auth/logout",
  authCheck,
  errorWrapper(async (req, res) => {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      throw new UnauthorizedError("Not authorized");
    }

    const token = req.headers["access-token"];
    user.tokens = user.tokens.filter((userToken) => userToken.token !== token);
    await user.save();
    res.status(204).send();
  })
);

router.get("/current", authCheck, async (req, res) => {
  const { _id, email, subscription } = req.user;
  res.status(200).send(responseNormalizer({ _id, email, subscription }));
});

router.patch(
  "/",
  authCheck,
  errorWrapper(async (req, res) => {
    await joi
      .object({
        email: joi.string().email(),
        subscription: joi.string(),
      })
      .validate(req.body);

    const { subscription } = req.body;
    const { _id } = req.user;

    const subscriptionType = ["free", "pro", "premium"];

    if (subscription && !subscriptionType.includes(subscription)) {
      throw new ValidationError("Choose available subscription type");
    }
    await UserModel.findByIdAndUpdate(
      _id,
      { $set: req.body },
      { returnOriginal: false }
    );
    res.status(204).send();
  })
);

router.patch(
  "/avatars",
  authCheck,
  multer.single("avatar"),
  errorWrapper(async (req, res) => {
    minifyImage();

    const userEmail = req.user;

    if (!userEmail) {
      throw new UnauthorizedError("Not authorized");
    }

    const avatarURL = `http://localhost:${process.env.PORT}/images/${req.file.filename}`;

    await UserModel.findByIdAndUpdate(req.id, {
      $set: { avatarURL },
    });
    res.status(200).send(responseNormalizer({ avatarURL }));
  })
);

async function minifyImage(tmpFilePath) {
  try {
    await imagemin([tmpFilePath], {
      destination: config.avaPath,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    });

    await fs.promises.unlink(tmpFilePath);
    next();
  } catch (e) {
    console.log(e);
  }
}

module.exports = router;
