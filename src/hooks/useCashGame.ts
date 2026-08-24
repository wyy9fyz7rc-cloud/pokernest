import { useCallback, useEffect, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DEMO_GROUP_ID } from "./useMembers";
import type { CashGame } from "../types";

function gamesRef() {
  return collection(db, "groups", DEMO_GROUP_ID, "cashGames");
}

export function useCashGame(gameId: string | null) {
  const [game, setGame] = useState<CashGame | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      return;
    }
    const unsub = onSnapshot(doc(gamesRef(), gameId), (snap) => {
      if (snap.exists()) {
        setGame({ id: snap.id, ...(snap.data() as Omit<CashGame, "id">) });
      }
    });
    return () => unsub();
  }, [gameId]);

  const createGame = useCallback(
    async (params: { unitName: string; rate: number; startStack: number; participantIds: string[] }) => {
      const ref = doc(gamesRef());
      const buyins: Record<string, number> = {};
      params.participantIds.forEach((id) => (buyins[id] = 1)); // 初期バイイン=1回分
      const newGame: Omit<CashGame, "id"> = {
        groupId: DEMO_GROUP_ID,
        unitName: params.unitName,
        rate: params.rate,
        startStack: params.startStack,
        participantIds: params.participantIds,
        buyins,
        finalChips: {},
        status: "active",
        createdAt: Date.now(),
      };
      await setDoc(ref, { ...newGame, createdAt: serverTimestamp() });
      return ref.id;
    },
    []
  );

  const addRebuy = useCallback(async (gameIdArg: string, memberId: string, currentBuyins: Record<string, number>) => {
    const next = { ...currentBuyins, [memberId]: (currentBuyins[memberId] ?? 0) + 1 };
    await updateDoc(doc(gamesRef(), gameIdArg), { buyins: next });
  }, []);

  const setFinalChip = useCallback(
    async (gameIdArg: string, memberId: string, currentFinalChips: Record<string, number>, chips: number) => {
      const next = { ...currentFinalChips, [memberId]: chips };
      await updateDoc(doc(gamesRef(), gameIdArg), { finalChips: next });
    },
    []
  );

  const settleGame = useCallback(async (gameIdArg: string) => {
    await updateDoc(doc(gamesRef(), gameIdArg), { status: "settled" });
  }, []);

  return { game, createGame, addRebuy, setFinalChip, settleGame };
}
