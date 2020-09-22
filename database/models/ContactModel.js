const mongoose = require("mongoose");
const joi = require("joi");

const { Schema } = mongoose;

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: {
      validator(email) {
        const { error } = joi.string().email().validate(email);

        if (error) throw new Error("Email not valid");
      },
    },
  },
  phone: { type: String, required: true },
  subscription: { type: String, required: true },
  password: { type: String, required: true },
  token: String,
});

module.exports = mongoose.model("Contact", contactSchema);
