import { User } from "./User";

export interface GetstreamChannelUser {
  id: number;
  userId: number;
  getstreamChannelId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  user?: User;
}
