const express = require("express");
const joi = require("joi");
const responseNormalizer = require("../normalizers/responseNormalizer");
const authCheck = require("../middlewares/auth-check");
const errorWrapper = require("../helpers/errorWrapper");
const ContactModel = require("../database/models/ContactModel");
const router = express.Router();

router.get(
  "/",
  errorWrapper(async (req, res) => {
    const { page = 0, limit = 20 } = req.query;

    const contacts = await ContactModel.find({})
      .sort({ name: 1 })
      .skip(parseInt(page * limit))
      .limit(parseInt(limit));

    res.status(200).send(responseNormalizer({ contacts }));
  })
);

router.get(
  "/:contactId",
  errorWrapper(async (req, res) => {
    const contactById = await ContactModel.findById(req.params.contactId);

    if (contactById) {
      return res.status(200).send(responseNormalizer(contactById));
    } else {
      const err = { message: "Not found" };
      return res.status(404).send(responseNormalizer(err));
    }
  })
);

router.post(
  "/",
  authCheck,
  errorWrapper(async (req, res) => {
    const error = await joi
      .object({
        email: joi.string().min(5).required(),
        subscription: joi.string(),
        password: joi.string().required(),
      })
      .validateAsync(req.body);

    if (error.error) {
      error.error = { message: `${error.error.message} field` };
      return res.status(400).send(responseNormalizer(error.error));
    }
    const newContact = await ContactModel.create(req.body);

    res.status(201).send(responseNormalizer(newContact));
  })
);

router.delete(
  "/:contactId",
  authCheck,
  errorWrapper(async (req, res) => {
    const contactToRemove = await ContactModel.findById(req.params.contactId);

    if (contactToRemove) {
      await contactToRemove.remove();
      const success = { message: "contact deleted" };
      return res.status(200).send(success);
    } else {
      const err = { message: "Not found" };
      return res.status(404).send(err);
    }
  })
);

router.patch(
  "/:contactId",
  authCheck,
  errorWrapper(async (req, res) => {
    if (!Object.keys(req.body).length) {
      const err = { message: "missing fields" };
      return res.status(400).send(responseNormalizer(err));
    }

    const { contactId } = req.params;
    const contact = await ContactModel.findById(contactId);

    if (contact) {
      Object.keys(req.body).forEach((key) => {
        contact[key] = req.body[key];
      });

      await contact.save();

      res.status(200).send({ contact });
    } else {
      const err = { message: "Not found" };
      return res.status(404).send(responseNormalizer(err));
    }
  })
);

module.exports = router;
