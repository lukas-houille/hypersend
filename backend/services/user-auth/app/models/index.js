import Sequelize from "sequelize";
import dbConfig from "../config/db.config.js";
import ClientModel from "./client.model.js";
import DriverModel from "./driver.model.js";
import RestaurantModel from "./restaurant.model.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    port: dbConfig.port,
    schema: dbConfig.schema,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.client = ClientModel(sequelize, Sequelize);
db.driver = DriverModel(sequelize, Sequelize);
db.restaurant = RestaurantModel(sequelize, Sequelize);

db.mymodels = {
    client: db.client,
    driver: db.driver,
    restaurant: db.restaurant,
}

export default db;