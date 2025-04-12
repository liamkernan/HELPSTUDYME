import React from "react";
import { BlockMath } from "react-katex";

function QuestionScreen({
                            question,
                            loading,
                            activeSubject,
                            selectedAnswer,
                            setSelectedAnswer,
                            correctAnswer,
                            showFeedback,
                            answerSubmitted,
                            onSubmitAnswer,
                            onNewQuestion,
                            onBackToMenu
                        }) {
    // Function to format subject name
    const formatSubjectName = (subject) => {
        const words = subject.split('-');
        return words.map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Parse options from the question text
    const parseOptions = () => {
        const options = [];
        const letters = ['A', 'B', 'C', 'D'];

        letters.forEach(letter => {
            const regex = new RegExp(`${letter}\\)(.+?)(?=[A-D]\\)|$)`, 's');
            const match = question.match(regex);
            if (match) {
                options.push({
                    letter,
                    text: match[1].trim()
                });
            }
        });

        return options;
    };

    const options = parseOptions();

    const renderWithMath = (text) => {
        if (!text) return null;

        const parts = text.split(/(\$\$.*?\$\$)/s);

        return parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const mathExpression = part.slice(2, -2);
                return <BlockMath key={index} math={mathExpression} />
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="question-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-2xl font-bold">
                    {activeSubject && formatSubjectName(activeSubject)} Question
                </h2>
                <button
                    onClick={onBackToMenu}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                >
                    Back to Menu
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastelBlue mb-4"></div>
                    <p className="text-white">Generating question...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="question-text mb-6">
                        {renderWithMath(question.split(/[A-D]\)/)[0])}
                    </div>

                    <div className="options-container">
                        {options.map((option) => (
                            <div
                                key={option.letter}
                                className={`option p-4 mb-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedAnswer === option.letter
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-50'
                                } ${
                                    showFeedback && option.letter === correctAnswer
                                        ? 'bg-green-100 border-green-500'
                                        : ''
                                } ${
                                    showFeedback && selectedAnswer === option.letter && selectedAnswer !== correctAnswer
                                        ? 'bg-red-100 border-red-500'
                                        : ''
                                }`}
                                onClick={() => !answerSubmitted && setSelectedAnswer(option.letter)}
                            >
                                <div className="flex">
                                    <span className="option-letter font-bold mr-2">{option.letter})</span>
                                    <span>{renderWithMath(option.text)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="actions mt-6 flex justify-between">
                        {!answerSubmitted ? (
                            <button
                                onClick={onSubmitAnswer}
                                disabled={!selectedAnswer}
                                className={`px-6 py-2 rounded-lg ${
                                    selectedAnswer
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <button
                                onClick={onNewQuestion}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                            >
                                Next Question
                            </button>
                        )}
                    </div>

                    {showFeedback && (
                        <div className={`mt-6 p-4 rounded-lg ${
                            selectedAnswer === correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            <h3 className="font-bold">
                                {selectedAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
                            </h3>
                            <p>The correct answer is {correctAnswer}.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuestionScreen;