import { boolean } from "boolean";
import { User } from "../interfaces/User";
import { db } from "../utils/firebase-admin";
import { UsersProfileViews } from "../models/UsersProfileViews";
import FirebaseFirestore from "firebase-admin/lib/firestore";
import { IMysqlEvent } from "../types/MysqlEvent";
const MySQLEvents = require("@rodrigogs/mysql-events");

class UsersController {
  public createUser = async (
    user: User
  ): Promise<
    FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  > => {
    let numberOfViews = await UsersProfileViews.query()
      .select("id")
      .where("viewedUserId", user.id);

    await db
      .collection("users")
      .doc(user.uuid)
      .set({
        avatarUrl: user.avatarUrl,
        fullName: user.fullName,
        isVerified: boolean(user.isVerified),
        numberOfViews: numberOfViews.length,
        type: "USER",
        userId: user.id,
        username: user.username,
      });

    const createdUser = await db.collection("users").doc(user.uuid).get();

    return createdUser;
  };

  public executeAction = async (event: IMysqlEvent): Promise<void> => {
    if (!event.affectedRows || event.affectedRows.length === 0) return;

    if (event.type === MySQLEvents.STATEMENTS.INSERT) {
      const user =
        event.affectedRows &&
        event.affectedRows.length > 0 &&
        event.affectedRows[0].after
          ? event.affectedRows[0].after
          : null;
      if (user) {
        const userDoc = await this.createUser(user);
        console.log(`Utente ${user.username} creato nella collection users`);
      }
    } else if (event.type === MySQLEvents.STATEMENTS.UPDATE) {
      const user =
        event.affectedRows &&
        event.affectedRows.length > 0 &&
        event.affectedRows[0].after
          ? event.affectedRows[0].after
          : null;

      // Controllo se è stato modificato il campo deletedAt
      if (
        event.affectedColumns &&
        event.affectedColumns.includes("deletedAt")
      ) {
        let userDoc = await db.collection("users").doc(user.uuid).get();
        if (userDoc.exists) {
          await db.collection("users").doc(user.uuid).delete();
          console.log(
            `Utente ${user.username} eliminato dalla collection users`
          );
        }
      } else if (
        event.affectedColumns &&
        (event.affectedColumns.includes("username") ||
          event.affectedColumns.includes("fullName") ||
          event.affectedColumns.includes("avatarUrl") ||
          event.affectedColumns.includes("isVerified"))
      ) {
        let userDoc = await db.collection("users").doc(user.uuid).get();
        if (!userDoc.exists) {
          // Lo creo nella collection users
          userDoc = await this.createUser(user);
        }

        let userDocData = userDoc.data();
        if (userDocData) {
          // Nella collection users aggiorno i campi username, fullName, avatarUrl e isVerified
          await db
            .collection("users")
            .doc(user.uuid)
            .update({
              avatarUrl: user.avatarUrl,
              fullName: user.fullName,
              isVerified: boolean(user.isVerified),
              username: user.username,
            });

          console.log(
            `Utente ${user.username} aggiornato nella collection users`
          );
        }
      }
    } else if (event.type === MySQLEvents.STATEMENTS.DELETE) {
      const user =
        event.affectedRows &&
        event.affectedRows.length > 0 &&
        event.affectedRows[0].before
          ? event.affectedRows[0].before
          : null;
      if (user) {
        let userDoc = await db.collection("users").doc(user.uuid).get();
        if (userDoc.exists) {
          await db.collection("users").doc(user.uuid).delete();
          console.log(
            `Utente ${user.username} eliminato dalla collection users`
          );
        }
      }
    } else {
      throw new Error("Tipo di evento non gestito");
    }
  };
}

export default UsersController;
