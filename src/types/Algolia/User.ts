export interface IAlgoliaUser {
  userId: number;
  username: string;
  avatarUrl: string;
  isVerified: boolean;
  fullName: string | null;
  objectID: string; // User UUID
  type: "USER";
}
