export interface GetstreamChannelType {
  id: number;
  name: string;
  description: string | null;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
