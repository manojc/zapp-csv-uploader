import Joi, { number } from "joi";

export interface ICSVRow {
    id?: number,
    quantity: number;
    sku: string;
    description?: string;
    store: string;
}

export interface IListRequest {
    page_size: number;
    page_number: number;
}

export const csvRowSchema = Joi.object({
    quantity: Joi.number().required().min(0),
    sku: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    store: Joi.string().required()
}).custom((value: ICSVRow) => {
    value.description = value.description || "";
    return value;
});

export const csvRowUpdateSchema = Joi.object({
    quantity: Joi.number().required().min(0),
    description: Joi.string().allow("").optional()
}).custom((value: ICSVRow) => {
    value.description = value.description || "";
    return value;
});

export const csvRowsSchema = Joi.array().items(csvRowSchema).min(1);

export const listRequestSchema = Joi.object({
    page_size: Joi.number().required().min(1).default(20),
    page_number: Joi.number().required().min(1).default(1)
});