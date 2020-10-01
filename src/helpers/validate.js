const { ValidationError } = require("./errorHelper");

module.exports = (schema, data) => {
  const { error: validationError } = schema.validate(data);

  if (!validationError) return;

  throw new ValidationError("Bad request");
};
