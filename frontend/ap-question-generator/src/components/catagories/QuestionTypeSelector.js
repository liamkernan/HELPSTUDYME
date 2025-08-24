import React, {useState} from "react";
import {ArrowLeft} from "lucide-react";
import { useAuth } from "../../AuthContext";

function QuestionTypeSelector({ onSelectType, onBack, activeSubject }) {
    const formatSubjectName = (subject) => {
        const words = subject.split("-");
        return words
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const { user, signIn, signOut, loading } = useAuth();
    const [idx, setIdx] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    return (
        <section 
            className="relative min-h-screen w-full flex flex-col items-center justify-center text-gray-100 px-4 sm:px-6"
            style={{
                background: 'linear-gradient(135deg, #1a1a2e, rgba(45, 25, 75, 0.7), #0f0f23, #3d1f4a, #1f2d47)',
                backgroundSize: '600% 600%',
                animation: 'gradientAnimation 15s ease infinite',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        >
            <div className="absolute top-4 left-4">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Menu</span>
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

            <div className="max-w-4xl w-full mt-10 p-8 bg-white/10 backdrop-blur border border-white/20 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-2 text-center text-white">
                    {formatSubjectName(activeSubject)}
                </h2>
                <p className="text-center text-gray-200 mb-8">Select question type</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                    <button
                        onClick={() => onSelectType("multiple-choice")}
                        className="flex flex-col justify-center items-center h-56 p-8 
                                   bg-blue-500/20 backdrop-blur border border-blue-400/30 text-white rounded-2xl shadow-xl
                                   hover:bg-blue-400/30 hover:border-blue-300/50 transform hover:-translate-y-1
                                   transition-all duration-200
                                   focus:outline-none focus:ring-4 focus:ring-white/40"
                    >
                        <span className="text-2xl font-semibold">Multiple Choice</span>
                        <p className="mt-3 text-base text-center">
                            Practice with AP-style multiple choice questions
                        </p>
                    </button>

                    <button
                        onClick={() => onSelectType("free-response")}
                        className="flex flex-col justify-center items-center h-56 p-8
                                   bg-green-500/20 backdrop-blur border border-green-400/30 text-white rounded-2xl shadow-xl
                                   hover:bg-green-400/30 hover:border-green-300/50 transform hover:-translate-y-1
                                   transition-all duration-200
                                   focus:outline-none focus:ring-4 focus:ring-white/40"
                    >
                        <span className="text-2xl font-semibold">Free Response</span>
                        <p className="mt-3 text-base text-center">
                            Practice with AP-style free response questions and get AI feedback
                        </p>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default QuestionTypeSelector;