import React, { useEffect, useState } from "react";
import { fetchHistory } from "../history";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

const parsePrompt = (raw = "", correctLetter = null) => {
    const rawLines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length);

    let correctIndex = rawLines.findIndex((l) => l.includes("***"));
    const lines = rawLines.map((l) => l.replace(/\*\*\*/g, "").trim());

    if (correctIndex === -1 && correctLetter) {
        correctIndex = lines.findIndex((l) => l.startsWith(correctLetter));
    }
    return { lines, correctIndex };
};

function QuestionHistory({ onBackToMenu }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    useEffect(() => {
        fetchHistory()
            .then((data) => {
                const processed = data.map((q) => {
                    const { lines, correctIndex } = parsePrompt(q.prompt, q.correct);
                    const chosenIndex = lines.findIndex((l) =>
                        l.startsWith(q.chosen)
                    );
                    return { ...q, lines, correctIndex, chosenIndex };
                });
                setQuestions(processed);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                const el = document.getElementById("history-container");
                if (el) {
                    renderMathInElement(el, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$",  right: "$",  display: false },
                            { left: "\\(", right: "\\)", display: false },
                            { left: "\\[", right: "\\]", display: true },
                        ],
                    });
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [loading, questions]);

    if (loading) return <div className="p-6 text-white">Loading...</div>;
    if (error)   return <div className="p-6 text-red-400">Error: {error}</div>;

    return (
        <div id="history-container" className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Question History</h1>
                    <p className="text-sm italic text-gray-300 mt-1">
                        Below you can find a full list of your Multiple Choice and Free-Response questions.
                    </p>
                    <p className="text-sm text-white mt-3 italic">
                        <span className="text-green-500 font-bold">Green</span> = your choice was correct;{" "}
                        <span className="text-red-500 font-bold">Red</span> = your choice was incorrect
                    </p>
                </div>
                <button
                    onClick={onBackToMenu}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full shadow transition text-white"
                >
                    Back to Menu
                </button>
            </div>

            {questions.length === 0 ? (
                <p className="text-white text-2xl">sign in, or start studying ;)</p>
            ) : (
                <ul className="space-y-3">
                    {questions.map((q, idx) => {
                        const bgClass = q.match
                            ? "bg-green-600/60 hover:bg-gray-900"
                            : "bg-red-700/60   hover:bg-gray-900";

                        return (
                            <li
                                key={idx}
                                className={`p-4 border border-gray-700 rounded-xl shadow transition-colors ${bgClass}`}
                            >
                                <p className="text-white font-semibold mb-3">Prompt:</p>
                                <div className="whitespace-pre-wrap space-y-1 mb-2">
                                    {q.lines.map((line, i) => {
                                        let cls = "text-gray-300";
                                        if (i === q.correctIndex) {
                                            cls = "text-white font-bold";
                                        } else if (!q.match && i === q.chosenIndex) {
                                            cls = "text-gray-300/80 line-through";
                                        }
                                        return (
                                            <p key={i} className={cls}>
                                                {line}
                                            </p>
                                        );
                                    })}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default QuestionHistory;