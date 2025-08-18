import React from "react";
import {
    GraduationCap,
    Landmark,
    BrainCircuit,
    Sparkles, ArrowLeft,
} from "lucide-react";
import {useAuth} from "../../AuthContext";


export default function ModeSelector({ onAP, onSAT, onACT, onYOURS, onBack }) {
    const modes = [
        {
            key: "ap",
            label: "AP Exams",
            onClick: onAP,
            icon: GraduationCap,
            bg: "bg-cyan-500/10 backdrop-blur border border-blue-400/30",
        },
        {
            key: "sat",
            label: "SAT",
            onClick: onSAT,
            icon: Landmark,
            bg: "bg-pink-500/10 backdrop-blur border border-pink-400/30",
        },
        {
            key: "act",
            label: "ACT",
            onClick: onACT,
            icon: BrainCircuit,
            bg: "bg-green-500/10 backdrop-blur border border-emerald-400/30",
        },
        {
            key: "yours",
            label: "Study Anything",
            onClick: onYOURS,
            icon: Sparkles,
            bg: "animated-gradient-all",
        },
    ];

    const { user, signIn, signOut, loading } = useAuth();

    return (
        <section className="relative animated-gradient min-h-screen flex flex-col items-center justify-center text-gray-100 px-4 sm:px-6 py-8">
            <div className="absolute top-4 left-4">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Home</span>
                </button>
            </div>
            <div className="absolute top-4 right-4">
                {!loading && (
                    user ? (
                        <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full shadow transition">
                            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                            <button
                                onClick={signOut}
                                className="text-sm font-medium"
                            >
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
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 max-w-6xl -mt-52 md:mt-0">
                {modes.map(({ key, label, onClick, icon: Icon, bg }) => (
                    <button
                        key={key}
                        onClick={onClick}
                        className={`flex flex-col items-center justify-between ${bg} rounded-3xl shadow-xl w-40 h-56 sm:w-48 sm:h-64 md:w-56 md:h-80 p-4 sm:p-6 md:p-8 transition-transform duration-200 hover:-translate-y-2 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-white/40`}
                    >
                        <Icon className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
                        <span className="mt-auto text-sm sm:text-lg md:text-xl font-semibold tracking-wide text-center">
              {label}
            </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
