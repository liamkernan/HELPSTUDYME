import React from "react";
import { useAuth } from "../../AuthContext";
import { ArrowLeft } from "lucide-react";

export default function SatSelectorx({ onSelectSubject, onViewHistory, onBack }) {
    const subjects = [
        { id: "craftstructure",     name: "English: Craft and Structure",        glassBg: "bg-rose-500/10",     glassHover: "bg-rose-400/20",     glassBorder: "border-rose-400/30",     glassBorderHover: "hover:border-rose-300/50" },
        { id: "information",        name: "English: Information and Ideas",        glassBg: "bg-pink-500/10",     glassHover: "bg-pink-400/20",     glassBorder: "border-pink-400/30",     glassBorderHover: "hover:border-pink-300/50" },
        { id: "englishconventions", name: "English: Standard English Conventions", glassBg: "bg-red-500/10",      glassHover: "bg-red-400/20",      glassBorder: "border-red-400/30",      glassBorderHover: "hover:border-red-300/50" },
        { id: "expression",         name: "English: Expression of Ideas (notes)",  glassBg: "bg-fuchsia-500/10",  glassHover: "bg-fuchsia-400/20",  glassBorder: "border-fuchsia-400/30",  glassBorderHover: "hover:border-fuchsia-300/50" },
        { id: "algebra",            name: "Math: Algebra",                          glassBg: "bg-orange-500/10",   glassHover: "bg-orange-400/20",   glassBorder: "border-orange-400/30",   glassBorderHover: "hover:border-orange-300/50" },
        { id: "advanced",           name: "Math: Advanced & Quadratics",           glassBg: "bg-amber-500/10",    glassHover: "bg-amber-400/20",    glassBorder: "border-amber-400/30",    glassBorderHover: "hover:border-amber-300/50" },
        { id: "data",               name: "Math: Data Analysis",                   glassBg: "bg-yellow-500/10",   glassHover: "bg-yellow-400/20",   glassBorder: "border-yellow-400/30",   glassBorderHover: "hover:border-yellow-300/50" },
        { id: "geometery",          name: "Math: Geometery & Trigonometry",        glassBg: "bg-lime-500/10",     glassHover: "bg-lime-400/20",     glassBorder: "border-lime-400/30",     glassBorderHover: "hover:border-lime-300/50" },
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
                <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold mb-4 text-center text-white tracking-wide" style={{ fontFamily: '"Crimson Pro", "Crimson Text", serif' }}>
                    SAT Practice Questions
                </h1>
                <p className="text-xl md:text-2xl text-center text-gray-300 mb-8" style={{ fontFamily: '"Crimson Pro", "Crimson Text", serif' }}>
                    Unlimited AI-generated questions—<b><i>free forever.</i></b>
                </p>

                <div className="flex flex-col items-center space-y-4">
                    {subjects.map((subj) => (
                        <button
                            key={subj.id}
                            onClick={() => onSelectSubject(subj.name)}
                            className={`
    w-4/5 py-4 ${subj.glassBg} backdrop-blur border ${subj.glassBorder} ${subj.glassBorderHover} text-white rounded-xl shadow-xl
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