import React, { useState } from "react";
import { useAuth } from "../../AuthContext";
import { ArrowLeft } from "lucide-react";

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

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && query.trim()) {
            setSubmittedSubject(query.trim());
            setQuery("");
        }
    };

    const headerClass =
        "text-8xl font-extrabold " +
        (submittedSubject ? "mt-24 mb-6" : "mt-52 mb-10");

    return (
        <div className="animated-gradient-all min-h-screen flex flex-col bg-blue-950 text-gray-100">
            <div className="container mx-auto p-6 flex flex-col items-start">
                <button
                    onClick={onBack}
                    className="underline text-teal-400 hover:text-teal-200 mb-4"
                >
                    ← Back Home
                </button>

                <h1 className={headerClass}>STUDY ANYTHING</h1>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What do you want to learn?"
                    className="
            w-full max-w-xl
            bg-white/20 text-white placeholder-gray-200 font-semibold
            px-6 py-4
            rounded-3xl
            backdrop-blur-md
            border border-white/20
            focus:outline-none focus:ring-2 focus:ring-teal-400
            transition-shadow duration-300
          "
                />

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

                        {/* Study Material (stub for now) */}
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
                (Coming soon…)
              </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}