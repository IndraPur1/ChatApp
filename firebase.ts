// firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  CollectionReference,
  DocumentData,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Config Firebase (pakai punyamu yang ini)
const firebaseConfig = {
  apiKey: "AIzaSyDK39DcGkymtnWVwRMlLthzJI32atvCBVU",
  authDomain: "chatapp-android-f6e8f.firebaseapp.com",
  projectId: "chatapp-android-f6e8f",
  storageBucket: "chatapp-android-f6e8f.firebasestorage.app",
  messagingSenderId: "215448541558",
  appId: "1:215448541558:web:86d6f335f7f2bae8374257",
  measurementId: "G-6JNCJ4S8BP",
};

// Init app
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const onAuthStateChangedFn = onAuthStateChanged;

// Firestore
export const db = getFirestore(app);

// Koleksi chat messages (dengan tipe lebih rapi)
export const messagesCollection =
  collection(db, "messages") as CollectionReference<DocumentData>;

/**
 * Register user (email + password + username)
 * - Buat akun di Firebase Auth
 * - Simpan username & email di Firestore: users/<uid>
 */
export async function registerWithEmail(
  email: string,
  password: string,
  username: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // simpan data user di Firestore
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, { username, email });

  return user;
}

/**
 * Login user dengan email & password
 */
export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Ambil username dari Firestore berdasarkan uid
 * - kalau dokumen user belum ada: fallback ke email / "Anon"
 */
export async function getUsernameForUser(user: User): Promise<string> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data() as any;
    return data.username ?? user.email ?? "Anon";
  }
  return user.email ?? "Anon";
}

/**
 * Logout dari Firebase Auth
 */
export async function logout() {
  await signOut(auth);
}

// Helper Firestore yang dipakai di ChatScreen
export {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
};