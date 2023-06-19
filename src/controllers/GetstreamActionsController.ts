import { IMysqlEvent } from "../types/MysqlEvent";
import { GetstreamAction } from "../interfaces/GetstreamAction";
import { GetstreamActions } from "../models/GetstreamActions";
import { boolean } from "boolean";
import { GetstreamChannelsTypes } from "../models/GetstreamChannelsTypes";
import { GetstreamActionsTypesNames } from "../utils/enums";
import GetStreamService from "../services/GetStreamService";
import { User } from "../interfaces/User";
import { Users } from "../models/Users";
import Objection from "objection";
import { GetstreamActionsTypes } from "../models/GetstreamActionsTypes";
import { GetstreamChannels } from "../models/GetstreamChannels";
import { GetstreamChannelsTypesNames } from "../costants/enums";
import { UsersMessagingChannels } from "../models/UsersMessagingChannels";
import { Guilds } from "../models/Guilds";
import { Lobbies } from "../models/Lobbies";
const MySQLEvents = require("@rodrigogs/mysql-events");

class GetstreamActionsController {
  private GetStream: GetStreamService | undefined;

  constructor() {
    if (process.env.GETSTREAM_API_KEY && process.env.GETSTREAM_API_SECRET) {
      this.GetStream = new GetStreamService(
        process.env.GETSTREAM_API_KEY,
        process.env.GETSTREAM_API_SECRET
      );
    }
  }

  public executeAction = async (event: IMysqlEvent): Promise<void> => {
    if (!event.affectedRows || event.affectedRows.length === 0) return;

    if (event.type !== MySQLEvents.STATEMENTS.INSERT) return;

    if (event.affectedColumns && event.affectedColumns.length === 2) {
      // Se event.affectedColumns contine solo ['lastExecutedAt', 'isExecuted'] allora è un update fatto da questo stesso controller
      // e non devo eseguire nulla

      if (
        event.affectedColumns.includes("lastExecutedAt") &&
        event.affectedColumns.includes("isExecuted")
      )
        return;
    }

    const trx = await GetstreamActions.startTransaction();

    let getstreamAction: GetstreamAction = event.affectedRows[0].after;
    let dbGetstreamAction = await GetstreamActions.query(trx).findById(
      getstreamAction.id
    );
    if (!dbGetstreamAction) throw new Error("GetStream Action non trovata");
    if (boolean(dbGetstreamAction.isExecuted))
      throw new Error("Action già eseguita");

    let getstreamActionType = await GetstreamActionsTypes.query(trx)
      .whereNull("deletedAt")
      .findById(dbGetstreamAction.getstreamActionTypeId);
    if (!getstreamActionType)
      throw new Error("GetStream Action Type non trovata");

    try {
      switch (getstreamActionType.name) {
        case GetstreamActionsTypesNames.CreateUser: {
          await this.createUser(
            getstreamAction.userId,
            getstreamAction.id,
            trx
          );
          console.log("Utente creato su getstream");
          break;
        }
        case GetstreamActionsTypesNames.UpdateUser: {
          await this.updateUser(
            getstreamAction.userId,
            getstreamAction.id,
            trx
          );
          console.log("Utente aggiornato su getstream");
          break;
        }
        case GetstreamActionsTypesNames.DeleteUser: {
          await this.deleteUser(
            getstreamAction.userId,
            getstreamAction.id,
            trx
          );
          console.log("Utente eliminato su getstream");
          break;
        }

        case GetstreamActionsTypesNames.CreateGuild: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );
          if (!getstreamAction.guildId)
            throw new Error("guildId non presente. Controlla il DTO");

          await this.createGuild(
            getstreamAction.getstreamChannelId,
            getstreamAction.guildId,
            getstreamAction.id,
            trx
          );

          console.log(
            "Canale di messaggistica per la gilda creato su getstream"
          );
          break;
        }
        case GetstreamActionsTypesNames.UpdateGuild: {
          break;
        }
        case GetstreamActionsTypesNames.DeleteGuild: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );
          if (!getstreamAction.guildId)
            throw new Error("guildId non presente. Controlla il DTO");

          await this.deleteGetStreamChannel(
            getstreamAction.getstreamChannelId,
            getstreamAction.id,
            trx
          );

          console.log(
            "Canale di messaggistica per la gilda eliminato su getstream"
          );
          break;
        }

        case GetstreamActionsTypesNames.CreateLobby: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );
          if (!getstreamAction.lobbyId)
            throw new Error("lobbyId non presente. Controlla il DTO");

          await this.createLobby(
            getstreamAction.getstreamChannelId,
            getstreamAction.lobbyId,
            getstreamAction.id,
            trx
          );

          console.log(
            "Canale di messaggistica per la lobby creato su getstream"
          );
          break;
        }
        case GetstreamActionsTypesNames.UpdateLobby: {
          break;
        }
        case GetstreamActionsTypesNames.DeleteLobby: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );

          if (!getstreamAction.lobbyId)
            throw new Error("lobbyId non presente. Controlla il DTO");

          await this.deleteGetStreamChannel(
            getstreamAction.getstreamChannelId,
            getstreamAction.id,
            trx
          );

          console.log(
            "Canale di messaggistica per la lobby eliminato su getstream"
          );
          break;
        }

        case GetstreamActionsTypesNames.CreateGuildUser: {
          break;
        }
        case GetstreamActionsTypesNames.DeleteGuildUser: {
          break;
        }

        case GetstreamActionsTypesNames.CreateLobbyUser: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );
          if (!getstreamAction.lobbyId)
            throw new Error("lobbyId non presente. Controlla il DTO");

          await this.createLobbyUser(
            getstreamAction.getstreamChannelId,
            getstreamAction.lobbyId,
            getstreamAction.userId,
            getstreamAction.id,
            trx
          );

          console.log("Utente aggiunto al canale di messaggistica della lobby");
          break;
        }
        case GetstreamActionsTypesNames.DeleteLobbyUser: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );

          if (!getstreamAction.lobbyId)
            throw new Error("lobbyId non presente. Controlla il DTO");

          await this.deleteLobbyUser(
            getstreamAction.getstreamChannelId,
            getstreamAction.lobbyId,
            getstreamAction.userId,
            getstreamAction.id,
            trx
          );

          console.log("Utente rimosso dal canale di messaggistica della lobby");
          break;
        }

        case GetstreamActionsTypesNames.DeleteGetStreamChannel: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );

          await this.deleteGetStreamChannel(
            getstreamAction.getstreamChannelId,
            getstreamAction.id,
            trx
          );

          console.log("Canale eliminato su getstream");
          break;
        }
        case GetstreamActionsTypesNames.CreateGetStreamChannel: {
          if (!getstreamAction.getstreamChannelId)
            throw new Error(
              "getstreamChannelId non presente. Controlla il DTO"
            );
          await this.createGetStreamChannel(
            getstreamAction.getstreamChannelId,
            getstreamAction.id,
            trx
          );

          console.log("Canale creato su getstream");
          break;
        }
        case GetstreamActionsTypesNames.AddUserToGetStreamChannel: {
          // Per il momento non faccio nulla poichè creo il canale ed aggiungo gli utenti in un unico passaggio
          // console.log("AddUserToGetStreamChannel", getstreamAction.userId);
          break;
        }
        default: {
          throw new Error(
            `Tipo di azione non supportata: ${getstreamActionType.name}`
          );
        }
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  };

  public createUser = async (
    userId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbUser = await Users.query(trx).whereNull("deletedAt").findById(userId);
    if (!dbUser) throw new Error("CreateUser: Utente non trovato");
    if (boolean(dbUser.hasGetStreamAccount))
      throw new Error("CreateUser: L'utente ha già un account GetStream");

    // Salvo l'utente sul portale GetStream
    const isSuccess = await this.GetStream.saveGetStreamUser(dbUser);
    if (!isSuccess)
      throw new Error(
        "CreateUser: Errore durante la creazione dell'account GetStream"
      );

    // Aggiorno il campo hasGetStreamAccount
    await Users.query(trx)
      .findById(userId)
      .patch({ hasGetStreamAccount: true });

    // Aggiorno l'azione
    await GetstreamActions.query(trx)
      .findById(getstreamActionId)
      .patch({ isExecuted: true, lastExecutedAt: new Date() });
  };

  public updateUser = async (
    userId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbUser = await Users.query(trx).whereNull("deletedAt").findById(userId);
    if (!dbUser) throw new Error("UpdateUser: Utente non trovato");
    if (!boolean(dbUser.hasGetStreamAccount))
      throw new Error("UpdateUser: L'utente non ha un account GetStream");

    // Aggiorno l'utente sul portale GetStream
    const isSuccess = await this.GetStream.saveGetStreamUser(dbUser);
    if (!isSuccess)
      throw new Error(
        "UpdateUser: Errore durante l'aggiornamento dell'account GetStream"
      );

    // Aggiorno l'azione
    await GetstreamActions.query(trx)
      .findById(getstreamActionId)
      .patch({ isExecuted: true, lastExecutedAt: new Date() });
  };

  public deleteUser = async (
    userId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbUser = await Users.query(trx).whereNull("deletedAt").findById(userId);
    if (!dbUser) throw new Error("DeleteUser: Utente non trovato");
    if (!boolean(dbUser.hasGetStreamAccount))
      throw new Error("DeleteUser: L'utente non ha un account GetStream");

    const isSuccess = await this.GetStream.deleteGetStreamUser(dbUser.uuid);
    if (!isSuccess)
      throw new Error(
        "DeleteUser: Errore durante la cancellazione dell'account GetStream"
      );

    // Aggiorno il campo hasGetStreamAccount
    await Users.query(trx)
      .findById(userId)
      .patch({ hasGetStreamAccount: false });

    // Aggiorno l'azione
    await GetstreamActions.query(trx)
      .findById(getstreamActionId)
      .patch({ isExecuted: true, lastExecutedAt: new Date() });
  };

  public createGuild = async (
    getstreamChannelId: number,
    guildId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbGuild = await Guilds.query(trx)
      .whereNull("deletedAt")
      .findById(guildId);
    if (!dbGuild) throw new Error("CreateGuild: Gilda non trovata");

    if (boolean(dbGuild.hasGetStreamChannel))
      throw new Error("CreateGuild: La gilda ha già un canale GetStream");

    let dbUser = await Users.query(trx)
      .whereNull("deletedAt")
      .findById(dbGuild.userId);
    if (!dbUser) throw new Error("CreateGuild: Utente non trovato");

    let dbGetStreamChannel = await GetstreamChannels.query(trx)
      .whereNull("deletedAt")
      .findById(getstreamChannelId);
    if (!dbGetStreamChannel) throw new Error("CreateGuild: Canale non trovato");

    // Creo il canale sul portale GetStream
    const isSuccess = await this.GetStream.createGuildChannel(
      dbGuild,
      dbGetStreamChannel,
      dbUser
    );
    if (!isSuccess)
      throw new Error(
        "CreateGuild: Errore durante la creazione del canale GetStream"
      );

    // Aggiorno il campo hasGetStreamChannel
    await Guilds.query(trx)
      .findById(guildId)
      .patch({ hasGetStreamChannel: true });

    // Aggiorno l'azione
    await GetstreamActions.query(trx)
      .findById(getstreamActionId)
      .patch({ isExecuted: true, lastExecutedAt: new Date() });
  };

  public createLobby = async (
    getstreamChannelId: number,
    lobbyId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbLobby = await Lobbies.query(trx)
      .whereNull("deletedAt")
      .findById(lobbyId);
    if (!dbLobby) throw new Error("CreateLobby: Lobby non trovata");

    if (boolean(dbLobby.hasGetStreamChannel))
      throw new Error("CreateLobby: La lobby ha già un canale GetStream");

    let dbUser = await Users.query(trx)
      .whereNull("deletedAt")
      .findById(dbLobby.userId);
    if (!dbUser) throw new Error("CreateLobby: Utente non trovato");

    let dbGetStreamChannel = await GetstreamChannels.query(trx)
      .whereNull("deletedAt")
      .findById(getstreamChannelId);
    if (!dbGetStreamChannel) throw new Error("CreateLobby: Canale non trovato");

    // Creo il canale sul portale GetStream
    const isSuccess = await this.GetStream.createLobbyChannel(
      dbLobby,
      dbGetStreamChannel,
      dbUser
    );
    if (!isSuccess)
      throw new Error(
        "CreateLobby: Errore durante la creazione del canale GetStream"
      );

    // Aggiorno il campo hasGetStreamChannel
    await Lobbies.query(trx)
      .findById(lobbyId)
      .patch({ hasGetStreamChannel: true });

    // Aggiorno l'azione
    await GetstreamActions.query(trx)
      .findById(getstreamActionId)
      .patch({ isExecuted: true, lastExecutedAt: new Date() });
  };

  public createLobbyUser = async (
    getstreamChannelId: number,
    lobbyId: number,
    userId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbLobby = await Lobbies.query(trx)
      .whereNull("deletedAt")
      .findById(lobbyId);
    if (!dbLobby) throw new Error("CreateLobbyUser: Lobby non trovata");
    if (!boolean(dbLobby.hasGetStreamChannel))
      throw new Error("CreateLobbyUser: La lobby non ha un canale GetStream");

    let dbUser = await Users.query(trx).whereNull("deletedAt").findById(userId);
    if (!dbUser) throw new Error("CreateLobbyUser: Utente non trovato");
    if (!boolean(dbUser.hasGetStreamAccount))
      throw new Error("CreateLobbyUser: L'utente non ha un account GetStream");

    let dbGetStreamChannel = await GetstreamChannels.query(trx)
      .whereNull("deletedAt")
      .findById(getstreamChannelId);
    if (!dbGetStreamChannel)
      throw new Error("CreateLobbyUser: Canale non trovato");

    if (dbUser.id === dbLobby.userId) {
      // Non faccio nulla poichè aggiungo l'utente creatore è già presente nel canale
    } else {
      // Aggiungo l'utente al canale sul portale GetStream
      const isSuccess = await this.GetStream.addUsersToLobbyChannel(
        [dbUser],
        dbGetStreamChannel
      );
      if (!isSuccess)
        throw new Error(
          "CreateLobbyUser: Errore durante l'aggiunta dell'utente al canale GetStream"
        );

      // Aggiorno l'azione
      await GetstreamActions.query(trx)
        .findById(getstreamActionId)
        .patch({ isExecuted: true, lastExecutedAt: new Date() });
    }
  };

  public deleteLobbyUser = async (
    getstreamChannelId: number,
    lobbyId: number,
    userId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbLobby = await Lobbies.query(trx)
      .whereNull("deletedAt")
      .findById(lobbyId);
    if (!dbLobby) throw new Error("DeleteLobbyUser: Lobby non trovata");
    if (!boolean(dbLobby.hasGetStreamChannel))
      throw new Error("DeleteLobbyUser: La lobby non ha un canale GetStream");

    let dbUser = await Users.query(trx).whereNull("deletedAt").findById(userId);
    if (!dbUser) throw new Error("CreateLobbyUser: Utente non trovato");
    if (!boolean(dbUser.hasGetStreamAccount))
      throw new Error("CreateLobbyUser: L'utente non ha un account GetStream");

    let dbGetStreamChannel = await GetstreamChannels.query(trx)
      .whereNull("deletedAt")
      .findById(getstreamChannelId);
    if (!dbGetStreamChannel)
      throw new Error("CreateLobbyUser: Canale non trovato");

    if (dbUser.id === dbLobby.userId) {
      // Non faccio nulla poichè non posso rimuovere l'utente creatore
    } else {
      // Rimuovo l'utente dal canale sul portale GetStream
      const isSuccess = await this.GetStream.removeUsersFromLobbyChannel(
        [dbUser],
        dbGetStreamChannel
      );
      if (!isSuccess)
        throw new Error(
          "DeleteLobbyUser: Errore durante la rimozione dell'utente dal canale GetStream"
        );

      // Aggiorno l'azione
      await GetstreamActions.query(trx)
        .findById(getstreamActionId)
        .patch({ isExecuted: true, lastExecutedAt: new Date() });
    }
  };

  public createGetStreamChannel = async (
    getstreamChannelId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbGetStreamChannel = await GetstreamChannels.query(trx)
      .whereNull("deletedAt")
      .findById(getstreamChannelId);

    if (!dbGetStreamChannel) throw new Error("Canale non trovato");

    let dbGetStreamChannelType = await GetstreamChannelsTypes.query(trx)
      .whereNull("deletedAt")
      .findById(dbGetStreamChannel.getstreamChannelTypeId);
    if (!dbGetStreamChannelType) throw new Error("Tipo di canale non trovato");

    switch (dbGetStreamChannelType.name) {
      case GetstreamChannelsTypesNames.messaging: {
        // Recupero lo users_messaging_channels dove getstreamChannelId = getstreamChannelId
        let dbUserMessagingChannel = await UsersMessagingChannels.query(trx)
          .whereNull("deletedAt")
          .where("getstreamChannelId", getstreamChannelId)
          .first();
        if (!dbUserMessagingChannel)
          throw new Error("Canale di messaggistica non trovato");

        let dbUser = await Users.query(trx)
          .whereNull("deletedAt")
          .findById(dbUserMessagingChannel.userId);
        let dbMember = await Users.query(trx)
          .whereNull("deletedAt")
          .findById(dbUserMessagingChannel.memberId);

        if (!dbUser) throw new Error("Utente non trovato");
        if (!dbMember) throw new Error("Membro non trovato");

        if (!boolean(dbUser.hasGetStreamAccount))
          throw new Error("L'utente non ha un account GetStream");
        if (!boolean(dbMember.hasGetStreamAccount))
          throw new Error("Il membro non ha un account GetStream");

        const isSuccess = await this.GetStream.createMessagingChannel(
          dbUser,
          dbMember,
          dbGetStreamChannel
        );
        if (!isSuccess)
          throw new Error(
            "Errore durante la creazione del canale di messaggistica"
          );

        // Aggiorno l'azione
        await GetstreamActions.query(trx)
          .findById(getstreamActionId)
          .patch({ isExecuted: true, lastExecutedAt: new Date() });

        break;
      }
    }
  };

  public deleteGetStreamChannel = async (
    getstreamChannelId: number,
    getstreamActionId: number,
    trx: Objection.Transaction
  ): Promise<void> => {
    if (!this.GetStream) throw new Error("GetStreamService non inizializzato");

    let dbGetStreamChannel = await GetstreamChannels.query(trx)
      .whereNotNull("deletedAt")
      .findById(getstreamChannelId);

    if (!dbGetStreamChannel) throw new Error("Canale non trovato");

    const isSuccess = await this.GetStream.deleteChannels([
      dbGetStreamChannel.cid,
    ]);
    if (!isSuccess)
      throw new Error("Errore durante la cancellazione del canale");

    // Aggiorno l'azione
    await GetstreamActions.query(trx)
      .findById(getstreamActionId)
      .patch({ isExecuted: true, lastExecutedAt: new Date() });
  };
}

export default GetstreamActionsController;
