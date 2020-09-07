const responseNormalizer = require("../normalizers/responseNormalizer");

const errorWrapper = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (e) {
    res.status(500).send(responseNormalizer(e));
  }
};

module.exports = errorWrapper;
