import { Model, ModelObject } from "objection";
import { GetstreamChannelUser } from "../interfaces/GetstreamChannelUser";
import { Users } from "./Users";

export class GetstreamChannelsUsers
  extends Model
  implements GetstreamChannelUser
{
  id!: number;
  userId: number;
  getstreamChannelId: number;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "getstream_channels_users";
  static idColumn = "id";

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: `${GetstreamChannelsUsers.tableName}.userId`,
        to: `${Users.tableName}.${Users.idColumn}`,
      },
      filter: (f: any) => f.whereNull("deletedAt"),
    },
  };
}

export type GetstreamChannelsUsersShape = ModelObject<GetstreamChannelsUsers>;
