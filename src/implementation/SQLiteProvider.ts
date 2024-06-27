import { injectable } from "inversify";
import Config from "../settings/Config";
import * as Models from "../models/Csv";
import sqlite3, { Database } from "sqlite3";
import { IDBProvider } from "../interfaces/IDBProvider";

@injectable()
export class SQLiteProvider implements IDBProvider {

    private readonly db: Database;

    public constructor() {
        this.db = new sqlite3.Database(Config.db.path, (err: Error | null) => {
            if (err) {
                console.error("Failed to connect to the database:", err.message);
                throw err;
            }
            console.log("Connected to the SQLite database.");
            this.createTableIfNotExists();
        });
    }

    public async countRecordsAsync(): Promise<number> {
        const countQuery = `SELECT COUNT(*) as count FROM ${Config.db.table}`;

        return new Promise<number>((resolve, reject) => {
            this.db.get<{ count: number }>(countQuery, [], (err, row) => {
                if (err) {
                    console.error('Error counting records:', err.message);
                    return reject(err);
                }
                resolve(row?.count || 0);
            });
        });
    }

    public async paginateAsync(page: number, pageSize: number): Promise<Models.ICSVRow[]> {
        const offset = (page - 1) * pageSize;
        const paginatedQuery = `SELECT * FROM ${Config.db.table} LIMIT ${pageSize} OFFSET ${offset}`;

        return new Promise<Models.ICSVRow[]>((resolve, reject) => {
            this.db.all<Models.ICSVRow>(paginatedQuery, [], (err, rows) => {
                if (err) {
                    console.error('Error running query:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    public async insertManyAsync(records: Models.ICSVRow[]): Promise<void> {
        if (records.length === 0) {
            return;
        }

        const query = ` REPLACE INTO ${Config.db.table} (sku, quantity, description, store) 
                        VALUES ${records.map(record => `('${record.sku}', ${record.quantity}, '${record.description}', '${record.store}')`).join(", ")};
                    `;

        return new Promise<void>((resolve, reject) => {
            this.db.run(query, function (err) {
                if (err) {
                    console.error("Error inserting record:", err.message);
                    return reject(new Error("Error inserting record: " + err.message));
                }
                resolve();
            });
        });
    }

    public async updateRecordByIdAsync(id: number, record: Models.ICSVRow): Promise<void> {
        const query = ` UPDATE ${Config.db.table}
                        SET 
                            quantity = ${record.quantity},
                            description = '${record.description}'
                        WHERE id = ${id};
                    `;

        return new Promise<void>((resolve, reject) => {
            this.db.run(query, function (err) {
                if (err) {
                    console.error("Error updating record:", err.message);
                    return reject(new Error("Error updating record: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("No record found with the specified ID " + id));
                }
                resolve();
            });
        });
    }

    public async deleteRecordByIdAsync(id: number): Promise<void> {
        const query = `DELETE FROM ${Config.db.table} WHERE id = ${id}`;

        return new Promise<void>((resolve, reject) => {
            this.db.run(query, function (err) {
                if (err) {
                    console.error("Error deleting record:", err.message);
                    return reject(new Error("Error deleting record: " + err.message));
                }
                if (this.changes === 0) {
                    return reject(new Error("No record found with the specified ID " + id));
                }
                resolve();
            });
        });
    }

    private createTableIfNotExists(): void {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${Config.db.table} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quantity INTEGER NOT NULL,
                sku TEXT NOT NULL UNIQUE,
                description TEXT,
                store TEXT NOT NULL
            );
        `;

        this.db.run(createTableQuery, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                throw err;
            }
            console.log(`${Config.db.table} table has been created or already exists.`);
        });
    }
}
