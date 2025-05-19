import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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

export default function QuestionScreen({
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
                                           onBackToMenu,
                                       }) {
    const formatSubjectName = (subject) =>
        subject
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

    const parseOptions = () => {
        const opts = [];
        ['A','B','C','D'].forEach(letter => {
            const re = new RegExp(`${letter}\\)([\\s\\S]+?)(?=(?:[A-D]\\)|$))`);
            const m = question.match(re);
            if (m) opts.push({ letter, text: m[1].trim() });
        });
        return opts;
    };
    const options = parseOptions();
    const promptText = question.split(/^[A-D]\)/m)[0].trim();

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
                    <ArrowPathIcon className="h-12 w-12 text-pastelBlue animate-spin mb-4" />
                    <p className="text-white">Generating question...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="question-text mb-6">
                        <MathRenderer text={promptText} />
                    </div>

                    <div className="options-container">
                        {options.map(opt => (
                            <div
                                key={opt.letter}
                                onClick={() => !answerSubmitted && setSelectedAnswer(opt.letter)}
                                className={`
                  option p-4 mb-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedAnswer === opt.letter ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}
                  ${showFeedback && opt.letter === correctAnswer ? 'bg-green-100 border-green-500' : ''}
                  ${showFeedback && selectedAnswer === opt.letter && selectedAnswer !== correctAnswer ? 'bg-red-100 border-red-500' : ''}
                `}
                            >
                                <div className="flex">
                                    <span className="option-letter font-bold mr-2">{opt.letter})</span>
                                    <MathRenderer text={opt.text} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="actions mt-6 flex justify-between">
                        {!answerSubmitted ? (
                            <button
                                onClick={onSubmitAnswer}
                                disabled={!selectedAnswer}
                                className={`
                  px-6 py-2 rounded-lg
                  ${selectedAnswer
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                `}
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
                            selectedAnswer === correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
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