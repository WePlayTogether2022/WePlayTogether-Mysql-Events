import {
  APIResponse,
  DefaultGenerics,
  StreamChat,
  TaskResponse,
} from "stream-chat";
import { boolean } from "boolean";
import { User } from "../interfaces/User";
import { GetstreamChannel } from "../interfaces/GetstreamChannel";
import { Guild } from "../interfaces/Guild";
import { Lobby } from "../interfaces/Lobby";

// const serverClient = StreamChat.getInstance(process.env.GETSTREAM_API_KEY, GETSTREAM_API_SECRET);

class GetStreamService {
  private serverClient: StreamChat<DefaultGenerics>;

  constructor(private apiKey: string, private apiSecret: string) {
    this.serverClient = StreamChat.getInstance(apiKey, apiSecret);
  }

  public async saveGetStreamUser(user: User): Promise<boolean> {
    try {
      await this.serverClient.upsertUser({
        id: user.uuid,
        name: user.username,
        image: user.avatarUrl,
        isVerified: boolean(user.isVerified),
        role: "user",
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  public async deleteGetStreamUser(userUuid: string): Promise<boolean> {
    try {
      await this.serverClient.deleteUser(userUuid, {
        mark_messages_deleted: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async createGuildChannel(
    guild: Guild,
    getstreamChannel: GetstreamChannel,
    guildCreator: User
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel(
        "guild",
        getstreamChannel.uuid,
        {
          created_by_id: guildCreator.uuid,
          name: guild.name,
          image: guild.logoUrl,
        }
      );
      await channel.create();
      await channel.addMembers([guildCreator.uuid]);

      return true;
    } catch (error) {
      return false;
    }
  }

  public async updateGuildChannel(
    guild: Guild,
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel("guild", getstreamChannel.uuid);
      await channel.update({
        name: guild.name,
        image: guild.logoUrl,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async addUsersToGuildChannel(
    users: User[],
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel("guild", getstreamChannel.uuid);
      if (users.length > 0) {
        await channel.addMembers(users.map((user) => user.uuid));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  public async removeUsersFromGuildChannel(
    users: User[],
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel("guild", getstreamChannel.uuid);
      if (users.length > 0) {
        await channel.removeMembers(users.map((user) => user.uuid));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  public async createMessagingChannel(
    user: User,
    member: User,
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel(
        "messaging",
        getstreamChannel.uuid,
        {
          created_by_id: user.uuid,
        }
      );
      await channel.create();
      await channel.addMembers([user.uuid, member.uuid]);

      return true;
    } catch (error) {
      return false;
    }
  }

  public async createLobbyChannel(
    lobby: Lobby,
    getstreamChannel: GetstreamChannel,
    user: User
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel(
        "lobby",
        getstreamChannel.uuid,
        {
          created_by_id: user.uuid,
          name: lobby.title,
          image: lobby.imageUrl,
        }
      );
      await channel.create();
      await channel.addMembers([user.uuid]);

      return true;
    } catch (error) {
      return false;
    }
  }

  public async updateLobbyChannel(
    lobby: Lobby,
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel("lobby", getstreamChannel.uuid);
      await channel.update({
        name: lobby.title,
        image: lobby.imageUrl,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async addUsersToLobbyChannel(
    user: User[],
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel("lobby", getstreamChannel.uuid);
      if (user.length > 0) {
        await channel.addMembers(user.map((u) => u.uuid));
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public async removeUsersFromLobbyChannel(
    users: User[],
    getstreamChannel: GetstreamChannel
  ): Promise<boolean> {
    try {
      const channel = this.serverClient.channel("lobby", getstreamChannel.uuid);
      if (users.length > 0) {
        await channel.removeMembers(users.map((u) => u.uuid));
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public async deleteChannels(cids: string[]): Promise<boolean> {
    try {
      const response: APIResponse & {
        result: Record<string, string>;
      } & Partial<TaskResponse> = await this.serverClient.deleteChannels(cids);

      const result = await this.serverClient.getTask(response.task_id!);

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default GetStreamService;
