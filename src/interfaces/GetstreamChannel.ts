import { User } from "./User";
import { GetstreamChannelType } from "./GetstreamChannelType";

export interface GetstreamChannel {
  id: number;
  founderId: number;
  getstreamChannelTypeId: number;
  uuid: string;
  cid: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  user?: User;
  getstreamChannelType?: GetstreamChannelType;
}
