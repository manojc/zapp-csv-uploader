import * as Models from "../models/Csv";

export interface IDBProvider {
    countRecordsAsync(): Promise<number>;
    paginateAsync(page: number, pageSize: number): Promise<Models.ICSVRow[]>;
    insertManyAsync(records: Models.ICSVRow[]): Promise<void>;
    updateRecordByIdAsync(id: number, record: Models.ICSVRow): Promise<void>;
    deleteRecordByIdAsync(id: number): Promise<void>;
}