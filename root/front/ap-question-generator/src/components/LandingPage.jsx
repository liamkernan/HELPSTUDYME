import React, { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

export default function LandingPage({ onGetStarted, onViewHistory, onAbout }) {
    const words  = ["AP Exams", "SATs", "ACTs", "midterms", "finals", "quizzes"];
    const colors = [
        "text-teal-400",
        "text-yellow-400",
        "text-pink-400",
        "text-green-400",
        "text-indigo-400",
        "text-red-400",
    ];

    const [idx, setIdx]   = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const iv = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIdx(i => (i + 1) % words.length);
                setFade(true);
            }, 700);
        }, 2000);
        return () => clearInterval(iv);
    }, []);

    return (
        <section className="animated-gradient relative h-screen flex flex-col items-center justify-center text-gray-100 px-6">
            <div className="text-center space-y-8 max-w-3xl">
                <h1 className="text-6xl font-extrabold tracking-tight leading-tight whitespace-nowrap">
                    Master&nbsp;
                    <span
                        className={[
                            "inline-block whitespace-nowrap transition-opacity duration-700",
                            fade ? "opacity-100" : "opacity-0",
                            colors[idx],
                        ].join(" ")}
                    >
            {words[idx]}
          </span>
                    &nbsp;the&nbsp;<span className="text-teal-400">Smart</span>&nbsp;Way
                </h1>

                <p className="text-lg md:text-xl text-gray-300">
                    Unlimited AI-generated practice questions, instant feedback, and progress
                    analytics&nbsp;&mdash; all in one streamlined tool built by a student,
                    for students. <b><i>Free forever.</i></b>
                </p>

                <div className="inline-block p-4 bg-blue-900/50 rounded-xl backdrop-blur">
                    <BlockMath math="\int_{\text{effort}=0}^{\text{you}} \!\! \text{Practice}\; d(\text{Time}) = \text{Success}" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                        onClick={onGetStarted}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 rounded-2xl font-semibold transition"
                    >
                        Get Started
                    </button>
                    {onViewHistory && (
                        <button
                            onClick={onViewHistory}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-semibold transition"
                        >
                            View History
                        </button>
                    )}
                    <button
                        onClick={onAbout}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-semibold transition"
                    >
                        About this Project
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-4 text-sm text-gray-400">
                © {new Date().getFullYear()} helpstudy.me • Built with&nbsp;
                <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-200"
                >
                    React
                </a>{" "}
                &amp;&nbsp;
                <a
                    href="https://katex.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-200"
                >
                    KaTeX
                </a>
            </footer>
        </section>
    );
}