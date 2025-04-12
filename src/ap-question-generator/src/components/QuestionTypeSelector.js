import React from "react";

function QuestionTypeSelector({ onSelectType, onBack, activeSubject }) {
    const formatSubjectName = (subject) => {
        const words = subject.split("-");
        return words
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg relative">
            {/* Back Button positioned at top right */}
            <button
                onClick={onBack}
                className="absolute top-4 right-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition duration-200"
            >
                Back to Menu
            </button>

            <h2 className="text-2xl font-bold mb-2 text-left">
                {formatSubjectName(activeSubject)}
            </h2>
            <p className="text-left text-gray-600 mb-8">Select question type</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                <button
                    onClick={() => onSelectType("multiple-choice")}
                    className="flex flex-col justify-center items-center h-56 p-8
                               bg-blue-500 text-white rounded-lg shadow-md
                               hover:bg-blue-600 transform hover:-translate-y-1
                               transition-all duration-200"
                >
                    <span className="text-2xl font-semibold">Multiple Choice</span>
                    <p className="mt-3 text-base text-center">
                        Practice with AP-style multiple choice questions
                    </p>
                </button>

                <button
                    onClick={() => onSelectType("free-response")}
                    className="flex flex-col justify-center items-center h-56 p-8
                               bg-green-500 text-white rounded-lg shadow-md
                               hover:bg-green-600 transform hover:-translate-y-1
                               transition-all duration-200"
                >
                    <span className="text-2xl font-semibold">Free Response</span>
                    <p className="mt-3 text-base text-center">
                        Practice with AP-style free response questions and get AI feedback
                    </p>
                </button>
            </div>
        </div>
    );
}

export default QuestionTypeSelector;