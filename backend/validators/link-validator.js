import Joi from "joi";

const linkValidator = Joi.object({
  longUrl: Joi.string().uri().required().messages({
    'string.base': 'The longUrl must be a string.',
    'string.uri': 'The longUrl must be a valid URI.',
    'any.required': 'The longUrl field is required.',
  }),
  customCode: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,6}$')).optional().messages({
    'string.base': 'The customCode must be a string.',
    'string.pattern.base': 'The customCode must be 4 - 6 characters long and contain only letters and numbers.',
  }),
  expiresAt: Joi.date().iso().greater('now').optional().messages({
    'date.base': 'The expiresAt must be a valid date.',
    'date.format': 'The expiresAt must be in ISO 8601 date format.',
    'date.greater': 'The expiresAt must be a future date.',
  }),
})

export const linkInputValidator = (req, res, next) => {
  const { error } = linkValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};