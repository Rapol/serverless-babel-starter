import Joi from 'joi';

export default {
    apiRequest: Joi.object().keys({
        name: Joi.string()
            .required(),
    }).required(),
};

