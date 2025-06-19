import React, { useState } from "react";
import { useAuth } from "../../AuthContext";
import { ArrowLeft, Send } from "lucide-react";

export default function StudyAnything({
                                          onBack,
                                          onViewHistory,
                                          onSelectMultipleChoice,
                                          onSelectFreeResponse,
                                          onSelectStudyMaterial,
                                      }) {
    const { user, signIn, signOut, loading } = useAuth();
    const [query, setQuery] = useState("");
    const [submittedSubject, setSubmittedSubject] = useState("");

    const handleSend = () => {
        if (!query.trim()) return;
        setSubmittedSubject(query.trim());
        setQuery("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    const headerClass =
        "text-8xl font-extrabold " +
        (submittedSubject ? "mt-24 mb-6" : "mt-52 mb-10");

    return (
        <div className="animated-gradient-all min-h-screen flex flex-col bg-blue-950 text-gray-100">
            <div className="container mx-auto p-6 flex flex-col items-start">
                <div className="absolute top-4 left-4">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Home</span>
                    </button>
                </div>

                <h1 className={headerClass}>STUDY ANYTHING</h1>

                {/* input + send button */}
                <div className="flex w-full max-w-xl items-center gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            submittedSubject || "What do you want to learn?"
                        }
                        className="
              flex-1
              bg-white/20 text-white placeholder-gray-200 font-semibold
              px-6 py-4
              rounded-3xl
              backdrop-blur-md
              border border-white/20
              focus:outline-none focus:ring-2 focus:ring-teal-400
              transition-shadow duration-300
            "
                    />
                    <button
                        onClick={handleSend}
                        aria-label="Send query"
                        className="
              w-12 h-12
              animated-gradient-all
              rounded-full
              flex items-center justify-center
              hover:bg-teal-500
              transition-colors
            "
                    >
                        <Send className="w-6 h-6 text-white" />
                    </button>
                </div>

                {submittedSubject && (
                    <div className="mt-12 flex w-full max-w-xl gap-6">
                        {/* Multiple Choice */}
                        <button
                            onClick={() => onSelectMultipleChoice(submittedSubject)}
                            className="
                flex flex-col justify-center items-start
                flex-1
                bg-gradient-to-br from-white/10 to-white/5
                text-white
                px-8 py-12
                rounded-3xl
                backdrop-blur-sm
                border border-white/10
                shadow-md
                hover:shadow-xl
                hover:from-white/20 hover:to-white/10
                transform hover:-translate-y-1
                transition-all duration-300
              "
                        >
                            <span className="text-2xl font-semibold">Multiple Choice</span>
                            <span className="mt-2 text-sm text-white/80">
                Choose the best answer
              </span>
                        </button>

                        {/* Free Response */}
                        <button
                            onClick={() => onSelectFreeResponse(submittedSubject)}
                            className="
                flex flex-col justify-center items-start
                flex-1
                bg-gradient-to-br from-white/10 to-white/5
                text-white
                px-8 py-12
                rounded-3xl
                backdrop-blur-sm
                border border-white/10
                shadow-md
                hover:shadow-xl
                hover:from-white/20 hover:to-white/10
                transform hover:-translate-y-1
                transition-all duration-300
              "
                        >
                            <span className="text-2xl font-semibold">Free Response</span>
                            <span className="mt-2 text-sm text-white/80">
                Write out your full answer
              </span>
                        </button>

                        {/* Study Material */}
                        <button
                            onClick={() => onSelectStudyMaterial(submittedSubject)}
                            className="
                flex flex-col justify-center items-start
                flex-1
                bg-gradient-to-br from-white/10 to-white/5
                text-white
                px-8 py-12
                rounded-3xl
                backdrop-blur-sm
                border border-white/10
                shadow-md
                hover:shadow-xl
                hover:from-white/20 hover:to-white/10
                transform hover:-translate-y-1
                transition-all duration-300
              "
                        >
                            <span className="text-2xl font-semibold">Study Material</span>
                            <span className="mt-2 text-sm text-white/80">
                Fully prepared notes
              </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}