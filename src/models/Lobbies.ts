import { Model, ModelObject } from "objection";
import { Lobby } from "../interfaces/Lobby";

export class Lobbies extends Model implements Lobby {
  id!: number;
  uuid!: string;
  userId!: number;
  gameId!: number;
  lobbyTypeId!: number;
  consoleId!: number | null;
  getstreamChannelId!: number;
  title!: string;
  description!: string | null;
  maxPlayers!: number;
  isPublic!: boolean;
  password!: string | null;
  imageUrl!: string;
  imagePublicId!: string;
  currentPlayers!: number;
  isFull!: boolean;

  hasGetStreamChannel!: boolean;
  hasAlgoliaIndex!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "lobbies";
  static idColumn = "id";
}

export type LobbiesShape = ModelObject<Lobbies>;
