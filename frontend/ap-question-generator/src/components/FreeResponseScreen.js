import React, { useState, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import 'katex/dist/katex.min.css';

function MathRenderer({ text }) {
    const regex = /\\\[(.+?)\\\]|\\\((.+?)\\\)/gs;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        if (match[1] != null) {
            parts.push({ type: 'display', content: match[1].trim() });
        } else {
            parts.push({ type: 'inline', content: match[2].trim() });
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts.map((part, i) => {
        if (part.type === 'display') return <BlockMath key={i} math={part.content} />;
        if (part.type === 'inline')  return <InlineMath key={i} math={part.content} />;
        return <span key={i}>{part.content}</span>;
    });
}

export default function FreeResponseScreen({
                                               question,
                                               loading,
                                               activeSubject,
                                               onSubmitResponse,
                                               onNewQuestion,
                                               onBackToMenu,
                                               feedbackData
                                           }) {
    const [userResponse, setUserResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Split on blank lines so multi-line LaTeX blocks stay intact
    const questionBlocks = useMemo(() => question.split(/\n{2,}/g), [question]);
    const responseBlocks = useMemo(() => userResponse.split(/\n{2,}/g), [userResponse]);
    const feedbackBlocks = useMemo(
        () => (feedbackData?.feedback || '').split(/\n{2,}/g),
        [feedbackData]
    );

    const formatSubjectName = subject =>
        subject
            .split('-')
            .map(w => w[0].toUpperCase() + w.slice(1))
            .join(' ');

    const handleSubmit = async () => {
        if (!userResponse.trim()) return;
        setIsSubmitting(true);
        await onSubmitResponse(userResponse);
        setIsSubmitting(false);
    };

    return (
        <div className="free-response-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                    {activeSubject && formatSubjectName(activeSubject)} Free Response
                </h2>
                <button
                    onClick={onBackToMenu}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                >
                    ← Back to Menu
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <ArrowPathIcon className="h-12 w-12 text-pastelBlue animate-spin mb-4" />
                    <p className="text-white">Generating question...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* Question blocks */}
                    {questionBlocks.map((block, idx) => (
                        <div key={idx} className="question-text mb-6">
                            <MathRenderer text={block} />
                        </div>
                    ))}

                    {!feedbackData ? (
                        <>
                            {/* Response textarea */}
                            <div className="mb-4">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your response here..."
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    disabled={isSubmitting}
                />
                            </div>

                            {/* Submit / New Question */}
                            <div className="flex justify-between">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !userResponse.trim()}
                                    className={`px-6 py-2 rounded-lg ${
                                        isSubmitting || !userResponse.trim()
                                            ? 'bg-blue-300 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    {isSubmitting ? 'Grading...' : 'Submit Response'}
                                </button>
                                <button
                                    onClick={onNewQuestion}
                                    className="bg-yellow-200 hover:bg-yellow-300 px-4 py-2 rounded-lg"
                                >
                                    New Question
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="feedback-container">
                            {/* User response blocks */}
                            <h3 className="text-xl font-semibold mb-3">Your Response:</h3>
                            <div className="user-response p-3 bg-gray-50 rounded-lg mb-5">
                                {responseBlocks.map((block, idx) => (
                                    <div key={idx} className="mb-4">
                                        <MathRenderer text={block} />
                                    </div>
                                ))}
                            </div>

                            {/* Feedback blocks */}
                            <h3 className="text-xl font-semibold mb-3">Feedback:</h3>
                            <div className="feedback p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5">
                                {feedbackBlocks.map((block, idx) => (
                                    <div key={idx} className="mb-4">
                                        <MathRenderer text={block} />
                                    </div>
                                ))}
                            </div>

                            {/* Score Analysis */}
                            <div className="score-section p-4 bg-green-50 border border-green-200 rounded-lg mb-5">
                                <h4 className="text-lg font-medium mb-2">Score Analysis</h4>
                                <p className="mb-2">
                                    <strong>Projected Score:</strong> {feedbackData.score} out of {feedbackData.maxScore}
                                </p>
                                <p>
                                    <strong>Score Explanation:</strong> {feedbackData.scoreExplanation}
                                </p>
                            </div>

                            {/* Try Another */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setUserResponse('');
                                        onNewQuestion();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                >
                                    Try Another Question
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}