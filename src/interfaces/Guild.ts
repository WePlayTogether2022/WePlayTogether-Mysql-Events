export interface Guild {
  id: number;
  userId: number;
  countryId: number;
  getstreamChannelId: number;
  uuid: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logoPublicId: string;
  logoUrl: string;

  // logo: GuildLogo;

  isVerified: boolean;

  hasGetStreamChannel: boolean;
  hasAlgoliaIndex: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
