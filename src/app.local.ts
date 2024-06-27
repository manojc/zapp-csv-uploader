import "reflect-metadata";
import Config from "./settings/Config";
import { ContainerFactory } from "./container-factory";
import { IRouteProvider } from "./interfaces/IRouteProvider";
import express, { Application, Request, Response, NextFunction } from "express";

const container = ContainerFactory.getContainer();

const app: Application = express();

app.use(express.static('public'));

app.use(express.json());

app.get("/", async (req: Request, res: Response): Promise<any> => {
    return res.json({ status: "success", message: "Welcome to CSV API Service" });
});

const router = express.Router();
const routeProviders = container.getAll<IRouteProvider>(Config.dependency_keys.Routes);
routeProviders.forEach(routeProvider => routeProvider.configureRoutes(router));

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === "OPTIONS")
        res.header("Access-Control-Max-Age", "86400");
    else
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");

    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, PATCH, HEAD, DELETE, OPTIONS');

    req.method === "OPTIONS" ? res.end() : next();
});
app.use("/api", router);

app.use((error: { message: string; status: number }, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({
        status: "error",
        message: error.message
    });
    next();
});

app.listen(Config.port, () => console.log(`CSV API Service listening on port ${Config.port}`));