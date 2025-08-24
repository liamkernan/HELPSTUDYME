import React from "react";
import { useAuth } from "../../AuthContext";
import { ArrowLeft } from "lucide-react";

export default function ApSelector({ onSelectSubject, onViewHistory, onBack }) {
    const subjects = [
        { id: "calcAB",     name: "Calculus AB 📐",        glassBg: "bg-blue-500/10",      glassHover: "bg-blue-400/20",      glassBorder: "border-blue-400/30",      glassBorderHover: "hover:border-blue-300/50" },
        { id: "calcBC",     name: "Calculus BC 📏",        glassBg: "bg-cyan-500/10",      glassHover: "bg-cyan-400/20",      glassBorder: "border-cyan-400/30",      glassBorderHover: "hover:border-cyan-300/50" },
        { id: "stats",      name: "Statistics 📊",         glassBg: "bg-emerald-500/10",   glassHover: "bg-emerald-400/20",   glassBorder: "border-emerald-400/30",   glassBorderHover: "hover:border-emerald-300/50" },
        { id: "bio",        name: "Biology 🧬",            glassBg: "bg-green-500/10",     glassHover: "bg-green-400/20",     glassBorder: "border-green-400/30",     glassBorderHover: "hover:border-green-300/50" },
        { id: "chem",       name: "Chemistry 🧪",          glassBg: "bg-yellow-500/10",    glassHover: "bg-yellow-400/20",    glassBorder: "border-yellow-400/30",    glassBorderHover: "hover:border-yellow-300/50" },
        { id: "physicsC",   name: "Physics C ⚛️",         glassBg: "bg-purple-500/10",    glassHover: "bg-purple-400/20",    glassBorder: "border-purple-400/30",    glassBorderHover: "hover:border-purple-300/50" },
        { id: "usHistory",  name: "US History 🗽",         glassBg: "bg-red-500/10",       glassHover: "bg-red-400/20",       glassBorder: "border-red-400/30",       glassBorderHover: "hover:border-red-300/50" },
        { id: "euroHistory",name: "European History 🏰",   glassBg: "bg-rose-500/10",      glassHover: "bg-rose-400/20",      glassBorder: "border-rose-400/30",      glassBorderHover: "hover:border-rose-300/50" },
        { id: "humanGeo",   name: "Human Geography 🌍",    glassBg: "bg-teal-500/10",      glassHover: "bg-teal-400/20",      glassBorder: "border-teal-400/30",      glassBorderHover: "hover:border-teal-300/50" },
        { id: "psych",      name: "Psychology 🧠",         glassBg: "bg-pink-500/10",      glassHover: "bg-pink-400/20",      glassBorder: "border-pink-400/30",      glassBorderHover: "hover:border-pink-300/50" },
        { id: "compSci",    name: "Computer Science A 💻", glassBg: "bg-indigo-500/10",    glassHover: "bg-indigo-400/20",    glassBorder: "border-indigo-400/30",    glassBorderHover: "hover:border-indigo-300/50" },
        { id: "lit",        name: "Literature 📚",         glassBg: "bg-amber-500/10",     glassHover: "bg-amber-400/20",     glassBorder: "border-amber-400/30",     glassBorderHover: "hover:border-amber-300/50" },
    ];

    const { user, signIn, signOut, loading } = useAuth();

    return (
        <section className="relative animated-gradient min-h-screen flex flex-col items-center justify-center text-gray-100 px-4 sm:px-6">
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
                        <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full shadow transition backdrop-blur">
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

            <div className="max-w-5xl w-full mt-10 p-8 bg-white/10 backdrop-blur border border-white/20 rounded-2xl shadow-2xl">
                <h1 className="text-3xl sm:text-5xl md:text-5xl font-bold mb-4 text-center text-white tracking-wide" style={{ fontFamily: '"Crimson Pro", "Crimson Text", serif' }}>
                    AP Practice Questions
                </h1>
                <p className="text-xl md:text-2xl text-center text-gray-300 mb-8" style={{ fontFamily: '"Crimson Pro", "Crimson Text", serif' }}>
                    Unlimited AI-generated questions and instant feedback—<b><i>free forever.</i></b>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subj) => (
                        <button
                            key={subj.id}
                            onClick={() => onSelectSubject(subj.name)}
                            className={`
                p-6 ${subj.glassBg} backdrop-blur border ${subj.glassBorder} ${subj.glassBorderHover} text-white rounded-2xl shadow-xl
                hover:${subj.glassHover} transform hover:-translate-y-1
                transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-white/40
              `}
                        >
                            <span className="text-lg font-semibold">{subj.name}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={onViewHistory}
                        className="
              w-3/4 sm:w-1/2 lg:w-1/3 p-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-2xl shadow-lg
              hover:bg-white/20 hover:border-white/30 transform hover:-translate-y-1
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-white
            "
                    >
                        <span className="text-lg font-semibold">View Question History</span>
                    </button>
                </div>
            </div>
        </section>
    );
}