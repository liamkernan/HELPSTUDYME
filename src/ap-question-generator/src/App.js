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

// Helper function to format free-response questions (placed after your imports)
const formatFreeResponseQuestion = (text) => {
    let formattedText = text;

    // Step 1: Replace markers that have asterisks on both sides (e.g., ***A.***)
    formattedText = formattedText.replace(/\s*\*+\s*([A-Z]\.)\s*\*+\s*/g, "\n\n$1 ");

    // Step 2: Replace markers where asterisks only appear on the left
    formattedText = formattedText.replace(/\s*\*+\s*([A-Z]\.)/g, "\n\n$1 ");

    // Step 3: Replace markers where asterisks only appear on the right
    formattedText = formattedText.replace(/([A-Z]\.)\s*\*+\s*/g, "\n\n$1 ");

    // Step 4: Remove any stray asterisks that remain, if any
    formattedText = formattedText.replace(/\*+/g, '');

    return formattedText.trim();
};

function App() {
    const [currentScreen, setCurrentScreen] = useState("home"); // Options: home, type-select, question, free-response
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeSubject, setActiveSubject] = useState(null);
    const [questionParts, setQuestionParts] = useState({ question: "", options: [] });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);

    // Single fetchQuestion function with formatting for free-response questions
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
            const url = `http://localhost:8080/api/question/${encodeURIComponent(subject)}?type=${questionType}`;
            console.log(`Fetching from: ${url}`);

            const response = await fetch(url);
            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.text();
            console.log(`Response data received, length: ${data.length}`);

            if (!data || data.trim() === '') {
                throw new Error("Empty response received from server");
            }

            if (questionType === "multiple-choice") {
                let correctAnswerLetter = null;
                let processedText = data;

                // Extract correct answer marker
                const directMarkerMatch = data.match(/([A-D])\)\s*\*\*\*/);
                if (directMarkerMatch) {
                    correctAnswerLetter = directMarkerMatch[1];
                    console.log(`Found direct marker match for answer: ${correctAnswerLetter}`);
                    processedText = data.replace(/\*\*\*/g, '');
                } else {
                    // Fallback patterns for finding the correct answer
                    const patterns = [
                        /([A-D])\).*?\*\*\*/,
                        /\*\*\*\s*([A-D]\))/,
                        /\*\*\*.*?([A-D]\))/,
                        /([A-D])\).*?correct.*?\*\*\*/i,
                        /\*\*\*.*?correct.*?([A-D]\))/i
                    ];

                    for (const pattern of patterns) {
                        const match = data.match(pattern);
                        if (match) {
                            correctAnswerLetter = match[1];
                            console.log(`Found answer using pattern: ${correctAnswerLetter}`);
                            processedText = data.replace(/\*\*\*/g, '');
                            break;
                        }
                    }

                    if (!correctAnswerLetter) {
                        const correctMatch = data.match(/([A-D])\).*?(correct answer|is correct)/i);
                        if (correctMatch) {
                            correctAnswerLetter = correctMatch[1];
                            console.log(`Found answer by "correct" keyword: ${correctAnswerLetter}`);
                        }
                    }
                }

                if (!correctAnswerLetter) {
                    console.log("Could not detect correct answer, defaulting to A");
                    correctAnswerLetter = "A";
                }

                setQuestion(processedText);
                setCorrectAnswer(correctAnswerLetter);
            } else {
                // For free-response questions, apply the formatting
                setQuestion(formatFreeResponseQuestion(data));
            }
        } catch (error) {
            console.error("Error fetching question:", error);
            setQuestion("Liam's API isn't connecting!!! Please try again... 😅");
        } finally {
            setLoading(false);
        }
    };

    // ... Other handlers remain unchanged ...

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

    const handleSubmitFreeResponse = async (responseText) => {
        try {
            const response = await fetch(`http://localhost:8080/api/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: activeSubject,
                    question: question,
                    response: responseText
                })
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
                scoreExplanation: "Could not evaluate due to an error."
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
                        onViewHistory={handleViewHistory}  // Pass the handler here
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
                {currentScreen === "history" && (
                    <QuestionHistory onBackToMenu={handleBackToMenu} />
                )}
            </main>
            <Footer />
        </div>
    );
}

export default App;