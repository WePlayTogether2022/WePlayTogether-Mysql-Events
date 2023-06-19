import mysql from "mysql";
const MySQLEvents = require("@rodrigogs/mysql-events");
import "dotenv/config";
import { IMysqlEvent } from "./types/MysqlEvent";
import GetStreamService from "./services/GetStreamService";
import { User } from "./interfaces/User";
import { Model } from "objection";
import Knex from "knex";
import { Users } from "./models/Users";
import { Guilds } from "./models/Guilds";
import { Guild } from "./interfaces/Guild";
import { GetstreamChannels } from "./models/GetstreamChannels";
import { boolean } from "boolean";
import GetstreamChannelsController from "./controllers/GetstreamChannelsController";
import UsersController from "./controllers/UsersController";
import { GetstreamChannel } from "./interfaces/GetstreamChannel";
import GetstreamActionsController from "./controllers/GetstreamActionsController";
import { GetstreamActions } from "./models/GetstreamActions";

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

  instance.addTrigger({
    name: "monitoring getstream_actions",
    expression: "WptDev.getstream_actions.*",
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: async (event: IMysqlEvent) => {
      // console.log(
      //   "Evento su getstream_actions: ",
      //   JSON.stringify(event, null, 2)
      // );
      if (!event.table || event.table !== GetstreamActions.tableName) return;

      let controller = new GetstreamActionsController();

      try {
        await controller.executeAction(event);
      } catch (error) {
        console.log(error);
      }
    },
  });

  // instance.addTrigger({
  //   name: "monitoring users",
  //   expression: "WptDev.users.*",
  //   statement: MySQLEvents.STATEMENTS.ALL,
  //   onEvent: async (event: IMysqlEvent) => {
  //     if (!event.table || event.table !== Users.tableName) return;

  //     let controller = new UsersController();

  //     // You will receive the events here
  //     if (event.type) {
  //       switch (event.type) {
  //         case MySQLEvents.STATEMENTS.INSERT:
  //           await controller.createUser(event);
  //           break;
  //         case MySQLEvents.STATEMENTS.UPDATE:
  //           try {
  //             if (
  //               event.affectedRows &&
  //               event.affectedRows.length > 0 &&
  //               event.affectedColumns &&
  //               event.affectedColumns.length > 0 &&
  //               event.affectedRows[0].after &&
  //               event.affectedRows[0].before
  //             ) {
  //               if (event.affectedColumns.includes("deletedAt")) {
  //                 let afterUser: User = event.affectedRows[0].after;
  //                 if (afterUser.deletedAt !== null) {
  //                   await controller.deleteUser(event);
  //                 } else {
  //                   // Faccio il restore dell'utente in GetStream
  //                   console.log("restore", JSON.stringify(event, null, 2));
  //                 }

  //                 break;
  //               } else {
  //                 await controller.updateUser(event);
  //               }
  //             }
  //           } catch (error) {
  //             console.log(error);
  //           }
  //           break;
  //         default:
  //       }
  //     }
  //   },
  // });

  // instance.addTrigger({
  //   name: "monitoring getstream_channels",
  //   expression: "WptDev.getstream_channels.*",
  //   statement: MySQLEvents.STATEMENTS.ALL,
  //   onEvent: async (event: IMysqlEvent) => {
  //     if (!event.table || event.table !== GetstreamChannels.tableName) return;

  //     let controller = new GetstreamChannelsController();

  //     if (event.type) {
  //       switch (event.type) {
  //         case MySQLEvents.STATEMENTS.INSERT:
  //           try {
  //             await controller.createGetStreamChannel(event);
  //           } catch (error) {
  //             console.log(error);
  //           }
  //           break;
  //         case MySQLEvents.STATEMENTS.UPDATE:
  //           try {
  //             if (
  //               event.affectedRows &&
  //               event.affectedRows.length > 0 &&
  //               event.affectedColumns &&
  //               event.affectedColumns.length > 0 &&
  //               event.affectedRows[0].after &&
  //               event.affectedRows[0].before
  //             ) {
  //               if (event.affectedColumns.includes("deletedAt")) {
  //                 let afterGetstreamChannel: GetstreamChannel =
  //                   event.affectedRows[0].after;
  //                 if (afterGetstreamChannel.deletedAt !== null) {
  //                   await controller.deleteGetStreamChannel(event);
  //                 } else {
  //                   // Faccio il restore
  //                   console.log("restore", JSON.stringify(event, null, 2));
  //                 }

  //                 break;
  //               } else {
  //                 // Facio l'update
  //                 console.log("update", JSON.stringify(event, null, 2));
  //               }
  //             }
  //           } catch (error) {
  //             console.log(error);
  //           }
  //           break;
  //         default:
  //           console.log("GetstreamChannels", JSON.stringify(event, null, 2));
  //           break;
  //       }
  //     }
  //   },
  // });

  // instance.addTrigger({
  //   name: "monitoring guilds",
  //   expression: "WptDev.guilds.*",
  //   statement: MySQLEvents.STATEMENTS.ALL,
  //   onEvent: async (event: IMysqlEvent) => {
  //     if (!event.table || event.table !== Guilds.tableName) return;

  //     // You will receive the events here
  //     if (event.type) {
  //       switch (event.type) {
  //         case MySQLEvents.STATEMENTS.INSERT:
  //           break;
  //         case MySQLEvents.STATEMENTS.UPDATE:
  //           let controller = new GetstreamChannelsController();

  //           if (
  //             event.affectedRows &&
  //             event.affectedRows.length > 0 &&
  //             event.affectedColumns &&
  //             event.affectedColumns.length > 0 &&
  //             event.affectedRows[0].after &&
  //             event.affectedRows[0].before
  //           ) {
  //             // Controllo se è cambiato il name/logoUrl
  //             await controller.updateGuildGetStreamChannel(event);
  //           }
  //           break;
  //         default:
  //       }
  //     }
  //   },
  // });

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
