import { Model, ModelObject } from "objection";
import { GetstreamActionType } from "../interfaces/GetstreamActionType";

export class GetstreamActionsTypes
  extends Model
  implements GetstreamActionType
{
  id!: number;
  name!: string;
  description!: string | null;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "getstream_actions_types";
  static idColumn = "id";
}

export type GetstreamActionsTypesShape = ModelObject<GetstreamActionsTypes>;
