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
                  <div className="text-lg font-semibold opacity-60">トーナメントで遊ぶ</div>
                </div>
                <span className="text-[11px] text-stone-500">近日公開</span>
              </div>
            </button>
          </div>
        )}

        {step === "setup" && (
          <div className="h-full overflow-y-auto p-6">
            <TopBar title="単位・スタック設定" onBack={() => setStep("home")} />
            <Field label="ポイント単位名">
              <input className="input" value={unitName} onChange={(e) => setUnitName(e.target.value)} />
            </Field>
            <Field label="換算率（1チップ = ？単位）">
              <input className="input font-mono" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))} />
            </Field>
            <Field label="スタートチップ枚数">
              <input className="input font-mono" value={startStack} onChange={(e) => setStartStack(e.target.value.replace(/[^0-9]/g, ""))} />
            </Field>
            <div className="bg-white border border-black/[0.08] rounded-2xl p-4 mb-6">
              <div className="text-xs text-stone-500 mb-1">初期投資単位数（自動算出）</div>
              <div className="font-mono text-xl font-semibold text-[#3E8D71]">{perBuyin.toLocaleString()} {unitName}</div>
            </div>
            <PrimaryButton onClick={() => setStep("confirm")}>次へ <ArrowRight size={16} /></PrimaryButton>
          </div>
        )}

        {step === "confirm" && (
          <div className="h-full overflow-y-auto p-6">
            <TopBar title="設定の確認" onBack={() => setStep("setup")} />
            {[
              ["単位名", unitName],
              ["換算率", `1chip = ${rateNum} ${unitName}`],
              ["スタートチップ", `${stackNum.toLocaleString()} chips`],
              ["初期投資単位", `${perBuyin.toLocaleString()} ${unitName}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3.5 border-b border-black/[0.08]">
                <span className="text-sm text-stone-500">{k}</span>
                <span className="font-mono text-sm font-semibold">{v}</span>
              </div>
            ))}
            <div className="h-5" />
            <PrimaryButton onClick={() => setStep("participants")}>参加者を選ぶ <ArrowRight size={16} /></PrimaryButton>
            <div className="h-2.5" />
            <PrimaryButton variant="ghost" onClick={() => setStep("setup")}>設定を修正する</PrimaryButton>
          </div>
        )}

        {step === "participants" && (
          <div className="h-full overflow-y-auto p-6 pb-28 relative">
            <TopBar title="参加者を選択" onBack={() => setStep("confirm")} />
            <div className="text-xs text-stone-500 mb-3.5 flex items-center gap-1.5">
              <Users size={14} /> グループメンバーから選択（{selected.length}人）
            </div>
            {members.map((m) => {
              const on = selected.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`w-full flex items-center justify-between p-3.5 mb-2 rounded-2xl border ${on ? "border-[#4CB68F] bg-[#5DCAA5]/10" : "border-black/[0.1] bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16231C] text-white flex items-center justify-center text-xs">{m.name[0]}</div>
                    <span className="text-[15px] font-medium">{m.name}</span>
                  </div>
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center ${on ? "bg-[#4CB68F]" : "border border-black/20"}`} style={{ width: 22, height: 22 }}>
                    {on && <Check size={14} color="#fff" />}
                  </div>
                </button>
              );
            })}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]">
              <PrimaryButton disabled={selected.length < 2} onClick={startGame}>
                {selected.length < 2 ? "2人以上選択してください" : `ゲーム開始（${selected.length}人）`}
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === "game" && game && (
          <div className="h-full overflow-y-auto p-5 pb-28 relative text-[#EAF3EC]" style={{ background: "radial-gradient(120% 90% at 50% -10%, #1b4a30 0%, #0d2218 70%)" }}>
            <TopBar title="キャッシュゲーム進行中" felt onBack={() => setStep("participants")} />
            <div className="text-xs opacity-55 mb-3.5">
              1chip = {game.rate} {game.unitName} ／ 初期投資 {unitsPerBuyin(game).toLocaleString()} {game.unitName}
            </div>
            {game.participantIds.map((id) => {
              const m = members.find((x) => x.id === id);
              const n = game.buyins[id] ?? 0;
              const inv = n * unitsPerBuyin(game);
              return (
                <div key={id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-2.5">
                  <div>
                    <div className="text-[15px] font-medium">{m?.name}</div>
                    <div className="text-[11.5px] opacity-50 mt-0.5">
                      バイイン {n}回 ・ 投資 <span className="font-mono text-[#5DCAA5]">{inv.toLocaleString()}</span> {game.unitName}
                    </div>
                  </div>
                  <button
                    onClick={() => addRebuy(game.id, id, game.buyins)}
                    className="w-8.5 h-8.5 rounded-full border border-[#5DCAA5]/40 bg-[#5DCAA5]/10 text-[#5DCAA5] flex items-center justify-center"
                    style={{ width: 34, height: 34 }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              );
            })}
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(180deg, rgba(13,34,24,0) 0%, #0d2218 40%)" }}>
              <PrimaryButton onClick={goCashout}>チップカウント入力へ <ArrowRight size={16} /></PrimaryButton>
            </div>
          </div>
        )}

        {step === "cashout" && game && (
          <div className="h-full overflow-y-auto p-5 pb-28 relative text-[#EAF3EC]" style={{ background: "radial-gradient(120% 90% at 50% -10%, #1b4a30 0%, #0d2218 70%)" }}>
            <TopBar title="最終チップカウント" felt onBack={() => setStep("game")} />
            <div className="text-xs opacity-55 mb-3.5">各プレイヤーの最終チップ枚数を入力（ホスト代理入力）</div>
            {game.participantIds.map((id) => {
              const m = members.find((x) => x.id === id);
              return (
                <div key={id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3 mb-2.5">
                  <span className="text-[15px] font-medium">{m?.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      inputMode="numeric"
                      placeholder="0"
                      value={finalChipDraft[id] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setFinalChipDraft((d) => ({ ...d, [id]: v }));
                        setFinalChip(game.id, id, game.finalChips, parseFloat(v) || 0);
                      }}
                      className="w-24 text-right bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-[#EAF3EC] font-mono text-[15px] outline-none"
                    />
                    <span className="text-xs opacity-50">chips</span>
                  </div>
                </div>
              );
            })}
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(180deg, rgba(13,34,24,0) 0%, #0d2218 40%)" }}>
              <PrimaryButton
                disabled={game.participantIds.some((id) => finalChipDraft[id] === undefined || finalChipDraft[id] === "")}
                onClick={confirmSettlement}
              >
                結果を確定する <Check size={16} />
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === "settlement" && game && (
          <div className="h-full overflow-y-auto p-6">
            <TopBar title="収支結果" onBack={() => setStep("cashout")} />
            <div className="text-center mb-5">
              <Trophy size={26} color="#B8933F" className="inline-block" />
              <div className="text-xl font-semibold mt-2">ゲーム結果</div>
            </div>
            {computeSettlement(game, members).map((r) => {
              const pos = r.profit >= 0;
              return (
                <div key={r.memberId} className="flex items-center justify-between p-3.5 mb-2 rounded-2xl bg-white border border-black/[0.08]">
                  <div>
                    <div className="text-[15px] font-medium">{r.name}</div>
                    <div className="text-[11.5px] text-stone-500 mt-0.5">
                      投資 {r.invested.toLocaleString()} → 最終 {r.finalUnits.toLocaleString()} {game.unitName}
                    </div>
                  </div>
                  <div className={`font-mono text-[17px] font-semibold ${pos ? "text-[#3E8D71]" : "text-[#C9584A]"}`}>
                    {pos ? "+" : ""}{r.profit.toLocaleString()}
                  </div>
                </div>
              );
            })}
            <div className="h-4" />
            <PrimaryButton variant="dark" onClick={resetAll}><RotateCcw size={15} /> ホームに戻る</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function TopBar({ title, onBack, felt }: { title: string; onBack: () => void; felt?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-3 -mt-1">
      <button onClick={onBack} className={`p-1 opacity-75 ${felt ? "text-[#EAF3EC]" : ""}`}>
        <ChevronLeft size={22} />
      </button>
      <div className="text-[13px] font-semibold uppercase tracking-wider opacity-60">{title}</div>
      <div className="w-6" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4.5">
      <div className="text-xs font-semibold opacity-55 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = "mint",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "mint" | "dark" | "ghost";
}) {
  const base = "w-full py-3.5 px-5 rounded-2xl font-semibold text-[15.5px] flex items-center justify-center gap-2 transition";
  const styles = {
    mint: "text-[#0D2218] shadow-lg shadow-[#4CB68F]/30",
    dark: "bg-[#16231C] text-[#EAF3EC]",
    ghost: "bg-transparent border border-black/[0.14] text-[#16231C]",
  } as const;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabled ? "bg-black/10 text-black/35 cursor-not-allowed" : styles[variant]}`}
      style={!disabled && variant === "mint" ? { background: "linear-gradient(180deg, #6BDBB0 0%, #4CB68F 100%)" } : undefined}
    >
      {children}
    </button>
  );
}
