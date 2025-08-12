import React, { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { useAuth } from "../AuthContext";

export default function LandingPage({ onGetStarted, onViewHistory, onAbout }) {
    const words  = ["AP exams", "SAT tests", "midterms", "ACT tests", "finals", "quizzes"];
    const colors = [
        "text-indigo-300",
        "text-pink-400",
        "text-orange-400",
        "text-green-400",
        "text-yellow-400",
        "text-red-400",
    ];

    const { user, signIn, signOut, loading } = useAuth();
    const [idx, setIdx] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let timeout;
        const currentWord = words[idx];
        
        if (isTyping) {
            // Typing effect
            if (displayText.length < currentWord.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentWord.slice(0, displayText.length + 1));
                }, 100);
            } else {
                // Wait before erasing
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 1500);
            }
        } else {
            // Erasing effect
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, 50);
            } else {
                // Move to next word
                setIdx((i) => (i + 1) % words.length);
                setIsTyping(true);
            }
        }
        
        return () => clearTimeout(timeout);
    }, [displayText, isTyping, idx, words]);

    return (
        <section className="
      animated-gradient
      min-h-screen
      flex flex-col justify-center
      pl-8 sm:pl-16 lg:pl-24 pr-4 sm:pr-6 text-gray-100
    ">

            <div className="absolute top-4 right-4 z-50">
                {!loading && (
                    user ? (
                        <div className="flex items-center gap-3">
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                            <button
                                onClick={signOut}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-sm"
                            >Sign out</button>
                        </div>
                    ) : (
                        <button
                            onClick={signIn}
                            className="px-4 py-1 bg-teal-500 hover:bg-teal-600 rounded-xl text-sm font-semibold"
                        >Sign in</button>
                    )
                )}
            </div>

            <div className="max-w-4xl text-left space-y-10">
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-normal leading-tight whitespace-nowrap" style={{ fontFamily: '"Crimson Pro", "Crimson Text", serif' }}>
                    <span className="inline-block">Master&nbsp;</span>
                    <span 
                        className={[
                            "inline-block text-center relative",
                            colors[idx],
                        ].join(" ")}
                        style={{ width: "330px", fontFamily: '"Indie Flower", "Bradley Hand", cursive', textAlign: "center" }}
                    >
                        {displayText}
                        <span className="animate-pulse">|</span>
                    </span>
                    <span className="inline-block">&nbsp;the&nbsp;<span className="text-teal-400">Smart</span>&nbsp;Way</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300" style={{ fontFamily: '"Crimson Pro", "Crimson Text", serif' }}>
                    Endless AI-generated practice questions, instant feedback, and progress
                    analytics&nbsp;— all in one streamlined tool built by a student,
                    for students. <b><i>Free forever.</i></b>
                </p>

                <div className="relative top-40 flex flex-col sm:flex-row flex-wrap gap-4 justify-start">
                    <button
                        onClick={onGetStarted}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-2xl font-semibold transition"
                    >Get Started</button>

                    {onViewHistory && (
                        <button
                            onClick={onViewHistory}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-semibold transition"
                        >View Question History</button>
                    )}

                    <button
                        onClick={onAbout}
                        className="px-6 py-3 bg-white/20 hover:bg-pink-400/50 rounded-2xl font-semibold transition"
                    >About this Project</button>
                </div>
            </div>

            <footer className="mt-24 relative top-32 text-left text-sm text-gray-400">
                © {new Date().getFullYear()} helpstudy.me • Built by Liam Kernan
            </footer>
        </section>
    );
}