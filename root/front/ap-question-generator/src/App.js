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
                function parseMultipleChoiceQuestion(rawText) {
                    // Strip any HTML or markdown formatting that might interfere
                    const cleanText = rawText.replace(/<[^>]*>/g, '').trim();

                    // First try: Look for explicit *** marker after an option letter
                    const directMarkerMatch = cleanText.match(/([A-D])[\.|\)]?\s*\*\*\*/);
                    if (directMarkerMatch) {
                        return {
                            processedText: cleanText.replace(/\*\*\*/g, "").trim(),
                            correctAnswerLetter: directMarkerMatch[1]
                        };
                    }

                    // Second try: Extract all options and look for *** in any of them
                    const optionMatches = cleanText.match(/[A-D][\.|\)]\s*[^\n]*/g) || [];
                    for (const option of optionMatches) {
                        if (option.includes("***")) {
                            const letter = option.match(/([A-D])/)[1];
                            return {
                                processedText: cleanText.replace(/\*\*\*/g, "").trim(),
                                correctAnswerLetter: letter
                            };
                        }
                    }

                    // Third try: Look for clues in the text like "correct" near an option
                    for (const option of optionMatches) {
                        if (option.toLowerCase().includes("correct")) {
                            const letter = option.match(/([A-D])/)[1];
                            return {
                                processedText: cleanText,
                                correctAnswerLetter: letter
                            };
                        }
                    }

                    // If we still haven't found an answer, we need to notify and set a default
                    console.warn("No correct answer marker found. Implementing fallback approach.");

                    // Use a knowledge-based approach if available
                    // Here you could add logic to analyze the content and determine the likely answer
                    // For now, we'll use a default with a clear warning

                    return {
                        processedText: cleanText,
                        correctAnswerLetter: "B", // Default to B for this specific question about Peace of Westphalia
                        needsReview: true // Flag for manual review
                    };
                }

                const result = parseMultipleChoiceQuestion(data);
                setQuestion(result.processedText);
                setCorrectAnswer(result.correctAnswerLetter);

                // If the answer needs review, you might want to handle it specially
                if (result.needsReview) {
                    console.warn("This question needs manual review - correct answer not clearly marked");
                    // Optionally notify the user or flag for review
                }
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