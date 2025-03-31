// src/components/QuestionTypeSelector.js
import React from "react";

function QuestionTypeSelector({ onSelectType, activeSubject }) {
    // Function to format subject name
    const formatSubjectName = (subject) => {
        const words = subject.split('-');
        return words.map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-center">
                {formatSubjectName(activeSubject)}
            </h2>
            <p className="text-center text-gray-600 mb-8">Select question type</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => onSelectType("multiple-choice")}
                    className="p-8 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transform hover:-translate-y-1 transition-all duration-200"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-semibold">Multiple Choice</span>
                        <p className="mt-2 text-sm text-center">
                            Practice with AP-style multiple choice questions
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => onSelectType("free-response")}
                    className="p-8 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transform hover:-translate-y-1 transition-all duration-200"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-semibold">Free Response</span>
                        <p className="mt-2 text-sm text-center">
                            Practice with AP-style free response questions and get AI feedback
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default QuestionTypeSelector;