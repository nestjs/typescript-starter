// import * as Joi from '@hapi/joi';
import * as Joi from 'joi';

export const CreateCatSchema = Joi.object().keys({
  name: Joi.string().required(),
  age: Joi.number().required(),
  breed: Joi.string().required(),
});
