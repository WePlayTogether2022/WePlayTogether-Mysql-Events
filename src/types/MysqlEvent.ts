export interface IMysqlEvent {
  type: "INSERT | UPDATE | DELETE";
  schema: string;
  table: string;
  affectedRows?: Array<IMysqlEventRow>;
  affectedColumns?: Array<string>;
  timestamp: number;
  nextPosition: number;
  binlogName: string;
}

export interface IMysqlEventRow {
  before: any;
  after: any;
}
