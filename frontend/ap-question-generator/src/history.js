import { db, auth } from "./firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

export async function logQuestion(qObj) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const col = collection(db, "users", uid, "history");
    await addDoc(col, { ...qObj, createdAt: serverTimestamp() });
}

export async function fetchHistory() {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const col = collection(db, "users", uid, "history");
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}