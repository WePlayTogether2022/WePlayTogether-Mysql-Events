import { Model, ModelObject } from "objection";
import { UserMessagingChannel } from "../interfaces/UserMessagingChannel";

export class UsersMessagingChannels
  extends Model
  implements UserMessagingChannel
{
  id!: number;
  userId!: number;
  memberId!: number;
  getstreamChannelId!: number;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "users_messaging_channels";
  static idColumn = "id";
}

export type UsersMessagingChannelshape = ModelObject<UsersMessagingChannels>;
