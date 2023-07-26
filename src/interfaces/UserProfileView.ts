import { User } from "./User";

export interface UserProfileView {
  id: number;
  viewedUserId: number;
  viewerUserId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  viewedUser?: User;
  viewerUser?: User;
}
