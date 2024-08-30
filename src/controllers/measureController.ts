import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';
import { Measure } from '../models/measure';
import { v4 as uuidv4 } from 'uuid';
import { getMeasureValueFromImage } from '../services/geminiService';

// Schemas de validação
const uploadSchema = Joi.object({
    image: Joi.string().base64().required(),
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().iso().required(),
    measure_type: Joi.string().valid('WATER', 'GAS').required(),
});

const confirmSchema = Joi.object({
    measure_uuid: Joi.string().required(),
    confirmed_value: Joi.number().required(),
});

// Mensagens de Erro
const ERROR_MESSAGES = {
    INVALID_DATA: 'Dados inválidos',
    DOUBLE_REPORT: 'Leitura do mês já realizada',
    INTERNAL_ERROR: 'Erro interno',
    MEASURE_NOT_FOUND: 'Medida não encontrada',
    CONFIRMATION_DUPLICATE: 'Confirmação duplicada',
    INVALID_TYPE: 'Tipo de medição não permitida',
    MEASURES_NOT_FOUND: 'Nenhuma leitura encontrada',
};

// Função de Resposta de Erro
const sendErrorResponse = (res: Response, status: number, code: string, description: string) => {
    return res.status(status).json({
        error_code: code,
        error_description: description,
    });
};

// Valida dados de upload
export const validateUploadData = (req: Request, res: Response, next: NextFunction) => {
    const { error } = uploadSchema.validate(req.body);
    if (error) {
        return sendErrorResponse(res, 400, 'INVALID_DATA', error.details[0].message);
    }
    next();
};

// Valida dados de confirmação
export const validateConfirmData = (req: Request, res: Response, next: NextFunction) => {
    const { error } = confirmSchema.validate(req.body);
    if (error) {
        return sendErrorResponse(res, 400, 'INVALID_DATA', error.details[0].message);
    }
    next();
};

// Função para verificar duplicidade
const checkForDuplicateMeasure = async (customer_code: string, measure_type: string, measure_datetime: Date) => {
    const measureDatetime = new Date(measure_datetime);
    const startOfMonth = new Date(measureDatetime.getFullYear(), measureDatetime.getMonth(), 1);
    const endOfMonth = new Date(measureDatetime.getFullYear(), measureDatetime.getMonth() + 1, 0);

    return Measure.findOne({
        where: {
            customer_code,
            measure_type,
            measure_datetime: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });
};

// Função para salvar a imagem em um diretório público
const saveImageToPublic = (imageBase64: string, fileName: string) => {
    const buffer = Buffer.from(imageBase64, 'base64');
    const filePath = path.resolve(__dirname, '../public/images', fileName);
    return fs.promises.writeFile(filePath, buffer);
};

// Controlador para upload de medida
export const uploadMeasure = async (req: Request, res: Response) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    try {
        // Verifica duplicidade
        const duplicateMeasure = await checkForDuplicateMeasure(customer_code, measure_type, measure_datetime);
        if (duplicateMeasure) {
            return sendErrorResponse(res, 409, 'DOUBLE_REPORT', ERROR_MESSAGES.DOUBLE_REPORT);
        }

        // Chama a API do Google Gemini para reconhecimento de valor usando a imagem em base64
        const measure_value = await getMeasureValueFromImage(image);

        // Gera um UUID para a medida
        const measure_uuid = uuidv4();
        const imageFileName = `${measure_uuid}.jpg`;

        // Salva a imagem no diretório público
        await saveImageToPublic(image, imageFileName);

        // Gera um URL acessível para a imagem
        const image_url = `http://localhost:3000/images/${imageFileName}`;

        // Salva a nova medida no banco de dados
        await Measure.create({
            customer_code,
            measure_datetime,
            measure_type,
            measure_value,
            image_url,
            measure_uuid,
            has_confirmed: false,
        });

        return res.status(200).json({
            image_url,
            measure_value,
            measure_uuid,
        });

    } catch (err) {
        if (err instanceof Error) {
            return sendErrorResponse(res, 500, 'INTERNAL_ERROR', err.message);
        }
        return sendErrorResponse(res, 500, 'INTERNAL_ERROR', ERROR_MESSAGES.INTERNAL_ERROR);
    }
};

// Controlador para confirmar medida
export const confirmMeasure = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body;

    try {
        const measure = await Measure.findOne({ where: { measure_uuid } });

        if (!measure) {
            return sendErrorResponse(res, 404, 'MEASURE_NOT_FOUND', ERROR_MESSAGES.MEASURE_NOT_FOUND);
        }

        if (measure.has_confirmed) {
            return sendErrorResponse(res, 409, 'CONFIRMATION_DUPLICATE', ERROR_MESSAGES.CONFIRMATION_DUPLICATE);
        }

        measure.has_confirmed = true;
        measure.measure_value = confirmed_value;
        await measure.save();

        return res.status(200).json({ success: true });

    } catch (err) {
        if (err instanceof Error) {
            return sendErrorResponse(res, 400, 'INVALID_DATA', err.message);
        }
        return sendErrorResponse(res, 500, 'INTERNAL_ERROR', ERROR_MESSAGES.INTERNAL_ERROR);
    }
};

// Controlador para listar medidas
export const listMeasures = async (req: Request, res: Response) => {
    const { customer_code } = req.params;
    const measure_type = typeof req.query.measure_type === 'string' ? req.query.measure_type : undefined;

    try {
        if (measure_type && !['WATER', 'GAS'].includes(measure_type.toUpperCase())) {
            return sendErrorResponse(res, 400, 'INVALID_TYPE', ERROR_MESSAGES.INVALID_TYPE);
        }

        const whereClause: any = { customer_code };
        if (measure_type) {
            whereClause.measure_type = measure_type.toUpperCase();
        }

        const measures = await Measure.findAll({ where: whereClause });

        if (measures.length === 0) {
            return sendErrorResponse(res, 404, 'MEASURES_NOT_FOUND', ERROR_MESSAGES.MEASURES_NOT_FOUND);
        }

        return res.status(200).json({
            customer_code,
            measures: measures.map(measure => ({
                measure_uuid: measure.measure_uuid,
                measure_datetime: measure.measure_datetime,
                measure_type: measure.measure_type,
                has_confirmed: measure.has_confirmed,
                image_url: measure.image_url,
            })),
        });

    } catch (err) {
        if (err instanceof Error) {
            return sendErrorResponse(res, 500, 'INTERNAL_ERROR', err.message);
        }
        return sendErrorResponse(res, 500, 'INTERNAL_ERROR', ERROR_MESSAGES.INTERNAL_ERROR);
    }
};
