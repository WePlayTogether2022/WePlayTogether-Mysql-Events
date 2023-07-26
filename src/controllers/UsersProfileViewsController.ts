import { Users } from "../models/Users";
import { IMysqlEvent } from "../types/MysqlEvent";
import { db } from "../utils/firebase-admin";
import UsersController from "./UsersController";
const MySQLEvents = require("@rodrigogs/mysql-events");

class UsersProfileViewsController {
  constructor() {}

  public executeAction = async (event: IMysqlEvent): Promise<void> => {
    if (!event.affectedRows || event.affectedRows.length === 0) return;

    if (event.type === MySQLEvents.STATEMENTS.INSERT) {
      let userProfileView =
        event.affectedRows &&
        event.affectedRows.length > 0 &&
        event.affectedRows[0].after
          ? event.affectedRows[0].after
          : null;
      if (userProfileView) {
        let viewedUserId = userProfileView.viewedUserId;
        let user = await Users.query()
          .findById(viewedUserId)
          .whereNull("deletedAt");
        if (user) {
          // Provo la recuperare l'utente dalla collection users
          let userDoc = await db.collection("users").doc(user.uuid).get();
          if (!userDoc.exists) {
            // Lo creo nella collection users
            userDoc = await new UsersController().createUser(user);
          }

          let userDocData = userDoc.data();
          if (userDocData) {
            // Nella collection users aggirono il campo numberOfViews
            let numberOfViews = userDocData.numberOfViews + 1;
            await db.collection("users").doc(user.uuid).update({
              numberOfViews: numberOfViews,
            });

            console.log(
              `Utente ${user.username}: ${numberOfViews} visualizzazioni`
            );
          }
        }
      }
    } else if (event.type === MySQLEvents.STATEMENTS.UPDATE) {
      // Controllo se è stato modificato il campo deletedAt
      if (
        event.affectedColumns &&
        event.affectedColumns.includes("deletedAt")
      ) {
        console.log("Document successfully deleted!");
      } else if (
        event.affectedColumns &&
        event.affectedColumns.includes("username")
      ) {
        console.log("Document successfully updated!");
      }
    } else if (event.type === MySQLEvents.STATEMENTS.DELETE) {
      const userProfileView =
        event.affectedRows &&
        event.affectedRows.length > 0 &&
        event.affectedRows[0].before
          ? event.affectedRows[0].before
          : null;
      if (userProfileView) {
        let viewedUserId = userProfileView.viewedUserId;
        let user = await Users.query()
          .findById(viewedUserId)
          .whereNull("deletedAt");
        if (user) {
          // Provo la recuperare l'utente dalla collection users
          let userDoc = await db.collection("users").doc(user.uuid).get();
          if (!userDoc.exists) {
            // Lo creo nella collection users
            userDoc = await new UsersController().createUser(user);
          }

          let userDocData = userDoc.data();
          if (userDocData) {
            // Nella collection users aggirono il campo numberOfViews
            let numberOfViews = userDocData.numberOfViews - 1;
            await db.collection("users").doc(user.uuid).update({
              numberOfViews: numberOfViews,
            });

            console.log(
              `Utente ${user.username}: ${numberOfViews} visualizzazioni`
            );
          }
        }
      }
    } else {
      throw new Error("Tipo di evento non gestito");
    }
  };
}

export default UsersProfileViewsController;
