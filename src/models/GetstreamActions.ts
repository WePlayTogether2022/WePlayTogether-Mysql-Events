import { Model, ModelObject } from "objection";
import { GetstreamAction } from "../interfaces/GetstreamAction";

export class GetstreamActions extends Model implements GetstreamAction {
  id!: number;
  userId!: number;
  getstreamActionTypeId!: number;
  getstreamChannelId!: number | null;
  lobbyId!: number | null;
  guildId!: number | null;
  lobbyUserId!: number | null;
  guildUserId!: number | null;
  lastExecutedAt!: Date | null;
  isExecuted!: boolean;

  createdAt!: Date;
  updatedAt!: Date;

  static tableName = "getstream_actions";
  static idColumn = "id";
}

export type GetstreamActionsShape = ModelObject<GetstreamActions>;
