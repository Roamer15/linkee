import Joi from "joi";

const registerValidator = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string()
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:"\\\\|,.<>\\/?]).{8,}$'))
  .message('Password must be at least 8 characters long, include upper and lower case letters, a number, and a special character'),
  confirmPassword: Joi.ref('password'),
  profileImageUrl: Joi.string().uri().pattern(/\.(jpeg|jpg|gif|png)$/i).allow("").optional()
})

export const registrationValidator = (req, res, next) => {
  const { error } = registerValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const loginSchema = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().required(),
})

export const loginValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
