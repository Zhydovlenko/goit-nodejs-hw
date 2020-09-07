const express = require("express");
const joi = require("joi");
const responseNormalizer = require("../normalizers/responseNormalizer");
const router = express.Router();
const contacts = require("../contacts");
const errorWrapper = require("../helpers/errorWrapper");

router.get(
  "/",
  errorWrapper(async (req, res) => {
    const contactsList = await contacts.listContacts();
    res.status(200).send(responseNormalizer(contactsList));
  })
);

router.get(
  "/:contactId",
  errorWrapper(async (req, res) => {
    const contactById = await contacts.getContactById(
      parseInt(req.params.contactId)
    );

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
  errorWrapper(async (req, res) => {
    const error = joi
      .object({
        name: joi.string().min(3).required(),
        email: joi.string().min(5).required(),
        phone: joi.number().min(6).required(),
      })
      .validate(req.body);
    if (error.error) {
      error.error = { message: `${error.error.message} field` };
      return res.status(400).send(responseNormalizer(error.error));
    }
    const { name, email, phone } = req.body;
    const contactToAdd = await contacts.addContact(name, email, phone);

    res.status(201).send(responseNormalizer(contactToAdd));
  })
);

router.delete(
  "/:contactId",
  errorWrapper(async (req, res) => {
    const contactToRemove = await contacts.removeContact(
      parseInt(req.params.contactId)
    );
    if (contactToRemove) {
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
  errorWrapper(async (req, res) => {
    if (!Object.keys(req.body).length) {
      const err = { message: "missing fields" };
      return res.status(400).send(responseNormalizer(err));
    }

    const contactToUpdate = await contacts.updateContact(
      parseInt(req.params.contactId),
      req.body
    );
    if (contactToUpdate) {
      return res.status(200).send(responseNormalizer(contactToUpdate));
    } else {
      const err = { message: "Not found" };
      return res.status(404).send(responseNormalizer(err));
    }
  })
);

module.exports = router;
