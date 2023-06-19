import { Model, ModelObject } from "objection";
import { GetstreamChannelType } from "../interfaces/GetstreamChannelType";

export class GetstreamChannelsTypes
  extends Model
  implements GetstreamChannelType
{
  id!: number;
  name!: string;
  description!: string | null;
  maxMembers!: number;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "getstream_channels_types";
  static idColumn = "id";
}

export type GetstreamChannelsTypesShape = ModelObject<GetstreamChannelsTypes>;
