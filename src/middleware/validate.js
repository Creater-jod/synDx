function validate(validatorFn) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a valid JSON object.' });
    }

    const result = validatorFn(req.body, req.params);
    if (result && result.error) {
      return res.status(400).json({ error: result.error, details: result.details });
    }

    next();
  };
}

module.exports = validate;
