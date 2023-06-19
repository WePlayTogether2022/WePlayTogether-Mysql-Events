import { boolean } from "boolean";
import { GetstreamChannel } from "../interfaces/GetstreamChannel";
import { GetstreamChannels } from "../models/GetstreamChannels";
import GetStreamService from "../services/GetStreamService";
import { IMysqlEvent } from "../types/MysqlEvent";
import { GetstreamChannelsTypesNames } from "../costants/enums";
import { Guilds } from "../models/Guilds";
import { Users } from "../models/Users";
import { GetstreamChannelsTypes } from "../models/GetstreamChannelsTypes";
import { UsersMessagingChannels } from "../models/UsersMessagingChannels";
import { Guild } from "../interfaces/Guild";

class GetstreamChannelsController {
  private GetStream: GetStreamService | undefined;

  constructor() {
    if (process.env.GETSTREAM_API_KEY && process.env.GETSTREAM_API_SECRET) {
      this.GetStream = new GetStreamService(
        process.env.GETSTREAM_API_KEY,
        process.env.GETSTREAM_API_SECRET
      );
    }
  }

  public async createGetStreamChannel(event: IMysqlEvent) {
    // Devo creare un canale getstream
    if (this.GetStream) {
      if (
        event.affectedRows &&
        event.affectedRows.length > 0 &&
        event.affectedRows[0].after
      ) {
        let getStreamChannel: GetstreamChannel = event.affectedRows[0].after;
        let dbGetstreamChannel: GetstreamChannel | undefined =
          await GetstreamChannels.query()
            .findById(getStreamChannel.id)
            .whereNull("deletedAt");
        if (dbGetstreamChannel) {
          let dbFounder = await Users.query()
            .findById(dbGetstreamChannel.founderId)
            .whereNull("deletedAt");
          if (!dbFounder) throw new Error("Utente non trovato");
          if (!boolean(dbFounder.hasGetStreamAccount))
            throw new Error("Utente non ha un account getstream");

          let dbGetstreamChannelType = await GetstreamChannelsTypes.query()
            .findById(dbGetstreamChannel.getstreamChannelTypeId)
            .whereNull("deletedAt");
          if (!dbGetstreamChannelType)
            throw new Error("Tipo di canale non trovato");

          // Verifico che tipo di canale devo creare
          switch (dbGetstreamChannelType.name) {
            case GetstreamChannelsTypesNames.messaging: {
              let dbUserMessagingChannel = await UsersMessagingChannels.query()
                .whereNull("deletedAt")
                .andWhere("getstreamChannelId", dbGetstreamChannel.id)
                .first();
              if (!dbUserMessagingChannel)
                throw new Error("Canale non trovato");

              let dbUser = await Users.query()
                .findById(dbUserMessagingChannel.userId)
                .whereNull("deletedAt");
              if (!dbUser) throw new Error("Utente non trovato");
              if (!boolean(dbUser.hasGetStreamAccount))
                throw new Error("Utente non ha un account getstream");

              let dbMember = await Users.query()
                .findById(dbUserMessagingChannel.memberId)
                .whereNull("deletedAt");
              if (!dbMember) throw new Error("Utente non trovato");
              if (!boolean(dbMember.hasGetStreamAccount))
                throw new Error("Utente non ha un account getstream");

              const isSuccess = await this.GetStream.createMessagingChannel(
                dbUser,
                dbMember,
                dbGetstreamChannel
              );
              if (!isSuccess) throw new Error("GetStream error");

              // Aggiorno il campo hasGetStreamChannel
              // await UsersMessagingChannels.query()
              //   .findById(dbUserMessagingChannel.id)
              //   .patch({ hasGetStreamChannel: true });

              console.log(
                `Canale GetStream per la chat creato tra ${dbUser.uuid} e ${dbMember.uuid}`
              );
              break;
            }
            case GetstreamChannelsTypesNames.lobby: {
              break;
            }
            case GetstreamChannelsTypesNames.guild: {
              let dbGuild = await Guilds.query()
                .whereNull("deletedAt")
                .andWhere("getstreamChannelId", dbGetstreamChannel.id)
                .first();
              if (!dbGuild) throw new Error("Gilda non trovata");
              if (boolean(dbGuild.hasGetStreamChannel))
                throw new Error("Gilda ha già un canale getstream");

              const isSuccess = await this.GetStream.createGuildChannel(
                dbGuild,
                dbGetstreamChannel,
                dbFounder
              );
              if (!isSuccess) throw new Error("GetStream error");

              // Aggiorno il campo hasGetStreamChannel
              await Guilds.query()
                .findById(dbGuild.id)
                .patch({ hasGetStreamChannel: true });

              console.log("Canale GetStream per la gilda creato");

              break;
            }
          }
        } else {
          throw new Error("Canale GetStream non trovato");
        }
      }
    }
  }

  public async updateGuildGetStreamChannel(event: IMysqlEvent) {
    if (!this.GetStream) throw new Error("GetStream non inizializzato");

    if (
      event.affectedColumns &&
      event.affectedColumns.length > 0 &&
      event.affectedRows &&
      event.affectedRows.length > 0 &&
      (event.affectedColumns.includes("name") ||
        event.affectedColumns.includes("logoUrl"))
    ) {
      let guild: Guild = event.affectedRows[0].after;
      let dbGuild = await Guilds.query()
        .findById(guild.id)
        .whereNull("deletedAt");

      if (!dbGuild) throw new Error("Gilda non trovata");
      if (!boolean(dbGuild.hasGetStreamChannel))
        throw new Error("Gilda non ha un canale getstream");

      let getstreamChannel = await GetstreamChannels.query()
        .findById(dbGuild.getstreamChannelId)
        .whereNull("deletedAt");
      if (!getstreamChannel) throw new Error("Canale GetStream non trovato");

      const isSuccess = await this.GetStream.updateGuildChannel(
        dbGuild,
        getstreamChannel
      );
      if (!isSuccess) throw new Error("GetStream error");

      console.log(`Gilda ${dbGuild.uuid} aggiornata in GetStream`);
    }
  }

  public async deleteGetStreamChannel(event: IMysqlEvent) {
    if (!this.GetStream) throw new Error("GetStream non inizializzato");

    if (
      event.affectedColumns &&
      event.affectedColumns.length > 0 &&
      event.affectedColumns.includes("deletedAt")
    ) {
      if (event.affectedRows && event.affectedRows.length > 0) {
        let getstreamChannel: GetstreamChannel = event.affectedRows[0].before;
        let dbGetstreamChannel = await GetstreamChannels.query()
          .findById(getstreamChannel.id)
          .whereNotNull("deletedAt");
        if (!dbGetstreamChannel) throw new Error("Canale non trovato");

        const isSuccess = await this.GetStream.deleteChannels([
          dbGetstreamChannel.cid,
        ]);
        if (!isSuccess) throw new Error("GetStream error");

        console.log(`Canale con id ${dbGetstreamChannel.cid} eliminato`);
      }
    }
  }
}

export default GetstreamChannelsController;
