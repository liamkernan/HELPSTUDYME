import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import "./App.css";

import Header from "./components/Header";
import MainMenu from "./components/MainMenu";
import QuestionScreen from "./components/QuestionScreen";
import FreeResponseScreen from "./components/FreeResponseScreen";
import QuestionTypeSelector from "./components/QuestionTypeSelector";
import Footer from "./components/Footer";
import QuestionHistory from "./components/QuestionHistory";

const API_BASE = process.env.REACT_APP_API_BASE;
const formatFreeResponseQuestion = (text) => {
    let formattedText = text;

    // Step 1: Replace markers that have asterisks on both sides (e.g., ***A.***)
    formattedText = formattedText.replace(/\s*\*+\s*([A-Z]\.)\s*\*+\s*/g, "\n\n$1 ");

    // Step 2: Replace markers where asterisks only appear on the left
    formattedText = formattedText.replace(/\s*\*+\s*([A-Z]\.)/g, "\n\n$1 ");

    // Step 3: Replace markers where asterisks only appear on the right
    formattedText = formattedText.replace(/([A-Z]\.)\s*\*+\s*/g, "\n\n$1 ");

    // Step 4: Remove any stray asterisks that remain, if any
    formattedText = formattedText.replace(/\*+/g, "");

    return formattedText.trim();
};

function App() {
    const [currentScreen, setCurrentScreen] = useState("home"); // Options: home, type-select, question, free-response, history
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeSubject, setActiveSubject] = useState(null);
    const [questionParts, setQuestionParts] = useState({ question: "", options: [] });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);

    const fetchQuestion = async (subject, questionType) => {
        console.log(`Starting fetch: ${subject}, type: ${questionType}`);
        setLoading(true);
        setActiveSubject(subject);
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setShowFeedback(false);
        setAnswerSubmitted(false);
        setFeedbackData(null);

        if (questionType === "multiple-choice") {
            setCurrentScreen("question");
        } else {
            setCurrentScreen("free-response");
        }

        try {
            const url = `${API_BASE}/question/${encodeURIComponent(subject)}?type=${questionType}`;            console.log(`Fetching from: ${url}`);

            const response = await fetch(url);
            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.text();
            console.log(`Response data received, length: ${data.length}`);

            if (!data || data.trim() === "") {
                throw new Error("Empty response received from server");
            }

            if (questionType === "multiple-choice") {
                // Helper function to parse the question text and detect the correct answer
                function parseMultipleChoiceQuestion(rawText) {
                    let correctAnswerLetter = null;
                    const patterns = [
                        // Direct marker: letter followed by a parenthesis, optional space, then the marker ***
                        /([A-D])\)\s*\*\*\*/,
                        // Other formatting variants
                        /([A-D])\).*?\*\*\*/,
                        /\*\*\*\s*([A-D]\))/,
                        /\*\*\*.*?([A-D]\))/,
                        // Look for the word "correct" near the option indicator
                        /([A-D])\).*?correct.*?\*\*\*/i,
                        /\*\*\*.*?correct.*?([A-D]\))/i
                    ];

                    // Try each pattern in order
                    for (const pattern of patterns) {
                        const match = rawText.match(pattern);
                        if (match) {
                            correctAnswerLetter = match[1];
                            console.log(`Detected correct answer: ${correctAnswerLetter} using pattern: ${pattern}`);
                            break;
                        }
                    }

                    // If nothing matched, try a fallback search using the "correct" keyword
                    if (!correctAnswerLetter) {
                        const fallbackMatch = rawText.match(/([A-D])\).*?(correct answer|is correct)/i);
                        if (fallbackMatch) {
                            correctAnswerLetter = fallbackMatch[1];
                            console.log(`Fallback detected correct answer: ${correctAnswerLetter}`);
                        }
                    }

                    // Default to "A" if still not detected
                    if (!correctAnswerLetter) {
                        console.warn("Correct answer not detected, defaulting to A");
                        correctAnswerLetter = "A";
                    }

                    // Remove any *** markers from the text
                    const processedText = rawText.replace(/\*\*\*/g, "");
                    return { processedText, correctAnswerLetter };
                }

                const { processedText, correctAnswerLetter } = parseMultipleChoiceQuestion(data);
                setQuestion(processedText);
                setCorrectAnswer(correctAnswerLetter);
            } else {
                setQuestion(data);
            }
        } catch (error) {
            console.error("Error fetching question:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = () => {
        setCurrentScreen("history");
    };

    const handleSubjectSelect = (subject) => {
        setActiveSubject(subject);
        setCurrentScreen("type-select");
    };

    const handleTypeSelect = (type) => {
        fetchQuestion(activeSubject, type);
    };

    const handleSubmitAnswer = () => {
        setShowFeedback(true);
        setAnswerSubmitted(true);
    };

    const submitEvaluation = async (prompt, correct) => {
        try {
            const response = await fetch(`${API_BASE}/evaluate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt, correct }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const evaluation = await response.json();
            console.log("Evaluation submitted:", evaluation);
        } catch (error) {
            console.error("Error submitting evaluation:", error);
        }
    };

    //example
    const userPrompt = "Explain the causes of the French Revolution.";
    const userGotItCorrect = true;
    submitEvaluation(userPrompt, userGotItCorrect);

    const handleSubmitFreeResponse = async (responseText) => {
        try {
            const response = await fetch(`${API_BASE}/evaluate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subject: activeSubject,
                    question: question,
                    response: responseText,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const feedbackResponse = await response.json();
            setFeedbackData(feedbackResponse);
        } catch (error) {
            console.error("Error submitting response:", error);
            setFeedbackData({
                feedback: "An error occurred while evaluating your response. Please try again.",
                score: "N/A",
                maxScore: "9",
                scoreExplanation: "Could not evaluate due to an error.",
            });
        }
    };

    const handleBackToMenu = () => {
        setCurrentScreen("home");
        setQuestion("");
        setActiveSubject(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-blue-950">
            <Header />
            <main className="flex-grow container mx-auto p-4">
                {currentScreen === "home" && (
                    <MainMenu
                        onSelectSubject={handleSubjectSelect}
                        onViewHistory={handleViewHistory}
                    />
                )}
                {currentScreen === "type-select" && (
                    <QuestionTypeSelector
                        onSelectType={handleTypeSelect}
                        activeSubject={activeSubject}
                        onBack={handleBackToMenu}
                    />
                )}
                {currentScreen === "question" && (
                    <QuestionScreen
                        question={question}
                        loading={loading}
                        activeSubject={activeSubject}
                        selectedAnswer={selectedAnswer}
                        setSelectedAnswer={setSelectedAnswer}
                        correctAnswer={correctAnswer}
                        showFeedback={showFeedback}
                        answerSubmitted={answerSubmitted}
                        onSubmitAnswer={handleSubmitAnswer}
                        onNewQuestion={() => fetchQuestion(activeSubject, "multiple-choice")}
                        onBackToMenu={handleBackToMenu}
                    />
                )}
                {currentScreen === "free-response" && (
                    <FreeResponseScreen
                        question={question}
                        loading={loading}
                        activeSubject={activeSubject}
                        onSubmitResponse={handleSubmitFreeResponse}
                        onNewQuestion={() => fetchQuestion(activeSubject, "free-response")}
                        onBackToMenu={handleBackToMenu}
                        feedbackData={feedbackData}
                    />
                )}
                {currentScreen === "history" && <QuestionHistory onBackToMenu={handleBackToMenu} />}
            </main>
            <Footer />
        </div>
    );
}

export default App;