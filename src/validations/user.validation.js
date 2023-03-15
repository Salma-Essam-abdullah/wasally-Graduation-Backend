const Joi = require('joi');
const {
  password,
  objectId,
  phoneNumber
} = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().custom(phoneNumber),
    password: Joi.string().custom(password),
    confirmpassword: Joi.string().custom(password),
    name: Joi.string().required(),

    role: Joi.string().valid('user', 'admin'),
    // confirmPassword: Joi.string().required().valid(Joi.ref('password')),

    birthdate: Joi
      .date()
      .max('01-01-2003')
      .iso()
      .messages({
        'date.format': `Date format is YYYY-MM-DD`,
        'date.max': `Age must be 18+`
      }),
    city: Joi.string(),
    governorate: Joi.string(),
    address:Joi.string(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      phoneNumber: Joi.string().custom(phoneNumber),
      password: Joi.string().custom(password),
      name: Joi.string(),
      birthdate: Joi
        .date()
        .max('01-01-2003')
        .iso()
        .messages({
          'date.format': `Date format is YYYY-MM-DD`,
          'date.max': `Age must be 18+`
        }),
      city: Joi.string(),
      governorate: Joi.string(),
      address:Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
const profileImage = {
  body: Joi.object()
    .keys({
      ProfileImage: Joi.string(),
    })


};


module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  profileImage
};
