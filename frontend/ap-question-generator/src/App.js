import React, { useState, useEffect } from "react";
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
    const [currentPage, setCurrentPage] = useState("landing");
    const [activeSubject, setActiveSubject] = useState(null);
    const [question,      setQuestion]      = useState("");
    const [selectedAnswer,setSelectedAnswer]= useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [showFeedback,  setShowFeedback]  = useState(false);
    const [answerSubmitted,setAnswerSubmitted] = useState(false);
    const [feedbackData,  setFeedbackData]  = useState(null);

    const navigate = (page, state = {}) => {
        console.log('Navigating to:', page, state);
        setCurrentPage(page);
        if (state.subject) setActiveSubject(state.subject);
        
        // Update URL hash
        if (window.location.hash !== `#${page}`) {
            window.history.pushState({ page, ...state }, "", `#${page}`);
        }
    };

    const goBack = () => {
        window.history.back();
    };

    useEffect(() => {
        const handlePopState = (event) => {
            console.log('PopState event:', event.state);
            if (event.state && event.state.page) {
                setCurrentPage(event.state.page);
                if (event.state.subject) setActiveSubject(event.state.subject);
            } else {
                // Handle hash change without state
                const hash = window.location.hash.slice(1);
                console.log('Hash from URL:', hash);
                setCurrentPage(hash || "landing");
            }
        };

        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            console.log('Hash changed to:', hash);
            if (hash && hash !== currentPage) {
                setCurrentPage(hash || "landing");
            }
        };

        window.addEventListener("popstate", handlePopState);
        window.addEventListener("hashchange", handleHashChange);
        
        // Handle initial page load
        const initialHash = window.location.hash.slice(1);
        console.log('Initial hash:', initialHash);
        if (initialHash && initialHash !== currentPage) {
            setCurrentPage(initialHash);
        }

        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [currentPage]);

    const parseMCQ = (raw) => {
        const clean = raw.replace(/<[^>]*>/g, "").trim();
        
        // Enhanced patterns to catch various formats
        const patterns = [
            /([A-D])\.?\s*\*\*\*/,          // A*** or A. ***
            /([A-D])\)\s*\*\*\*/,           // A) ***
            /([A-D])\s*\*\*\*/,             // A ***
            /\*\*\*\s*([A-D])[.)]?/,        // *** A or *** A)
        ];
        
        // Try each pattern
        for (const pattern of patterns) {
            const match = clean.match(pattern);
            if (match) {
                return {
                    processedText: clean.replace(/\*\*\*/g, ""),
                    correctAnswerLetter: match[1],
                };
            }
        }
        
        // Enhanced line-by-line search for *** markers
        const lines = clean.split(/\r?\n/);
        for (const line of lines) {
            if (line.includes("***")) {
                // Look for letter at start of line with *** anywhere in line
                const letterMatch = line.match(/^([A-D])[.)\s]/);
                if (letterMatch) {
                    return {
                        processedText: clean.replace(/\*\*\*/g, ""),
                        correctAnswerLetter: letterMatch[1],
                    };
                }
                
                // Look for *** followed by letter
                const reverseMatch = line.match(/\*\*\*[.\s]*([A-D])/);
                if (reverseMatch) {
                    return {
                        processedText: clean.replace(/\*\*\*/g, ""),
                        correctAnswerLetter: reverseMatch[1],
                    };
                }
            }
        }
        
        // Final fallback - look for any A-D followed by content with ***
        const optionLines = lines.filter(line => /^[A-D][.)\s]/.test(line));
        for (const line of optionLines) {
            if (line.includes("***")) {
                const letter = line.match(/^([A-D])/);
                if (letter) {
                    return {
                        processedText: clean.replace(/\*\*\*/g, ""),
                        correctAnswerLetter: letter[1],
                    };
                }
            }
        }
        
        console.error("Could not find correct answer marker in question:", clean.substring(0, 200));
        console.error("Full question text:", clean);
        
        // Try to find any option and randomize instead of defaulting to A
        const optionLetters = ['A', 'B', 'C', 'D'];
        const availableOptions = optionLetters.filter(letter => 
            clean.match(new RegExp(`^${letter}[.)]`, 'm'))
        );
        
        const fallbackAnswer = availableOptions.length > 0 ? 
            availableOptions[Math.floor(Math.random() * availableOptions.length)] : 'A';
            
        console.warn(`Using random fallback answer: ${fallbackAnswer}`);
        return { processedText: clean.replace(/\*\*\*/g, ""), correctAnswerLetter: fallbackAnswer };
    };

    const fetchQuestion = async (subject, questionType) => {
        setActiveSubject(subject);
        setLoading(true);
        setQuestion("");
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setShowFeedback(false);
        setAnswerSubmitted(false);
        setFeedbackData(null);

        if (questionType === "free-response") {
            navigate("free-response", { subject, questionType });
        } else {
            navigate("question", { subject, questionType });
        }

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
            setLoading(false);
        }
    };

    const fetchGuide = async (subject) => {
        setActiveSubject(subject);
        setLoading(true);
        setQuestion("");

        navigate("studymaterial", { subject });

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

    const renderPage = () => {
        switch (currentPage) {
            case "landing":
                return (
                    <LandingPage
                        onGetStarted={() => navigate("select")}
                        onViewHistory={() => navigate("history")}
                        onAbout={() => navigate("about")}
                    />
                );

            case "about":
                return <About onBack={goBack} />;

            case "select":
                return (
                    <ModeSelector
                        onAP={() => navigate("select-ap")}
                        onSAT={() => navigate("select-sat")}
                        onACT={() => navigate("select-act")}
                        onYOURS={() => navigate("anything")}
                        onBack={() => navigate("landing")}
                    />
                );

            case "select-ap":
                return (
                    <ApSelector
                        onSelectSubject={(subj) => {
                            setActiveSubject(subj);
                            navigate("type-select");
                        }}
                        onBack={() => navigate("select")}
                        onViewHistory={() => navigate("history")}
                    />
                );

            case "select-sat":
                return (
                    <SatSelector
                        onBack={() => navigate("select")}
                        onSelectSubject={(subj) => fetchQuestion(`SAT ${subj}`, "multiple-choice")}
                        onViewHistory={() => navigate("history")}
                    />
                );

            case "select-act":
                return (
                    <ActSelector
                        onBack={() => navigate("select")}
                        onSelectSubject={(subj) => fetchQuestion(`ACT ${subj}`, "multiple-choice")}
                        onViewHistory={() => navigate("history")}
                    />
                );

            case "anything":
                return (
                    <StudyAnything
                        onBack={() => navigate("select")}
                        onViewHistory={() => navigate("history")}
                        onSelectMultipleChoice={(subj) => fetchQuestion(subj, "multiple-choice")}
                        onSelectFreeResponse={(subj) => fetchQuestion(subj, "free-response")}
                        onSelectStudyMaterial={(subj) => fetchGuide(subj)}
                    />
                );

            case "type-select":
                return (
                    <>
                        <Header onBack={() => navigate("landing")} />
                        <main className="flex-grow container mx-auto p-4">
                            <QuestionTypeSelector
                                activeSubject={activeSubject}
                                onSelectType={(type) => fetchQuestion(activeSubject, type)}
                                onBack={() => navigate("select-ap")}
                            />
                        </main>
                        <Footer />
                    </>
                );

            case "question":
                return (
                    <>
                        <Header onBack={() => navigate("landing")} />
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
                                onBackToMenu={() => navigate("select")}
                            />
                        </main>
                        <Footer />
                    </>
                );

            case "free-response":
                return (
                    <>
                        <Header onBack={() => navigate("landing")} />
                        <main className="flex-grow container mx-auto p-4">
                            <FreeResponseScreen
                                question={question}
                                loading={loading}
                                activeSubject={activeSubject}
                                onSubmitResponse={handleSubmitFreeResponse}
                                onNewQuestion={() => fetchQuestion(activeSubject, "free-response")}
                                onBackToMenu={() => navigate("select-ap")}
                                feedbackData={feedbackData}
                            />
                        </main>
                        <Footer />
                    </>
                );

            case "studymaterial":
                return (
                    <>
                        <Header onBack={() => navigate("landing")} />
                        <main className="flex-grow container mx-auto p-4">
                            <StudyMaterial
                                question={question}
                                loading={loading}
                                activeSubject={activeSubject}
                                onBackToMenu={() => navigate("select")}
                            />
                        </main>
                        <Footer />
                    </>
                );

            case "history":
                return (
                    <>
                        <Header onBack={() => navigate("landing")} />
                        <main className="flex-grow container mx-auto p-4">
                            <QuestionHistory onBackToMenu={() => navigate("select")}/>
                        </main>
                        <Footer />
                    </>
                );

            default:
                return (
                    <LandingPage
                        onGetStarted={() => navigate("select")}
                        onViewHistory={() => navigate("history")}
                        onAbout={() => navigate("about")}
                    />
                );
        }
    };

    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-blue-950">
                {renderPage()}
            </div>
        </AuthProvider>
    );
}
