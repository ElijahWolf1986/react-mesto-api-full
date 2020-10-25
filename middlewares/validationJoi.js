const { celebrate, Joi } = require('celebrate');
const passwordComplexity = require('joi-password-complexity');

const complexityOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 0,
  numeric: 0,
  symbol: 1,
  requirementCount: 2,
};
const urlPattern = /^(https?:\/\/)?([\w-]{1,32}\.[\w-]{1,32})[^\s@]*$/;

const validateSignin = celebrate({
  body: Joi.object()
    .keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    })
    .unknown(true),
});

const validateSignup = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
      avatar: Joi.string().regex(urlPattern).required(),
      email: Joi.string().required().email(),
      password: passwordComplexity(complexityOptions),
    })
    .unknown(true),
});

const validateCreateCard = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().regex(urlPattern).required(),
      owner: Joi.string().hex().length(24),
    })
    .unknown(true),
});

const validateDeleteCard = celebrate({
  params: Joi.object()
    .keys({
      cardId: Joi.string().hex().length(24),
    })
    .unknown(true),
});

const validateGetUser = celebrate({
  params: Joi.object()
    .keys({
      id: Joi.string().hex().length(24),
    })
    .unknown(true),
});

module.exports = {
  validateSignin,
  validateSignup,
  validateCreateCard,
  validateDeleteCard,
  validateGetUser,
};
