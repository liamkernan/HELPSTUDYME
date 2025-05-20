import React from "react";
import { useAuth } from "../../AuthContext";
import { ArrowLeft } from "lucide-react";

export default function SatSelectorx({ onSelectSubject, onViewHistory, onBack }) {
    const subjects = [
        { id: "craftstructure",     name: "English: Craft and Structure",        color: "bg-cyan-500",   hoverColor: "bg-teal-600" },
        { id: "information",     name: "English: Information and Ideas",        color: "bg-cyan-500",   hoverColor: "bg-teal-600" },
        { id: "englishconventions",      name: "English: Standard English Conventions",         color: "bg-cyan-500",  hoverColor: "bg-teal-600" },
        { id: "expression",        name: "English: Expression of Ideas (notes)",            color: "bg-cyan-500",  hoverColor: "bg-teal-600" },
        { id: "algebra",   name: "Math: Algebra",         color: "bg-green-500", hoverColor: "bg-pink-600" },
        { id: "advanced",  name: "Math: Advanced & Quadratics",         color: "bg-green-500",    hoverColor: "bg-pink-600" },
        { id: "data",       name: "Math: Data Analysis",          color: "bg-green-500", hoverColor: "bg-pink-600" },
        { id: "geometery",name: "Math: Geometery & Trigonometry",   color: "bg-green-500",    hoverColor: "bg-pink-600" },
    ];

    const { user, signIn, signOut, loading } = useAuth();

    return (
        <section className="relative animated-gradient-red min-h-screen flex flex-col items-center justify-center text-gray-100 px-4 sm:px-6">
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

            <div className="max-w-5xl w-full mt-10 p-8 bg-red-200 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-4 text-center text-red-900">
                    SAT Practice Questions
                </h1>
                <p className="text-center text-blue-950 mb-8">
                    Unlimited AI-generated questions and instant feedback—<b>free forever.</b>
                </p>

                <div className="flex flex-col items-center space-y-4">
                    {subjects.map((subj) => (
                        <button
                            key={subj.id}
                            onClick={() => onSelectSubject(subj.name)}
                            className={`
    w-4/5 py-4 ${subj.color} text-white rounded-xl shadow-lg
    hover:${subj.hoverColor} transform hover:-translate-y-1
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-white
  `}
                        >
                            <span className="text-lg font-semibold">{subj.name}</span>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white bg-opacity-30 rounded-b-2xl" />
                        </button>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={onViewHistory}
                        className="
              w-3/4 sm:w-1/2 lg:w-1/3 p-4 bg-gray-600 text-white rounded-2xl shadow-lg
              hover:bg-gray-700 transform hover:-translate-y-1
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-gray-400
            "
                    >
                        <span className="text-lg font-semibold">View Question History</span>
                    </button>
                </div>
            </div>
        </section>
    );
}