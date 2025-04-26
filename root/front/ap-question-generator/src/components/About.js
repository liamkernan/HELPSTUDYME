import React from "react";

export default function About({ onBack }) {
    return (
        <div className="min-h-screen flex flex-col bg-blue-950 text-gray-100">
            <div className="container mx-auto p-6">
                <button
                    onClick={onBack}
                    className="underline text-teal-400 hover:text-teal-200 mb-4"
                >
                    ← Back Home
                </button>
                <h2 className="text-4xl font-extrabold mb-4">About the Project</h2>
                <p className="mb-2">
                    <strong>helpstudy.me</strong> is an AI-powered study companion built
                    to generate unlimited practice questions, deliver instant feedback,
                    and track your progress—completely free.
                </p>
                <p className="mb-2">
                    Under the hood, it’s a React front-end with KaTeX for beautiful
                    math rendering, talking to a back-end that proxies to OpenAI’s
                    API to not only craft questions across AP, SAT, ACT, and any other “quiz”
                    you want to master, but also provide feedback on Free Response writing, and offer studying priorites based on multiple choice responses and accuracy.
                </p>
                <p className={"mb-20"}>
                    Created by Liam Kernan as a portfolio piece and a way to help fellow
                    students study smarter, not harder.
                </p>
                <p><i>this page is still under development :)</i></p>
            </div>
        </div>
    );
}