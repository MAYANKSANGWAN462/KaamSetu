const { validationResult } = require('express-validator');

/**
 * Runs the express-validator chains attached to a route and rejects with the
 * first error. Without this, the validation chains are decorative — they collect
 * errors that nothing ever inspects.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    message: errors.array()[0].msg
  });
};

module.exports = { validate };
