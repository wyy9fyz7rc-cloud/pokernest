export interface Member {
  id: string;
  name: string;
}

export type CashGameStatus = "active" | "settled";

export interface CashGame {
  id: string;
  groupId: string;
  unitName: string;
  rate: number;
  startStack: number;
  participantIds: string[];
  buyins: Record<string, number>; // memberId -> 回数
  finalChips: Record<string, number>; // memberId -> 最終チップ枚数
  status: CashGameStatus;
  createdAt: number;
}

export interface SettlementRow {
  memberId: string;
  name: string;
  invested: number;
  finalUnits: number;
  profit: number;
}
