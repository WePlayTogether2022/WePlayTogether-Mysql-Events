import mysql from "mysql";
const MySQLEvents = require("@rodrigogs/mysql-events");
import "dotenv/config";
import { IMysqlEvent } from "./types/MysqlEvent";
import { Model } from "objection";
import Knex from "knex";
import { Users } from "./models/Users";
import UsersProfileViewsController from "./controllers/UsersProfileViewsController";
import logger from "./utils/logger";
import { UsersProfileViews } from "./models/UsersProfileViews";
import UsersController from "./controllers/UsersController";

const dbConnection = {
  client: "mysql",
  connection: {
    charset: "utf8",
    timezone: "UTC",
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  pool: {
    min: 2,
    max: 10,
  },
};

const knex = Knex(dbConnection);

const MAX_RETRIES = 3; // Numero massimo di tentativi di retry
const INITIAL_DELAY = 1000; // Ritardo iniziale tra i tentativi di retry (in millisecondi)

const program = async () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  Model.knex(knex);

  const instance = new MySQLEvents(connection, {
    startAtEnd: true,
  });

  await instance.start();

  const executeWithRetry = async (action: () => Promise<void>, retries = 0) => {
    try {
      await action();
    } catch (error) {
      logger.debug(
        `Errore durante l'esecuzione dell'azione (retry ${retries}): ${JSON.stringify(
          error,
          null,
          2
        )}`
      ); // `

      if (retries < MAX_RETRIES) {
        const delay = INITIAL_DELAY * Math.pow(2, retries); // Calcolo del ritardo esponenziale
        await new Promise((resolve) => setTimeout(resolve, delay));
        await executeWithRetry(action, retries + 1); // Riprova l'azione ricorsivamente
      } else {
        throw error; // Se si raggiunge il numero massimo di tentativi, rilancia l'errore
      }
    }
  };

  instance.addTrigger({
    name: "monitoring users_profile_views",
    expression: `${process.env.DB_DATABASE}.${UsersProfileViews.tableName}.*`,
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: async (event: IMysqlEvent) => {
      if (!event.table || event.table !== UsersProfileViews.tableName) return;

      let controller = new UsersProfileViewsController();

      executeWithRetry(() => controller.executeAction(event))
        .then(() => {})
        .catch((error) => {
          // Scrivo l'errore nel log
          logger.error(
            `Errore durante l'esecuzione dell'azione (Failed after ${MAX_RETRIES} retries): ${JSON.stringify(
              error,
              null,
              2
            )}`
          );
        });
    },
  });

  instance.addTrigger({
    name: "monitoring users",
    expression: `${process.env.DB_DATABASE}.${Users.tableName}.*`,
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: async (event: IMysqlEvent) => {
      if (!event.table || event.table !== Users.tableName) return;

      let controller = new UsersController();

      executeWithRetry(() => controller.executeAction(event))
        .then(() => {})
        .catch((error) => {
          // Scrivo l'errore nel log
          logger.error(
            `Errore durante l'esecuzione dell'azione (Failed after ${MAX_RETRIES} retries): ${JSON.stringify(
              error,
              null,
              2
            )}`
          );
        });
    },
  });

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
  .then(() => {
    console.log(`=================================`);
    console.log(`======= DB: ${process.env.DB_HOST} =======`);
    console.log("Waiting for database events...");
    console.log(`=================================`);
  })
  .catch(console.error);
