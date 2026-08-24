import type { CashGame, Member, SettlementRow } from "../types";

/** 1回のバイインで発生する投資単位数（スタート チップ数 × 換算率） */
export function unitsPerBuyin(game: Pick<CashGame, "startStack" | "rate">): number {
  return game.startStack * game.rate;
}

/** 指定メンバーの投資単位合計 */
export function investedUnits(game: Pick<CashGame, "buyins" | "startStack" | "rate">, memberId: string): number {
  const count = game.buyins[memberId] ?? 0;
  return count * unitsPerBuyin(game);
}

/** 最終結果一覧（収支の大きい順にソート済み） */
export function computeSettlement(
  game: Pick<CashGame, "buyins" | "finalChips" | "startStack" | "rate" | "participantIds">,
  members: Member[]
): SettlementRow[] {
  const rows = game.participantIds.map((id) => {
    const name = members.find((m) => m.id === id)?.name ?? "不明";
    const chips = game.finalChips[id] ?? 0;
    const finalUnits = chips * game.rate;
    const invested = investedUnits(game, id);
    return {
      memberId: id,
      name,
      invested,
      finalUnits,
      profit: finalUnits - invested,
    };
  });
  return rows.sort((a, b) => b.profit - a.profit);
}

/** 収支の合計が概ね0になっているか（検算用。丸め誤差を考慮して閾値を設ける） */
export function isBalanced(rows: SettlementRow[], epsilon = 0.01): boolean {
  const total = rows.reduce((sum, r) => sum + r.profit, 0);
  return Math.abs(total) <= epsilon;
}
