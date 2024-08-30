import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Esquemas de validação
const uploadSchema = Joi.object({
    image: Joi.string().base64().required(),
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().required(),
    measure_type: Joi.string().valid('WATER', 'GAS').required(),
});

const confirmSchema = Joi.object({
    measure_uuid: Joi.string().required(),
    confirmed_value: Joi.number().required(),
});

// Mensagens de Erro
const ERROR_MESSAGES = {
    INVALID_DATA: 'Dados inválidos',
};

// Função para gerar resposta de erro
const sendErrorResponse = (res: Response, status: number, code: string, description: string) => {
    return res.status(status).json({
        error_code: code,
        error_description: description,
    });
};

// Função de validação genérica
const validateSchema = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return sendErrorResponse(res, 400, 'INVALID_DATA', error.details[0].message);
    }
    next();
};

// Middleware para validação de dados de upload
export const validateUploadData = validateSchema(uploadSchema);

// Middleware para validação de dados de confirmação
export const validateConfirmData = validateSchema(confirmSchema);
