import React, { createContext, useContext, useEffect, useState } from "react";
import { auth }  from "./firebase";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as fbSignOut,
} from "firebase/auth";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
        return unsub;
    }, []);

    const signIn = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = () => fbSignOut(auth);

    return (
        <AuthCtx.Provider value={{ user, signIn, signOut, loading }}>
            {children}
        </AuthCtx.Provider>
    );
}