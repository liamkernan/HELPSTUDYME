// src/App.js
import React, { useState } from "react";
import "./App.css";
import "katex/dist/katex.min.css";

import Header               from "./components/Header";
import Footer               from "./components/Footer";
import LandingPage          from "./components/LandingPage";
import About                from "./components/About";
import MainMenu             from "./components/MainMenu";
import QuestionTypeSelector from "./components/QuestionTypeSelector";
import QuestionScreen       from "./components/QuestionScreen";
import FreeResponseScreen   from "./components/FreeResponseScreen";
import QuestionHistory      from "./components/QuestionHistory";

import { AuthProvider } from "./AuthContext";
import { logQuestion }  from "./history";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function App() {
    const [currentScreen, setCurrentScreen] = useState("landing");
    const [activeSubject,  setActiveSubject]  = useState(null);
    const [question,       setQuestion]       = useState("");
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer,  setCorrectAnswer]  = useState(null);
    const [loading,        setLoading]        = useState(false);
    const [showFeedback,   setShowFeedback]   = useState(false);
    const [answerSubmitted,setAnswerSubmitted]= useState(false);
    const [feedbackData,   setFeedbackData]   = useState(null);

    /* ───────────────────────────── fetch question ──────────────────────────── */
    const fetchQuestion = async (subject, questionType) => {
        setLoading(true);
        setActiveSubject(subject);
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setShowFeedback(false);
        setAnswerSubmitted(false);
        setFeedbackData(null);
        setCurrentScreen(questionType === "multiple-choice" ? "question" : "free-response");

        try {
            const url = `${API_BASE}/question/${encodeURIComponent(subject)}?type=${questionType}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.text();
            if (!raw.trim()) throw new Error("Empty response");

            if (questionType === "multiple-choice") {
                const { processedText, correctAnswerLetter } = parseMCQ(raw);
                setQuestion(processedText);
                setCorrectAnswer(correctAnswerLetter);
            } else {
                setQuestion(raw);
            }
        } catch (err) {
            console.error("fetchQuestion:", err);
        } finally {
            setLoading(false);
        }
    };

    const parseMCQ = (raw) => {
        const clean = raw.replace(/<[^>]*>/g, "").trim();
        const direct = clean.match(/([A-D])[.)]?\s*\*\*\*/);
        if (direct) {
            return {
                processedText: clean.replace(/\*\*\*/g, ""),
                correctAnswerLetter: direct[1],
            };
        }
        const options = clean.match(/[A-D][.)]\s*[^\n]*/g) || [];
        for (const opt of options) {
            if (opt.includes("***")) {
                return {
                    processedText: clean.replace(/\*\*\*/g, ""),
                    correctAnswerLetter: opt.match(/([A-D])/)[1],
                };
            }
        }
        return { processedText: clean, correctAnswerLetter: "B" };
    };

    /* ───────────────────────── submit answers & log ────────────────────────── */
    const handleSubmitAnswer = () => {
        setShowFeedback(true);
        setAnswerSubmitted(true);

        // 🔹 save MCQ attempt to Firestore
        logQuestion({
            type:    "MCQ",
            subject: activeSubject,
            prompt:  question,
            chosen:  selectedAnswer,
            correct: correctAnswer,
        });
    };

    const handleSubmitFreeResponse = async (responseText) => {
        try {
            const res = await fetch(`${API_BASE}/evaluate`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ subject: activeSubject, question, response: responseText }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const evalData = await res.json();
            setFeedbackData(evalData);

            // 🔹 save FRQ attempt to Firestore
            logQuestion({
                type:     "FRQ",
                subject:  activeSubject,
                prompt:   question,
                response: responseText,
                feedback: evalData.feedback,
                score:    evalData.score,
            });
        } catch (err) {
            console.error("handleSubmitFreeResponse:", err);
            setFeedbackData({
                feedback: "An error occurred while evaluating your response. Please try again.",
                score: "N/A",
                maxScore: "9",
                scoreExplanation: "Could not evaluate due to an error.",
            });
        }
    };

    /* ──────────────────────────── navigation helpers ───────────────────────── */
    const goLanding       = () => setCurrentScreen("landing");
    const goAbout         = () => setCurrentScreen("about");
    const goSubjectSelect = () => setCurrentScreen("subject-select");
    const goTypeSelect    = () => setCurrentScreen("type-select");
    const goHistory       = () => setCurrentScreen("history");

    /* ───────────────────────────────── render ──────────────────────────────── */
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-blue-950">
                {currentScreen === "landing" ? (
                    <LandingPage
                        onGetStarted={goSubjectSelect}
                        onViewHistory={goHistory}
                        onAbout={goAbout}
                    />
                ) : currentScreen === "about" ? (
                    <About onBack={goLanding} />
                ) : currentScreen === "subject-select" ? (
                    <MainMenu
                        onSelectSubject={(subj) => { setActiveSubject(subj); goTypeSelect(); }}
                        onBack={goLanding}
                        onViewHistory={goHistory}
                    />
                ) : (
                    <>
                        <Header />
                        <main className="flex-grow container mx-auto p-4">
                            {currentScreen === "type-select" && (
                                <QuestionTypeSelector
                                    activeSubject={activeSubject}
                                    onSelectType={(type) => fetchQuestion(activeSubject, type)}
                                    onBack={goSubjectSelect}
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
                                    onBackToMenu={goSubjectSelect}
                                />
                            )}
                            {currentScreen === "free-response" && (
                                <FreeResponseScreen
                                    question={question}
                                    loading={loading}
                                    activeSubject={activeSubject}
                                    onSubmitResponse={handleSubmitFreeResponse}
                                    onNewQuestion={() => fetchQuestion(activeSubject, "free-response")}
                                    onBackToMenu={goSubjectSelect}
                                    feedbackData={feedbackData}
                                />
                            )}
                            {currentScreen === "history" && (
                                <QuestionHistory onBackToMenu={goSubjectSelect} />
                            )}
                        </main>
                        <Footer />
                    </>
                )}
            </div>
        </AuthProvider>
    );
}