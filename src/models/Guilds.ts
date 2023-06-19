import { Model, ModelObject } from "objection";
import { Guild } from "../interfaces/Guild";

export class Guilds extends Model implements Guild {
  id!: number;
  userId!: number;
  countryId!: number;
  getstreamChannelId!: number;

  uuid!: string;

  name!: string;
  description!: string | null;
  websiteUrl!: string | null;

  logoPublicId!: string;
  logoUrl!: string;

  isVerified!: boolean;

  hasGetStreamChannel!: boolean;
  hasAlgoliaIndex!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "guilds";
  static idColumn = "id";
}

export type GuildsShape = ModelObject<Guilds>;
