import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import remarkMath    from 'remark-math';
import rehypeKatex   from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function StudyMaterial({
                                          question,
                                          loading,
                                          activeSubject,
                                          onBackToMenu,
                                      }) {
    const formatSubjectName = (subject) =>
        subject
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

    return (
        <div className="question-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-2xl font-bold">
                    {formatSubjectName(activeSubject)} Guide
                </h2>
                <button
                    onClick={onBackToMenu}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                >
                    ← Back to Menu
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <ArrowPathIcon className="h-12 w-12 text-pastelBlue animate-spin mb-4" />
                    <p className="text-white">Generating guide…</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md prose text-gray-900">
                    <ReactMarkdown
                        children={question}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    />
                </div>
            )}
        </div>
    );
}