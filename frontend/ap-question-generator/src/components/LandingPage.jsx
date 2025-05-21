import React, { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { useAuth } from "../AuthContext";

export default function LandingPage({ onGetStarted, onViewHistory, onAbout }) {
    const words  = ["AP Exams", "SATs", "ACTs", "midterms", "finals", "quizzes"];
    const colors = [
        "text-indigo-400",
        "text-pink-400",
        "text-teal-400",
        "text-yellow-400",
        "text-green-400",
        "text-red-400",
    ];

    const { user, signIn, signOut, loading } = useAuth();
    const [idx,   setIdx]   = useState(0);
    const [fade,  setFade]  = useState(true);

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
        <section className="
      animated-gradient
      min-h-screen
      flex flex-col items-center justify-center
      px-4 sm:px-6 text-gray-100
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

            <div className="max-w-5xl text-center space-y-10">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                    Master&nbsp;
                    <span
                        className={[
                            "inline-block transition-opacity duration-700",
                            fade ? "opacity-100" : "opacity-0",
                            colors[idx],
                        ].join(" ")}
                        style={{ whiteSpace: "nowrap" }}
                    >
            {words[idx]}
          </span>
                    &nbsp;the&nbsp;
                    <span className="text-teal-400">Smart</span>&nbsp;Way
                </h1>

                <p className="text-lg md:text-xl text-gray-300">
                    Endless AI-generated practice questions, instant feedback, and progress
                    analytics&nbsp;&mdash; all in one streamlined tool built by a student,
                    for students. <b><i>Free forever.</i></b>
                </p>

                <div className="relative top-16 flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                    <button
                        onClick={onGetStarted}
                        className="px-6 py-3 bg-teal-500 hover:bg-green-500 rounded-2xl font-semibold transition"
                    >Get Started</button>

                    {onViewHistory && (
                        <button
                            onClick={onViewHistory}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-semibold transition"
                        >View Question History</button>
                    )}

                    <button
                        onClick={onAbout}
                        className="px-6 py-3 bg-pink-600/35 hover:bg-pink-500/70 rounded-2xl font-semibold transition"
                    >About this Project</button>
                </div>
            </div>

            <footer className="mt-24 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} helpstudy.me • Built by Liam Kernan
            </footer>
        </section>
    );
}