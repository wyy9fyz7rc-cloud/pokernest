import { useEffect, useState } from "react";
import { Plus, Check, ChevronLeft, ArrowRight, RotateCcw, Trophy, Users, LogOut } from "lucide-react";
import { signOutUser } from "./firebase";
import { useAuth } from "./hooks/useAuth";
import { useMembers } from "./hooks/useMembers";
import { useCashGame } from "./hooks/useCashGame";
import { computeSettlement, unitsPerBuyin } from "./lib/settlement";
import LoginScreen from "./LoginScreen";

type Step = "loading" | "home" | "setup" | "confirm" | "participants" | "game" | "cashout" | "settlement";

export default function App() {
  const [step, setStep] = useState<Step>("loading");
  const { user, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { members, loading: membersLoading } = useMembers();

  const [unitName, setUnitName] = useState("コイン");
  const [rate, setRate] = useState("1");
  const [startStack, setStartStack] = useState("500");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const { game, createGame, addRebuy, setFinalChip, settleGame } = useCashGame(activeGameId);
  const [finalChipDraft, setFinalChipDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !membersLoading && step === "loading") setStep("home");
  }, [user, membersLoading, step]);

  const rateNum = parseFloat(rate) || 0;
  const stackNum = parseFloat(startStack) || 0;
  const perBuyin = stackNum * rateNum;

  const toggleMember = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const startGame = async () => {
    const id = await createGame({ unitName, rate: rateNum, startStack: stackNum, participantIds: selected });
    setActiveGameId(id);
    setStep("game");
  };

  const goCashout = () => {
    setFinalChipDraft({});
    setStep("cashout");
  };

  const confirmSettlement = async () => {
    if (!game) return;
    await settleGame(game.id);
    setStep("settlement");
  };

  const resetAll = () => {
    setSelected([]);
    setActiveGameId(null);
    setStep("home");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500 text-sm">
        読み込み中…
      </div>
    );
  }

  // 未ログインならログイン/新規登録画面を表示し、それ以外の画面には進ませない
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-3">
        <div className="w-full max-w-[420px] rounded-[34px] overflow-hidden border-[8px] border-[#0B0F0D] shadow-2xl relative bg-[#FAF9F5]" style={{ height: 780 }}>
          <LoginScreen />
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500 text-sm">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-3">
      <div className="w-full max-w-[420px] rounded-[34px] overflow-hidden border-[8px] border-[#0B0F0D] shadow-2xl relative bg-[#FAF9F5]" style={{ height: 780 }}>
        {step === "home" && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-semibold tracking-tight">PokerNest</div>
                <div className="text-xs text-stone-500 mt-1">Home Game Tracker</div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-[#16231C] text-white flex items-center justify-center text-sm"
                >
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 bg-white border border-black/[0.08] rounded-xl shadow-lg py-1.5 w-44 z-10">
                    <div className="px-3.5 py-2 text-xs text-stone-500 border-b border-black/[0.06] truncate">
                      {user.displayName ? `${user.displayName} さん` : user.email}
                    </div>
                    <button
                      onClick={() => signOutUser()}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-[#C9584A] flex items-center gap-2"
                    >
                      <LogOut size={14} /> ログアウト
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <div className="flex-1 bg-white border border-black/[0.08] rounded-2xl p-4">
                <div className="text-[11px] text-stone-500 mb-1.5">参加回数</div>
                <div className="font-mono text-xl font-semibold">7 <span className="text-xs font-sans text-stone-500">回</span></div>
              </div>
              <div className="flex-1 bg-white border border-black/[0.08] rounded-2xl p-4">
                <div className="text-[11px] text-stone-500 mb-1.5">最終プレイ日</div>
                <div className="font-mono text-xl font-semibold">8月17日</div>
              </div>
            </div>

            <div className="mt-8 text-xs font-semibold text-stone-500 mb-2.5">ゲームをはじめる</div>

            <button
              onClick={() => setStep("setup")}
              className="w-full text-left rounded-[20px] p-5 mb-3 text-[#EAF3EC]"
              style={{ background: "linear-gradient(135deg, #163a25 0%, #0d2218 100%)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[11px] tracking-widest font-semibold mb-1.5" style={{ color: "#5DCAA5" }}>RING GAME</div>
                  <div className="text-xl font-semibold">キャッシュゲームで遊ぶ</div>
                </div>
                <ArrowRight size={20} color="#5DCAA5" />
              </div>
            </button>

            <button disabled className="w-full text-left rounded-[20px] p-5 border border-dashed border-[#E8C76A]/40 bg-[#E8C76A]/[0.06] cursor-not-allowed">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[11px] tracking-widest font-semibold mb-1.5 text-[#B8933F]">TOURNAMENT</div>
                  <div className="text-lg font-semibold
