import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

// Firebaseコンソールの「プロジェクトの設定」からコピーした値を .env.local に入れてください。
// 詳しい手順は README.md を参照。
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/** ログイン状態の変化を購読する（未ログインならuserはnull） */
export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** 新規登録（メール＋パスワード＋表示名） */
export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

/** ログイン（メール＋パスワード） */
export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** ログアウト */
export function signOutUser() {
  return signOut(auth);
}

/** Firebaseのエラーコードを日本語の分かりやすいメッセージに変換 */
export function translateAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "このメールアドレスは既に登録されています。ログインをお試しください。";
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";
    case "auth/weak-password":
      return "パスワードは6文字以上にしてください。";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "メールアドレスまたはパスワードが正しくありません。";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。しばらく待ってから再度お試しください。";
    default:
      return "エラーが発生しました。もう一度お試しください。";
  }
}
