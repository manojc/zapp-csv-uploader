import csvParser from "csv-parser";
import { Readable } from "stream";
import * as Models from "../models/Csv";
import Config from "../settings/Config";
import { inject, injectable } from "inversify";
import { Request, Response, Router } from "express";
import { requestValidator } from "./RequestValidator";
import { IDBProvider } from "../interfaces/IDBProvider";
import { IRouteProvider } from "../interfaces/IRouteProvider";

@injectable()
export class CsvRoutes implements IRouteProvider {

    constructor(@inject(Config.dependency_keys.SQLiteService) public readonly sqliteService: IDBProvider) { }

    public async configureRoutes(router: Router): Promise<void> {

        router.post("/csv/upload", Config.upload_middleware.single("file"), async (request: Request, response: Response) => {
            try {
                const file: Express.Multer.File = request["file"];

                if (!file?.buffer) {
                    response.status(400).send({ error: "No CSV/TSV file uploaded" });
                    return;
                }

                const csv_records: any[] = await this._readCsv(file);

                const validation_result = Models.csvRowsSchema.validate(csv_records);
                if (!!validation_result?.error) {
                    response.status(422).send(validation_result.error.message);
                    return;
                }

                await this.sqliteService.insertManyAsync(csv_records);
                response.sendStatus(204);
            } catch (error) {
                console.error(error);
                response.status(500).send({ error: error.message });
            }

        });

        router.post("/csv/list", requestValidator(Models.listRequestSchema), async (request: Request, response: Response) => {
            try {
                const pagination_request: Models.IListRequest = request.body;
                const [db_response, count] = await Promise.all([
                    this.sqliteService.paginateAsync(
                        pagination_request.page_number,
                        pagination_request.page_size
                    ),
                    this.sqliteService.countRecordsAsync()
                ]);
                response.status(200).send({ rows: db_response, totalCount: count });
            } catch (error) {
                console.error(error);
                response.status(500).send({ error: error.message });
            }
        });

        router.post("/csv", requestValidator(Models.csvRowSchema), async (request: Request, response: Response) => {
            try {
                const csv_row: Models.ICSVRow = request.body;
                await this.sqliteService.insertManyAsync([csv_row]);
                response.sendStatus(204);
            } catch (error) {
                console.error(error);
                response.status(500).send({ error: error.message });
            }
        });

        router.put("/csv/:id", requestValidator(Models.csvRowUpdateSchema), async (request: Request, response: Response) => {
            try {
                if (isNaN(parseInt(request?.params?.id))) {
                    response.status(400).send({ error: "Invalid ID" });
                    return;
                }
                const csv_row: Models.ICSVRow = request.body;
                await this.sqliteService.updateRecordByIdAsync(parseInt(request.params.id), csv_row);
                response.sendStatus(204);
            } catch (error) {
                console.error(error);
                response.status(500).send({ error: error.message });
            }
        });

        router.delete("/csv/:id", async (request: Request, response: Response) => {
            try {
                if (isNaN(parseInt(request?.params?.id))) {
                    response.status(400).send({ error: "Invalid ID" });
                    return;
                }
                await this.sqliteService.deleteRecordByIdAsync(parseInt(request.params.id));
                response.sendStatus(204);
            } catch (error) {
                console.error(error);
                response.status(500).send({ error: error.message });
            }
        });

    }

    private _readCsv(file: Express.Multer.File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            Readable.from(file.buffer).pipe(csvParser())
                .on("data", (data) => results.push(data))
                .on("end", () => resolve(results))
                .on("error", reject);
        })
    }
}
