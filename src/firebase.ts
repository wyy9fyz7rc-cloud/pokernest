import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";

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

/**
 * 今回のスプリントではログイン画面をまだ作らないため、匿名認証で自動サインインする。
 * これにより Firestore のセキュリティルールで「ログイン済みユーザーのみ許可」を
 * 最初から適用できる（あとでメールログインに差し替えても構造は変わらない）。
 */
export function ensureSignedIn(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        unsub();
        if (user) {
          resolve(user);
        } else {
          signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject);
        }
      },
      reject
    );
  });
}
