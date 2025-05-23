import React, { useState, useMemo } from "react";
import katex from "katex";
import 'katex/dist/katex.min.css';

function FreeResponseScreen({
                                question,
                                loading,
                                activeSubject,
                                onSubmitResponse,
                                onNewQuestion,
                                onBackToMenu,
                                feedbackData
                            }) {
    const [userResponse, setUserResponse] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatSubjectName = subject =>
        subject
            .split('-')
            .map(w => w[0].toUpperCase() + w.slice(1))
            .join(' ');

    const renderKaTeX = raw => {
        if (!raw) return '';
        let html = raw
            .replace(/\$\$([^$]+?)\$\$/gs, (_, expr) =>
                katex.renderToString(expr, { displayMode: true, throwOnError: false })
            )
            .replace(/\$([^$]+?)\$/gs, (_, expr) =>
                katex.renderToString(expr, { displayMode: false, throwOnError: false })
            );
        html = html.replace(/\n/g, '<br/>');
        return html;
    };

    const questionHTML = useMemo(() => renderKaTeX(question), [question]);
    const responseHTML = useMemo(() => renderKaTeX(userResponse), [userResponse]);
    const feedbackHTML = useMemo(() => feedbackData ? renderKaTeX(feedbackData.feedback) : '', [feedbackData]);

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
                <button onClick={onBackToMenu} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
                    Back to Menu
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-300 mb-4"></div>
                    <p className="text-blue-50">Generating question...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div
                        className="question-text mb-6"
                        style={{ whiteSpace: 'pre-wrap' }}
                        dangerouslySetInnerHTML={{ __html: questionHTML }}
                    />

                    {!feedbackData ? (
                        <>
                            <div className="mb-4">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your response here..."
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    disabled={isSubmitting}
                />
                            </div>

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
                                <button onClick={onNewQuestion} className="bg-yellow-200 hover:bg-yellow-300 px-4 py-2 rounded-lg">
                                    New Question
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="feedback-container">
                            <h3 className="text-xl font-semibold mb-3">Your Response:</h3>
                            <div
                                className="user-response p-3 bg-gray-50 rounded-lg mb-5"
                                dangerouslySetInnerHTML={{ __html: responseHTML }}
                            />

                            <h3 className="text-xl font-semibold mb-3">Feedback:</h3>
                            <div
                                className="feedback p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5"
                                dangerouslySetInnerHTML={{ __html: feedbackHTML }}
                            />

                            <div className="score-section p-4 bg-green-50 border border-green-200 rounded-lg mb-5">
                                <h4 className="text-lg font-medium mb-2">Score Analysis</h4>
                                <p className="mb-2"><strong>Projected Score:</strong> {feedbackData.score} out of {feedbackData.maxScore}</p>
                                <p><strong>Score Explanation:</strong> {feedbackData.scoreExplanation}</p>
                            </div>

                            <div className="flex justify-between">
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

export default FreeResponseScreen;
