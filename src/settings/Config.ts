import DotEnv from "dotenv";
import multer from "multer";
import { join } from "path";

DotEnv.config();

const upload_middleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        file.mimetype === "text/csv" || file.mimetype === "text/tsv" ?
            cb(null, true) :
            cb(new Error("Only CSV/TSV file upload supported"));
    }
});

function generateConfig() {
    const Config = {
        env: process.env.ENV || "prod",
        port: process.env.PORT || 3000,
        db: {
            path: process.env.DB_PATH || join(__dirname, "../../sqlite_db.db"),
            table: "Items"
        },
        dependency_keys: {
            SQLiteService: "sqliteservice",
            Routes: "routes"
        },
        upload_middleware: upload_middleware
    };

    const errors = _validateConfig(Config);
    if (Array.isArray(errors) && errors.length) {
        const message = `\nconfig validations failed with following errors -\n\t${errors.join("\n\t")}\n\n`;
        console.error(message);
        throw Error(message);
    }
    return Config;
}

function _validateConfig(config) {
    const errors = [];

    if (!config.port || typeof config.port !== "string" || !parseInt(config.port) || parseInt(config.port) > 65536) {
        errors.push(`value for PORT config key (${config.port || undefined}) should be a valid port number`);
    }

    return errors;
}

export default generateConfig();