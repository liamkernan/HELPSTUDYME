import React, { useState } from "react";
import "./App.css";
import "katex/dist/katex.min.css";

import Header               from "./components/Header";
import Footer               from "./components/Footer";
import LandingPage          from "./components/LandingPage";
import About                from "./components/About";
import ApSelector             from "./components/catagories/ApSelector";
import QuestionTypeSelector from "./components/catagories/QuestionTypeSelector";
import QuestionScreen       from "./components/QuestionScreen";
import FreeResponseScreen   from "./components/FreeResponseScreen";
import QuestionHistory      from "./components/QuestionHistory";

import { AuthProvider } from "./AuthContext";
import { logQuestion }  from "./history";

import ModeSelector from "./components/catagories/ModeSelector";
import SatSelector from "./components/catagories/SatSelector";
import ActSelector from "./components/catagories/ActSelector";
import StudyAnything from "./components/catagories/StudyAnything";

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

    // Navigation handlers
    const goLanding       = () => setCurrentScreen("landing");
    const goAbout         = () => setCurrentScreen("about");
    const goSubjectSelect = () => setCurrentScreen("subject-select");
    const goTypeSelect    = () => setCurrentScreen("type-select");
    const goHistory       = () => setCurrentScreen("history");
    const goSelect        = () => setCurrentScreen("select");
    const goYOURS         = () => setCurrentScreen("yours");
    const goSAT           = () => setCurrentScreen("sat");
    const goACT           = () => setCurrentScreen("act");
    const goQuestion           = () => setCurrentScreen("question");

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

    //test

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

    const handleSubmitAnswer = () => {
        setShowFeedback(true);
        setAnswerSubmitted(true);

        logQuestion({
            type:    "MCQ",
            subject: activeSubject,
            prompt:  question,
            chosen:  selectedAnswer,
            correct: correctAnswer,
            match: selectedAnswer === correctAnswer
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

    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-blue-950">
                {currentScreen === "landing" && (
                    <LandingPage
                        onGetStarted={goSelect}
                        onViewHistory={goHistory}
                        onAbout={goAbout}
                    />
                )}

                {currentScreen === "select" && (
                    <ModeSelector
                        onAP={goSubjectSelect}
                        onSAT={goSAT}
                        onACT={goACT}
                        onYOURS={goYOURS}
                        onBack={goLanding}
                    />
                )}

                {currentScreen === "about" && <About onBack={goLanding} />}
                {currentScreen === "sat"   && (
                    <SatSelector onBack={goSelect}
                                 onSelectSubject={(subj) =>
                                     fetchQuestion("SAT " + subj, "multiple-choice")  // ← fetch _and_ navigate
                                 }
                                 onViewHistory={goHistory}
                    />

                )}
                {currentScreen === "act"   && (
                    <ActSelector onBack={goSelect}
                                 onSelectSubject={(subj) =>
                                     fetchQuestion("ACT " + subj, "multiple-choice")  // ← fetch _and_ navigate
                                 }
                                 onViewHistory={goHistory}
                    />

                )}
                {currentScreen === "yours" && (
                    <StudyAnything onBack={goSelect}
                                   onViewHistory={goHistory}
                    />

                )}
                {currentScreen === "subject-select" && (
                    <ApSelector
                        onSelectSubject={(subj) => { setActiveSubject(subj); goTypeSelect(); }}
                        onBack={goSelect}
                        onViewHistory={goHistory}
                    />
                )}

                {(currentScreen === "type-select" || currentScreen === "question" || currentScreen === "free-response" || currentScreen === "history") && (
                    <>
                        <Header onBack={goLanding} />
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
                                    onBackToMenu={goSelect}
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
                                <QuestionHistory onBackToMenu={goSelect} />
                            )}
                        </main>
                        <Footer />
                    </>
                )}
            </div>
        </AuthProvider>
    );
}
