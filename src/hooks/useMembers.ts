import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Member } from "../types";

// このスプリントではグループ作成・招待フローがまだ無いため、固定のデモグループを使う。
// グループ管理を実装するスプリントで groupId を可変にする。
export const DEMO_GROUP_ID = "demo-group";

const SEED_MEMBERS: Member[] = [
  { id: "m1", name: "たけし" },
  { id: "m2", name: "ゆうこ" },
  { id: "m3", name: "けんじ" },
  { id: "m4", name: "みほ" },
  { id: "m5", name: "だいすけ" },
  { id: "m6", name: "さやか" },
];

async function seedMembersIfEmpty() {
  const ref = collection(db, "groups", DEMO_GROUP_ID, "members");
  const snap = await getDocs(ref);
  if (snap.empty) {
    await Promise.all(
      SEED_MEMBERS.map((m) => setDoc(doc(db, "groups", DEMO_GROUP_ID, "members", m.id), { name: m.name }))
    );
  }
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    seedMembersIfEmpty()
      .catch((e) => console.error("メンバーの初期投入に失敗しました", e))
      .finally(() => {
        unsub = onSnapshot(
          collection(db, "groups", DEMO_GROUP_ID, "members"),
          (snap) => {
            setMembers(snap.docs.map((d) => ({ id: d.id, name: d.data().name as string })));
            setLoading(false);
          },
          (e) => {
            console.error("メンバーの購読に失敗しました", e);
            setLoading(false);
          }
        );
      });
    return () => unsub();
  }, []);

  return { members, loading };
}
