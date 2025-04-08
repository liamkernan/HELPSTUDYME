// src/components/QuestionScreen.js
import React, { useEffect, useState } from "react";

function QuestionHistory() {
    // State to store the retrieved data
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        // Replace with your actual backend endpoint URL
        fetch("http://localhost:8080/api/question-history")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                // Assuming data is an array of objects like: { prompt: "...", correct: true/false }
                setQuestions(data);
            })
            .catch((error) => {
                console.error("Error fetching question history:", error);
            });
    }, []); // Runs once on component mount

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Question History</h1>
            {questions.length === 0 ? (
                <p>No questions found.</p>
            ) : (
                <ul className="space-y-2">
                    {questions.map((q, index) => (
                        <li key={index} className="p-4 border rounded-lg">
                            <p className="font-semibold">Prompt:</p>
                            <p>{q.prompt}</p>
                            <p className="mt-2">
                                Result: {q.correct ? "Correct" : "Incorrect"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QuestionScreen;