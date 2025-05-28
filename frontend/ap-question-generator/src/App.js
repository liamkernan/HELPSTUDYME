import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import "katex/dist/katex.min.css";

import Header           from "./components/Header";
import Footer           from "./components/Footer";

import LandingPage      from "./components/LandingPage";
import About            from "./components/About";
import ApSelector       from "./components/catagories/ApSelector";
import QuestionTypeSelector from "./components/catagories/QuestionTypeSelector";
import QuestionScreen       from "./components/QuestionScreen";
import FreeResponseScreen   from "./components/FreeResponseScreen";
import QuestionHistory      from "./components/QuestionHistory";
import ModeSelector         from "./components/catagories/ModeSelector";
import SatSelector          from "./components/catagories/SatSelector";
import ActSelector          from "./components/catagories/ActSelector";
import StudyAnything        from "./components/catagories/StudyAnything";
import StudyMaterial        from "./components/StudyMaterial";

import { AuthProvider } from "./AuthContext";
import { logQuestion }  from "./history";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function App() {
    const navigate = useNavigate();

    const [activeSubject, setActiveSubject] = useState(null);
    const [question,      setQuestion]      = useState("");
    const [selectedAnswer,setSelectedAnswer]= useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [showFeedback,  setShowFeedback]  = useState(false);
    const [answerSubmitted,setAnswerSubmitted] = useState(false);
    const [feedbackData,  setFeedbackData]  = useState(null);

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
        return { processedText: clean, correctAnswerLetter: "B" }; // fallback
    };

    // --- fetchQuestion ------------------------------------------
    const fetchQuestion = async (subject, questionType) => {
        /* 1. Reset state and show loader */
        setActiveSubject(subject);
        setLoading(true);
        setQuestion("");
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setShowFeedback(false);
        setAnswerSubmitted(false);
        setFeedbackData(null);

        /* 2. Navigate immediately so the screen (with its spinner) appears */
        navigate(questionType === "multiple-choice" ? "/question" : "/free-response");

        /* 3. Fetch data in the background */
        try {
            const url = `${API_BASE}/question/${encodeURIComponent(subject)}?type=${questionType}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.text();

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
            setLoading(false);     // spinner disappears once data is ready
        }
    };

    const fetchGuide = async (subject) => {
        /* 1. Reset state and show loader */
        setActiveSubject(subject);
        setLoading(true);
        setQuestion("");

        /* 2. Navigate immediately */
        navigate("/studymaterial");

        /* 3. Fetch data in the background */
        try {
            const url = `${API_BASE}/guide?subject=${encodeURIComponent(subject)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.text();
            setQuestion(raw);
        } catch (err) {
            console.error("fetchGuide:", err);
        } finally {
            setLoading(false);
        }
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
            match:   selectedAnswer === correctAnswer,
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
                <Routes>
                    <Route
                        path="/"
                        element={
                            <LandingPage
                                onGetStarted={() => navigate("/select")}
                                onViewHistory={() => navigate("/history")}
                                onAbout={() => navigate("/about")}
                            />
                        }
                    />

                    <Route path="/about" element={<About onBack={() => navigate(-1)} />} />

                    <Route
                        path="/select"
                        element={
                            <ModeSelector
                                onAP={() => navigate("/select/ap")}
                                onSAT={() => navigate("/select/sat")}
                                onACT={() => navigate("/select/act")}
                                onYOURS={() => navigate("/studyanything")}
                                onBack={() => navigate("/")}
                            />
                        }
                    />

                    {/* ───────────────── AP subject pick ───────── */}
                    <Route
                        path="/select/ap"
                        element={
                            <ApSelector
                                onSelectSubject={(subj) => {
                                    setActiveSubject(subj);
                                    navigate("/type-select");
                                }}
                                onBack={() => navigate("/select")}
                                onViewHistory={() => navigate("/history")}
                            />
                        }
                    />

                    <Route
                        path="/select/sat"
                        element={
                            <SatSelector
                                onBack={() => navigate("/select")}
                                onSelectSubject={(subj) => fetchQuestion(`SAT ${subj}`, "multiple-choice")}
                                onViewHistory={() => navigate("/history")}
                            />
                        }
                    />
                    <Route
                        path="/select/act"
                        element={
                            <ActSelector
                                onBack={() => navigate("/select")}
                                onSelectSubject={(subj) => fetchQuestion(`ACT ${subj}`, "multiple-choice")}
                                onViewHistory={() => navigate("/history")}
                            />
                        }
                    />

                    <Route
                        path="/studyanything"
                        element={
                            <StudyAnything
                                onBack={() => navigate("/select")}
                                onViewHistory={() => navigate("/history")}
                                onSelectMultipleChoice={(subj) => fetchQuestion(subj, "multiple-choice")}
                                onSelectFreeResponse={(subj) => fetchQuestion(subj, "free-response")}
                                onSelectStudyMaterial={(subj) => fetchGuide(subj)}
                            />
                        }
                    />

                    <Route
                        path="/type-select"
                        element={
                            <>
                                <Header onBack={() => navigate("/")} />
                                <main className="flex-grow container mx-auto p-4">
                                    <QuestionTypeSelector
                                        activeSubject={activeSubject}
                                        onSelectType={(type) => fetchQuestion(activeSubject, type)}
                                        onBack={() => navigate("/select/ap")}
                                    />
                                </main>
                                <Footer />
                            </>
                        }
                    />

                    <Route
                        path="/question"
                        element={
                            <>
                                <Header onBack={() => navigate("/")} />
                                <main className="flex-grow container mx-auto p-4">
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
                                        onBackToMenu={() => navigate("/select")}
                                    />
                                </main>
                                <Footer />
                            </>
                        }
                    />

                    <Route
                        path="/free-response"
                        element={
                            <>
                                <Header onBack={() => navigate("/")} />
                                <main className="flex-grow container mx-auto p-4">
                                    <FreeResponseScreen
                                        question={question}
                                        loading={loading}
                                        activeSubject={activeSubject}
                                        onSubmitResponse={handleSubmitFreeResponse}
                                        onNewQuestion={() => fetchQuestion(activeSubject, "free-response")}
                                        onBackToMenu={() => navigate("/select/ap")}
                                        feedbackData={feedbackData}
                                    />
                                </main>
                                <Footer />
                            </>
                        }
                    />

                    <Route
                        path="/studymaterial"
                        element={
                            <>
                                <Header onBack={() => navigate("/")} />
                                <main className="flex-grow container mx-auto p-4">
                                    <StudyMaterial
                                        question={question}
                                        loading={loading}
                                        activeSubject={activeSubject}
                                        onBackToMenu={() => navigate("/select")}
                                    />
                                </main>
                                <Footer />
                            </>
                        }
                    />

                    <Route
                        path="/history"
                        element={
                            <>
                                <Header onBack={() => navigate("/")} />
                                <main className="flex-grow container mx-auto p-4">
                                    <QuestionHistory onBackToMenu={() => navigate("/select")}/>
                                </main>
                                <Footer />
                            </>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}
