export interface GetstreamAction {
  id: number;
  userId: number;
  getstreamActionTypeId: number;
  getstreamChannelId: number | null;
  lobbyId: number | null;
  guildId: number | null;
  lobbyUserId: number | null;
  guildUserId: number | null;
  lastExecutedAt: Date | null;
  isExecuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
