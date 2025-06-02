import React, { useEffect, useState } from "react";
import { fetchHistory } from "../history";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

const parsePrompt = (raw = "", correctLetter = null) => {
    const rawLines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length);

    // Find the line with *** marker
    let correctIndex = rawLines.findIndex((l) => l.includes("***"));
    const lines = rawLines.map((l) => l.replace(/\*\*\*/g, "").trim());

    // If no *** found but we have a correct letter, find that line
    if (correctIndex === -1 && correctLetter) {
        correctIndex = lines.findIndex((l) => {
            const lineStart = l.match(/^([A-D])[.)\s]/);
            return lineStart && lineStart[1] === correctLetter;
        });
    }
    
    // Final fallback - look for any line starting with the correct letter
    if (correctIndex === -1 && correctLetter) {
        correctIndex = lines.findIndex((l) => l.startsWith(correctLetter));
    }
    
    return { lines, correctIndex };
};

const getCleanSubjectName = (subject = "") => {
    if (!subject) return 'General';
    
    const cleanSubject = subject.replace(/[^\w\s]/g, '').trim();
    
    return cleanSubject || 'General';
};

function QuestionHistory({ onBackToMenu }) {
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');
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
                    const topic = getCleanSubjectName(q.subject);
                    return { ...q, lines, correctIndex, chosenIndex, topic };
                });
                
                // Sort by completion time, newest first
                const sorted = processed.sort((a, b) => {
                    const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
                    const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
                    return timeB - timeA;
                });
                
                setQuestions(sorted);
                setFilteredQuestions(sorted);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    // Filter questions when subject selection changes
    useEffect(() => {
        if (selectedSubject === 'All Subjects') {
            setFilteredQuestions(questions);
        } else {
            setFilteredQuestions(questions.filter(q => q.topic === selectedSubject));
        }
    }, [selectedSubject, questions]);

    // Get unique subjects for dropdown
    const getUniqueSubjects = () => {
        const subjects = [...new Set(questions.map(q => q.topic))].sort();
        return ['All Subjects', ...subjects];
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 24 * 7) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

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
                        <span className="text-green-500 font-bold">Green</span> = correct choice;{" "}
                        <span className="text-red-500 font-bold">Red</span> = incorrect choice
                    </p>
                </div>
                <button
                    onClick={onBackToMenu}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full shadow transition text-white"
                >
                    Back to Menu
                </button>
            </div>

            {questions.length > 0 && (
                <div className="mb-6 flex items-center gap-3">
                    <label htmlFor="subject-filter" className="text-white font-semibold">
                        Filter by Subject:
                    </label>
                    <select
                        id="subject-filter"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-0"
                    >
                        {getUniqueSubjects().map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {questions.length === 0 ? (
                <p className="text-white text-2xl">sign in, or start studying ;)</p>
            ) : filteredQuestions.length === 0 ? (
                <p className="text-white text-lg">No questions found for "{selectedSubject}"</p>
            ) : (
                <ul className="space-y-3">
                    {filteredQuestions.map((q, idx) => {
                        const bgClass = q.match
                            ? "bg-green-600/60 hover:bg-gray-900"
                            : "bg-red-700/60   hover:bg-gray-900";

                        return (
                            <li
                                key={idx}
                                className={`p-4 border border-gray-700 rounded-xl shadow transition-colors ${bgClass}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-white font-semibold">{q.topic} Prompt:</p>
                                    <p className="text-gray-400 text-sm italic">{formatTimestamp(q.createdAt)}</p>
                                </div>
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