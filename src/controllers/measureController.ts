import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Measure } from '../models/measure'; // Supondo que o modelo Measure está no caminho correto
import { v4 as uuidv4 } from 'uuid';
import { getMeasureValueFromImage } from '../services/geminiService'; // Importe a função do arquivo correto
import path from 'path';
import fs from 'fs';

// Schemas de validação
const uploadSchema = Joi.object({
    image: Joi.string().base64().required(),
    customer_code: Joi.string().required(),
    measure_datetime: Joi.date().iso().required(), // Use .iso() se estiver esperando uma string no formato ISO
    measure_type: Joi.string().valid('WATER', 'GAS').required()
});

const confirmSchema = Joi.object({
    measure_uuid: Joi.string().required(),
    confirmed_value: Joi.number().required()
});

// Valida dados de upload
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

// Valida dados de confirmação
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

// Função para verificar duplicidade
const checkForDuplicateMeasure = async (customer_code: string, measure_type: string, measure_datetime: Date) => {
    console.log('measure_datetime:', measure_datetime);
    console.log('Type of measure_datetime:', typeof measure_datetime);
    
    // Converter a string para um objeto Date
    const measureDatetime = new Date(measure_datetime);

    const startOfMonth = new Date(measureDatetime.getFullYear(), measureDatetime.getMonth(), 1);
    const endOfMonth = new Date(measureDatetime.getFullYear(), measureDatetime.getMonth() + 1, 0);

    const duplicate = await Measure.findOne({
        where: {
            customer_code,
            measure_type,
            measure_datetime: {
                [Op.between]: [startOfMonth, endOfMonth]
            }
        }
    });

    return duplicate;
};

// Função para salvar a imagem em um diretório público
const saveImageToPublic = (imageBase64: string, fileName: string) => {
    const buffer = Buffer.from(imageBase64, 'base64');
    const filePath = path.join(__dirname, '../public/images', fileName);
    return fs.promises.writeFile(filePath, buffer);
};

// Controlador para upload de medida
export const uploadMeasure = async (req: Request, res: Response) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    try {
        // Verifica duplicidade
        const duplicateMeasure = await checkForDuplicateMeasure(customer_code, measure_type, measure_datetime);
        if (duplicateMeasure) {
            return res.status(409).json({
                error_code: "DOUBLE_REPORT",
                error_description: "Leitura do mês já realizada"
            });
        }

        // Chama a API do Google Gemini para reconhecimento de valor usando a imagem em base64
        const measure_value = await getMeasureValueFromImage(image);

        // Gera um UUID para a medida
        const measure_uuid = uuidv4();

        // Define o nome da imagem
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
            has_confirmed: false
        });

        return res.status(200).json({
            image_url,
            measure_value,
            measure_uuid
        });

    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({
                error_code: "INTERNAL_ERROR",
                error_description: err.message
            });
        }
        return res.status(500).json({
            error_code: "INTERNAL_ERROR",
            error_description: "Erro desconhecido"
        });
    }
};

// Controlador para confirmar medida
export const confirmMeasure = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body;

    try {
        const measure = await Measure.findOne({ where: { measure_uuid } });

        if (!measure) {
            return res.status(404).json({
                error_code: "MEASURE_NOT_FOUND",
                error_description: "Medida não encontrada"
            });
        }

        if (measure.has_confirmed) {
            return res.status(409).json({
                error_code: "CONFIRMATION_DUPLICATE",
                error_description: "Leitura do mês já realizada"
            });
        }

        measure.has_confirmed = true;
        measure.measure_value = confirmed_value;
        await measure.save();

        return res.status(200).json({
            success: true
        });

    } catch (err) {
        if (err instanceof Error) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: err.message
            });
        }
        return res.status(500).json({
            error_code: "INTERNAL_ERROR",
            error_description: "Erro desconhecido"
        });
    }
};

// Controlador para listar medidas
export const listMeasures = async (req: Request, res: Response) => {
    const { customer_code } = req.params;
    const measure_type = typeof req.query.measure_type === 'string' ? req.query.measure_type : undefined;

    try {
        // Validação do parâmetro measure_type
        if (measure_type && !['WATER', 'GAS'].includes(measure_type.toUpperCase())) {
            return res.status(400).json({
                error_code: "INVALID_TYPE",
                error_description: "Tipo de medição não permitida"
            });
        }

        // Construção da consulta com possível filtro por measure_type
        const whereClause: any = { customer_code };
        if (measure_type) {
            whereClause.measure_type = measure_type.toUpperCase();
        }

        // Busca as medidas no banco de dados
        const measures = await Measure.findAll({ where: whereClause });

        // Verifica se foram encontradas medidas
        if (measures.length === 0) {
            return res.status(404).json({
                error_code: "MEASURES_NOT_FOUND",
                error_description: "Nenhuma leitura encontrada"
            });
        }

        // Estrutura de resposta
        return res.status(200).json({
            customer_code,
            measures: measures.map(measure => ({
                measure_uuid: measure.measure_uuid,
                measure_datetime: measure.measure_datetime,
                measure_type: measure.measure_type,
                has_confirmed: measure.has_confirmed,
                image_url: measure.image_url
            }))
        });

    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({
                error_code: "INTERNAL_ERROR",
                error_description: err.message
            });
        }
        return res.status(500).json({
            error_code: "INTERNAL_ERROR",
            error_description: "Erro desconhecido"
        });
    }
};
