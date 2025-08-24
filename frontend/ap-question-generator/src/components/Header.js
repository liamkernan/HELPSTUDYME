import React from "react";
import { useAuth } from "../AuthContext";

function Header({ onBack }) {
    const { user, signIn, signOut, loading } = useAuth();

    return (
        <header className="relative bg-gray-900 text-white p-4 shadow-md">
            <div className="absolute top-4 right-4">
                {!loading && (
                    user ? (
                        <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full shadow transition">
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-8 h-8 rounded-full"
                            />
                            <button onClick={signOut} className="text-sm font-medium">
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signIn}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1 rounded-full shadow-lg font-semibold transition"
                        >
                            Sign in
                        </button>
                    )
                )}
            </div>

            {/* Text-as-button for navigation back to landing */}
            <button
                onClick={onBack}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    font: 'inherit',
                    color: 'inherit',
                    cursor: 'pointer',
                    textDecoration: 'none'
                }}
            >
                <h1 className="text-2xl font-bold mb-2">(helpstudy.me)</h1>
            </button>


        </header>
    );
}

export default Header;
