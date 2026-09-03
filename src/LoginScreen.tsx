import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { signInWithEmail, signUpWithEmail, translateAuthError } from "./firebase";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      // 成功するとonAuthStateChangedが検知して自動的に画面が切り替わる
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      setError(translateAuthError(code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col justify-center">
      <div className="text-3xl font-semibold tracking-tight text-center">PokerNest</div>
      <div className="text-xs text-stone-500 text-center mt-1 mb-8">Home Game Tracker</div>

      <div className="flex bg-black/[0.06] rounded-full p-1 mb-6">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
            mode === "signin" ? "bg-white shadow" : "text-stone-500"
          }`}
        >
          ログイン
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
            mode === "signup" ? "bg-white shadow" : "text-stone-500"
          }`}
        >
          新規登録
        </button>
      </div>

      {mode === "signup" && (
        <div className="mb-4">
          <div className="text-xs font-semibold opacity-55 mb-1.5">お名前（表示名）</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="たけし" />
        </div>
      )}

      <div className="mb-4">
        <div className="text-xs font-semibold opacity-55 mb-1.5">メールアドレス</div>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="mb-2">
        <div className="text-xs font-semibold opacity-55 mb-1.5">パスワード</div>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6文字以上"
        />
      </div>

      {error && <div className="text-xs text-[#C9584A] mt-2 mb-1 leading-relaxed">{error}</div>}

      <button
        onClick={submit}
        disabled={busy || !email || !password || (mode === "signup" && !name)}
        className="w-full py-3.5 px-5 rounded-2xl font-semibold text-[15.5px] flex items-center justify-center gap-2 mt-5 disabled:bg-black/10 disabled:text-black/35 disabled:cursor-not-allowed text-[#0D2218] shadow-lg shadow-[#4CB68F]/30"
        style={
          !busy && email && password && !(mode === "signup" && !name)
            ? { background: "linear-gradient(180deg, #6BDBB0 0%, #4CB68F 100%)" }
            : undefined
        }
      >
        {mode === "signup" ? <UserPlus size={16} /> : <LogIn size={16} />}
        {busy ? "処理中…" : mode === "signup" ? "登録してはじめる" : "ログイン"}
      </button>
    </div>
  );
}
