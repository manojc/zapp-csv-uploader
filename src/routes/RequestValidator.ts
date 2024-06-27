import Joi from "joi";
import { NextFunction, Response, Request } from "express";

export function requestValidator(contract: any) {
    return async (request: Request, response: Response, next: NextFunction) => {

        let requestBody: any;
        
        if (request.method === "GET" || request.method === "DELETE") {
            requestBody = request.query;
            if (!Object.keys(requestBody).length) {
                requestBody = request.params;
            }
        } else
            requestBody = request.body;

        const schema = Joi.isSchema(contract) ? contract : Joi.object(contract);
        const result = schema.validate(requestBody, { abortEarly: false });

        result.error === undefined ? next() : response.status(422).send(result.error.message);
    };
}
