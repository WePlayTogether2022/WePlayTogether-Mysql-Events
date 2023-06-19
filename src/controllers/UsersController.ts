import { User } from "../interfaces/User";
import GetStreamService from "../services/GetStreamService";
import { IMysqlEvent } from "../types/MysqlEvent";
import { Users } from "../models/Users";
import { boolean } from "boolean";

class UsersController {
  private GetStream: GetStreamService | undefined;

  constructor() {
    if (process.env.GETSTREAM_API_KEY && process.env.GETSTREAM_API_SECRET) {
      this.GetStream = new GetStreamService(
        process.env.GETSTREAM_API_KEY,
        process.env.GETSTREAM_API_SECRET
      );
    }
  }

  public async createUser(event: IMysqlEvent) {
    if (!this.GetStream) throw new Error("GetStream Class not initialized");
    if (
      event.affectedRows &&
      event.affectedRows.length > 0 &&
      event.affectedRows[0].after
    ) {
      let user: User = event.affectedRows[0].after;
      let dbUser = await Users.query().findById(user.id).whereNull("deletedAt");

      if (!dbUser) throw new Error("Utente non trovato");
      if (boolean(dbUser.hasGetStreamAccount))
        throw new Error(
          `L'utente con uuid ${user.uuid} ha già un account GetStream`
        );

      const isSuccess = await this.GetStream.saveGetStreamUser(user);
      if (!isSuccess)
        throw new Error(
          `Errore durante la creazione dell'account GetStream per l'utente con uuid ${user.uuid}`
        );

      // Aggiorno il campo hasGetStreamAccount
      await Users.query()
        .findById(user.id)
        .patch({ hasGetStreamAccount: true });

      console.log(`Utente con uuid ${user.uuid} salvato in GetStream`);
    }
  }

  public async updateUser(event: IMysqlEvent) {
    if (!this.GetStream) throw new Error("GetStream Class not initialized");
    // Controllo se è cambiato lo username/avatarUrl
    if (
      event.affectedColumns &&
      event.affectedColumns.length > 0 &&
      (event.affectedColumns.includes("username") ||
        event.affectedColumns.includes("avatarUrl"))
    ) {
      if (event.affectedRows && event.affectedRows.length > 0) {
        let user: User = event.affectedRows[0].after;
        let dbUser = await Users.query()
          .findById(user.id)
          .whereNull("deletedAt");
        if (!dbUser) throw new Error("Utente non trovato");
        if (!boolean(dbUser.hasGetStreamAccount))
          throw new Error("Utente non ha un account GetStream");

        const isSuccess = await this.GetStream.saveGetStreamUser(user);
        if (!isSuccess) throw new Error("GetStream error");

        console.log(`Utente con uuid ${user.uuid} aggiornato in GetStream`);
      }
    }
  }

  public async deleteUser(event: IMysqlEvent) {
    if (!this.GetStream) throw new Error("GetStream Class not initialized");
    if (
      event.affectedColumns &&
      event.affectedColumns.length > 0 &&
      event.affectedColumns.includes("deletedAt")
    ) {
      if (event.affectedRows && event.affectedRows.length > 0) {
        let user: User = event.affectedRows[0].before;
        let dbUser = await Users.query()
          .findById(user.id)
          .whereNotNull("deletedAt");
        if (!dbUser) throw new Error("Utente non trovato");
        if (!boolean(dbUser.hasGetStreamAccount))
          throw new Error("Utente non ha un account GetStream");

        const isSuccess = await this.GetStream.deleteGetStreamUser(user.uuid);
        if (!isSuccess) throw new Error("GetStream error");

        console.log(`Utente con uuid ${user.uuid} eliminato in GetStream`);
      }
    }
  }
}

export default UsersController;
