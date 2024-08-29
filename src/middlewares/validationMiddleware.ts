import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const uploadSchema = Joi.object({
    image: Joi.string().base64().required(),
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().required(),
    measure_type: Joi.string().valid('WATER', 'GAS').required()
});

const confirmSchema = Joi.object({
    measure_uuid: Joi.string().required(),
    confirmed_value: Joi.number().required()
});

export const validateUploadData = (req: Request, res: Response, next: NextFunction) => {
    const { error } = uploadSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error_code: "INVALID_DATA",
            error_description: error.details[0].message
        });
    }
    next();
};

export const validateConfirmData = (req: Request, res: Response, next: NextFunction) => {
    const { error } = confirmSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error_code: "INVALID_DATA",
            error_description: error.details[0].message
        });
    }
    next();
};
