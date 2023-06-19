import { Model, ModelObject } from "objection";
import { User, SignUpMethod } from "../interfaces/User";

export class Users extends Model implements User {
  id!: number;
  countryId!: number | null;
  uuid!: string;

  fullName!: string;

  username!: string;

  email!: string;
  emailVerificationToken!: string | null;
  emailVerified!: boolean;
  emailVerifiedAt!: Date | null;

  phoneNumber!: string | null;
  phoneNumberCountryIso!: string | null;
  phoneNumberVerified!: boolean;
  phoneNumberVerifiedAt!: Date | null;

  password!: string | null;

  dateOfBirth!: Date | null;

  biography!: string | null;

  avatarPublicId!: string;
  avatarUrl!: string;
  avatarIsDefault!: boolean;
  googleAvatar!: boolean;
  twitchAvatar!: boolean;

  bannerPublicId!: string | null;
  bannerUrl!: string | null;
  bannerIsDefault!: boolean;

  twoFactorAuthenticationEnabled!: boolean;
  twoFactorAuthenticationSmsEnabled!: boolean;
  twoFactorAuthenticationAppEnabled!: boolean;

  notificationsEnabled!: boolean;
  notificationsEmailEnabled!: boolean;
  notificationsSmsEnabled!: boolean;

  blockFriendsRequests!: boolean;
  blockMessagesNotFriends!: boolean;
  blockMessages!: boolean;

  isPrivate!: boolean;

  isBanned!: boolean;
  bannedAt!: Date | null;
  bannedReason!: string | null;
  bannedUntil!: Date | null;

  isShadowBanned!: boolean;
  shadowBannedAt!: Date | null;
  shadowBannedReason!: string | null;
  shadowBannedUntil!: Date | null;

  isVerified!: boolean;
  verifiedAt!: Date | null;

  isOnline!: boolean;
  lastOnlineAt!: Date | null;

  isStaffUser!: boolean;
  protectionLevel!: number;

  signUpMethod!: SignUpMethod;

  hasGetStreamAccount!: boolean;
  hasAlgoliaAccount!: boolean;
  hasStripeAccount!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static tableName = "users"; // database table name
  static idColumn = "id"; // id column name
}

export type UsersShape = ModelObject<Users>;
