import { Model, ModelObject, Pojo } from "objection";
import { UserProfileView } from "../interfaces/UserProfileView";

export class UsersProfileViews extends Model implements UserProfileView {
  id!: number;
  viewedUserId!: number;
  viewerUserId!: number;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "users_profile_views";
  static idColumn = "id";
}

export type UsersProfileViewsShape = ModelObject<UsersProfileViews>;
