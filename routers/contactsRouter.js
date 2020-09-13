const express = require("express");
const joi = require("joi");
const mongodb = require("mongodb");
const connection = require("../database/Connection");
const responseNormalizer = require("../normalizers/responseNormalizer");
// const contacts = require("../contacts");
const errorWrapper = require("../helpers/errorWrapper");

const router = express.Router();

router.get(
  "/",
  errorWrapper(async (req, res) => {
    const collection = await connection.database.collection("contacts");
    const contacts = await collection.find({}).toArray();
    res.status(200).send(responseNormalizer({ contacts }));
  })
);

router.get(
  "/:contactId",
  errorWrapper(async (req, res) => {
    const collection = await connection.database.collection("contacts");
    const contactById = await collection.findOne({
      _id: mongodb.ObjectId(req.params.contactId),
    });

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
    const error = await joi
      .object({
        name: joi.string().min(3).required(),
        email: joi.string().min(5).required(),
        phone: joi.number().min(6).required(),
        subscription: joi.string(),
        password: joi.string(),
      })
      .validateAsync(req.body);

    if (error.error) {
      error.error = { message: `${error.error.message} field` };
      return res.status(400).send(responseNormalizer(error.error));
    }
    const collection = await connection.database.collection("contacts");
    const contactToAdd = await collection.insertOne(req.body);

    res.status(201).send(responseNormalizer(contactToAdd));
  })
);

router.delete(
  "/:contactId",
  errorWrapper(async (req, res) => {
    const { contactId } = req.params;

    const collection = connection.getCollection("contacts");

    const contactToRemove = await collection.findOne({
      _id: mongodb.ObjectId(contactId),
    });
    if (contactToRemove) {
      await collection.removeOne(contactToRemove);
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

    const { contactId } = req.params;
    const collection = connection.getCollection("contacts");
    const contactToUpdate = await collection.findOne({
      _id: mongodb.ObjectId(contactId),
    });

    if (contactToUpdate) {
      const updatedContact = await collection.updateOne(
        { _id: mongodb.ObjectId(contactId) },
        {
          $set: req.body,
        }
      );
      return res.status(200).send(responseNormalizer(updatedContact));
    } else {
      const err = { message: "Not found" };
      return res.status(404).send(responseNormalizer(err));
    }
  })
);

module.exports = router;
