export interface IAlgoliaGame {
  gamename: string;
  gameslug: string;
  gameLogoImageUrl: string;
  objectID: string; // Game UUID
  type: "GAME";
  gameId: number;
}
