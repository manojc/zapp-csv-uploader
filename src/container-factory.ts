import { Container } from "inversify";
import Config from "./settings/Config";
import { CsvRoutes } from "./routes/CsvRoutes";
import { IDBProvider } from "./interfaces/IDBProvider";
import { IRouteProvider } from "./interfaces/IRouteProvider";
import { SQLiteProvider } from "./implementation/SQLiteProvider";

export class ContainerFactory {

    public static getContainer(): Container {
        var container = new Container({ skipBaseClassChecks: true });
        ContainerFactory.configureServices(container);
        return container;
    }

    private static configureServices(container: Container) {
        container.bind<IDBProvider>(Config.dependency_keys.SQLiteService).to(SQLiteProvider);
        container.bind<IRouteProvider>(Config.dependency_keys.Routes).to(CsvRoutes);
    }
}