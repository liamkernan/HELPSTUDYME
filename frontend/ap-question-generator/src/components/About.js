import React from "react";
import {ArrowLeft} from "lucide-react";

export default function About({ onBack }) {
    return (
        <div className="pt-44 min-h-screen flex flex-col bg-blue-950 text-gray-100">
            <div className="container mx-auto p-6">
                <div className="absolute top-4 left-4">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Home</span>
                    </button>
                </div>
                <h2 className="text-4xl font-extrabold mb-4">About the Project</h2>
                <p className="pt-5 mb-2">
                    <strong>helpstudy.me</strong> is an AI-powered study companion built
                    to generate unlimited practice questions, deliver instant feedback,
                    and track your progress—completely free.
                </p>
                <p className="mb-9">
                    Under the hood, it’s a React front-end with KaTeX for beautiful
                    math rendering, talking to a back-end that proxies to OpenAI’s
                    API to not only craft questions across AP, SAT, ACT, and any other “quiz”
                    you want to master, but also provide feedback on Free Response writing, and offer studying priorites based on multiple choice responses and accuracy.
                </p>
                <p className={"mb-20"}>
                    Created by Liam Kernan as a portfolio piece and a way to help fellow
                    students study not just <b>harder</b>, but <b>smarter</b>.
                </p>
            </div>
        </div>
    );
}