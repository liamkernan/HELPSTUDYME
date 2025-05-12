import React from "react";
import { useAuth } from "../AuthContext";
import { ArrowLeft } from "lucide-react";

export default function MainMenu({ onSelectSubject, onViewHistory, onBack }) {
    const subjects = [
        { id: "calcAB",     name: "Calculus AB 📐",        color: "bg-blue-500",   hoverColor: "bg-blue-600" },
        { id: "calcBC",     name: "Calculus BC 📏",        color: "bg-blue-500",   hoverColor: "bg-blue-600" },
        { id: "stats",      name: "Statistics 📊",         color: "bg-green-500",  hoverColor: "bg-green-600" },
        { id: "bio",        name: "Biology 🧬",            color: "bg-green-500",  hoverColor: "bg-green-600" },
        { id: "physicsC",   name: "Physics C ⚛️",         color: "bg-purple-500", hoverColor: "bg-purple-600" },
        { id: "usHistory",  name: "US History 🗽",         color: "bg-red-500",    hoverColor: "bg-red-600" },
        { id: "chem",       name: "Chemistry 🧪",          color: "bg-yellow-500", hoverColor: "bg-yellow-600" },
        { id: "euroHistory",name: "European History 🏰",   color: "bg-red-500",    hoverColor: "bg-red-600" },
        { id: "psych",      name: "Psychology 🧠",         color: "bg-pink-500",   hoverColor: "bg-pink-600" },
        { id: "compSci",    name: "Computer Science A 💻", color: "bg-indigo-500", hoverColor: "bg-indigo-600" },
        { id: "humanGeo",   name: "Human Geography 🌍",    color: "bg-teal-500",   hoverColor: "bg-teal-600" },
        { id: "lit",        name: "Literature 📚",         color: "bg-amber-500",  hoverColor: "bg-amber-600" },
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

            <div className="max-w-5xl w-full mt-10 p-8 bg-pastelBlue rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-900">
                    AP Practice Questions
                </h1>
                <p className="text-center text-blue-950 mb-8">
                    Unlimited AI-generated questions and instant feedback—<b>free forever.</b>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subj) => (
                        <button
                            key={subj.id}
                            onClick={() => onSelectSubject(subj.id)}
                            className={`
                relative p-6 ${subj.color} text-white rounded-2xl shadow-lg
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