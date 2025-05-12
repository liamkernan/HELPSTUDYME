import React, { useEffect, useState } from "react";
import { fetchHistory } from "../history";

function QuestionHistory({ onBackToMenu }) {
    const [questions, setQuestions] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);

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

    useEffect(() => {
        fetchHistory()
            .then((data) => {
                const processed = data.map((q) => {
                    const { lines, correctIndex } = parsePrompt(q.prompt, q.correct);
                    return { ...q, lines, correctIndex };
                });
                setQuestions(processed);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-6"><p>Loading...</p></div>;
    if (error)   return <div className="p-6"><p>Error: {error}</p></div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Question History</h1>
                    <p className="text-sm italic text-gray-300 mt-1">
                        Below you can find a full list of your Multiple Choice and Free-Response questions. Correct choices are highlighted.
                    </p>
                </div>
                <button
                    onClick={onBackToMenu}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition"
                >
                    Back to Menu
                </button>
            </div>

            {questions.length === 0 ? (
                <p className="text-white">No questions found.</p>
            ) : (
                <ul className="space-y-3">
                    {questions.map((q, idx) => (
                        <li
                            key={idx}
                            className="p-4 border border-gray-700 rounded-xl bg-gray-900 shadow"
                        >
                            <p className="text-white font-semibold mb-3">Prompt:</p>

                            <div className="whitespace-pre-wrap space-y-1 mb-2">
                                {q.lines.map((line, i) => (
                                    <p
                                        key={i}
                                        className={
                                            i === q.correctIndex
                                                ? "text-white font-bold"
                                                : "text-gray-300"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QuestionHistory;