import { Model, ModelObject } from "objection";
import { GetstreamChannel } from "../interfaces/GetstreamChannel";
import { Users } from "./Users";
import { GetstreamChannelsTypes } from "./GetstreamChannelsTypes";

export class GetstreamChannels extends Model implements GetstreamChannel {
  id!: number;
  founderId!: number;
  getstreamChannelTypeId!: number;
  uuid!: string;
  cid!: string;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "getstream_channels";
  static idColumn = "id";

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: `${GetstreamChannels.tableName}.founderId`,
        to: `${Users.tableName}.${Users.idColumn}`,
      },
      filter: (f: any) => f.whereNull("deletedAt"),
    },
    getstreamChannelType: {
      relation: Model.BelongsToOneRelation,
      modelClass: GetstreamChannelsTypes,
      join: {
        from: `${GetstreamChannels.tableName}.getstreamChannelTypeId`,
        to: `${GetstreamChannelsTypes}.${GetstreamChannelsTypes.idColumn}`,
      },
      filter: (f: any) => f.whereNull("deletedAt"),
    },
  };
}

export type GetstreamChannelsShape = ModelObject<GetstreamChannels>;
