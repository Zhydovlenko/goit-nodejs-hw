const responseNormalizer = (object) => {
  let isError = false;

  if (object instanceof Error) {
    isError = true;
  }

  return {
    success: !isError,
    data: object,
    message: isError ? object.message : undefined,
  };
};

module.exports = responseNormalizer;
