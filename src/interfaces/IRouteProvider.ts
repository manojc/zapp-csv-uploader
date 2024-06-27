import * as express from "express";

export interface IRouteProvider {
    configureRoutes(router: express.Router): Promise<void>;
}