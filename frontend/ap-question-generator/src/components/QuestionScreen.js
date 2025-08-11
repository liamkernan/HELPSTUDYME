import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { ArrowPathIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Notepad from './Notepad';

/* ── Enhanced renderer for both math and code formatting ───────────────────────────── */
function EnhancedRenderer({ text }) {
    // Check if text contains markdown code blocks or inline code
    const hasCodeFormatting = /```|`/.test(text);
    
    if (hasCodeFormatting) {
        // Use ReactMarkdown for text with code formatting
        return (
            <ReactMarkdown
                children={text}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Ensure proper styling for code blocks
                    code: ({node, inline, className, children, ...props}) => {
                        return inline ? (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        ) : (
                            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                                <code className="text-sm font-mono" {...props}>
                                    {children}
                                </code>
                            </pre>
                        );
                    }
                }}
            />
        );
    } else {
        // Use original LaTeX-only renderer for backward compatibility
        const regex = /\\\[(.+?)\\\]|\\\((.+?)\\\)/gs;
        const parts = [];
        let last = 0, m;

        while ((m = regex.exec(text)) !== null) {
            if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
            parts.push({ type: m[1] ? 'display' : 'inline', content: (m[1] || m[2]).trim() });
            last = m.index + m[0].length;
        }
        if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });

        return parts.map((p, i) =>
            p.type === 'display' ? <BlockMath key={i} math={p.content} /> :
                p.type === 'inline' ? <InlineMath key={i} math={p.content} /> :
                    <span key={i}>{p.content}</span>
        );
    }
}

/* ── Main component ────────────────────────────────────────────── */
export default function QuestionScreen({
                                           question, loading, activeSubject,
                                           selectedAnswer, setSelectedAnswer,
                                           correctAnswer,  showFeedback,
                                           answerSubmitted, onSubmitAnswer,
                                           onNewQuestion,   onBackToMenu,
                                       }) {
    const [showNotepad, setShowNotepad] = useState(false);

    const formatSubjectName = (s) =>
        s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

    /* Split prompt & options -------------------------------------- */
    const parseOptions = () => {
        const opts = [];
        ['A','B','C','D'].forEach(L => {
            const m = question.match(new RegExp(`${L}\\)([\\s\\S]+?)(?=(?:[A-D]\\)|$))`));
            if (m) opts.push({ letter: L, text: m[1].trim() });
        });
        return opts;
    };
    const options    = parseOptions();
    const promptText = question.split(/^[A-D]\)/m)[0].trim();

    /* ── Layout & content ----------------------------------------- */
    return (
        <div className="question-screen p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-2xl font-bold">
                    {activeSubject && formatSubjectName(activeSubject)} Question
                </h2>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowNotepad(v => !v)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full shadow-lg backdrop-blur transition
              ${showNotepad ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'}`}
                    >
                        <DocumentTextIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Notepad</span>
                    </button>

                    <button
                        onClick={onBackToMenu}
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full shadow-lg backdrop-blur transition"
                    >
                        <span className="text-sm font-medium">Back to Menu</span>
                    </button>
                </div>
            </div>

            {/* Body */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <ArrowPathIcon className="h-12 w-12 text-pastelBlue animate-spin mb-4" />
                    <p className="text-white">Generating question...</p>
                </div>
            ) : (
                <div className={`grid gap-6 grid-cols-1 ${showNotepad ? 'lg:grid-cols-3' : ''}`}>
                    {/* Question card (2/3 width on lg) */}
                    <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                        {/* Prompt */}
                        <div className="question-text mb-6">
                            <EnhancedRenderer text={promptText} />
                        </div>

                        {showFeedback && (
                            <div className={`mt-6 mb-6 p-4 rounded-lg
                ${selectedAnswer === correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'}`}>
                                <div className="flex items-center gap-3">
                                    {selectedAnswer === correctAnswer ? (
                                        <CheckCircleIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
                                    )}
                                    <div>
                                        <h3 className="font-bold">
                                            {selectedAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
                                        </h3>
                                        <p>The correct answer is {correctAnswer}.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        <div className="options-container">
                            {options.map(opt => (
                                <div
                                    key={opt.letter}
                                    onClick={() => !answerSubmitted && setSelectedAnswer(opt.letter)}
                                    className={`option p-4 mb-3 border rounded-lg cursor-pointer transition-colors
                    ${selectedAnswer === opt.letter ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}
                    ${showFeedback && opt.letter === correctAnswer ? 'bg-green-200 border-green-500' : ''}
                    ${showFeedback && selectedAnswer === opt.letter && selectedAnswer !== correctAnswer
                                        ? 'bg-red-200 border-red-500' : ''}`}
                                >
                                    <div className="flex">
                                        <span className="font-bold mr-2">{opt.letter})</span>
                                        <EnhancedRenderer text={opt.text} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="actions mt-6 flex justify-between">
                            {!answerSubmitted ? (
                                <button
                                    onClick={onSubmitAnswer}
                                    disabled={!selectedAnswer}
                                    className={`px-6 py-2 rounded-lg
                    ${selectedAnswer
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={onNewQuestion}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                                >
                                    Next Question
                                </button>
                            )}
                        </div>

                        {/* Feedback */}

                    </div>

                    {/* Notepad column (1/3 width on lg) */}
                    {showNotepad && (
                        <Notepad questionKey={question} />
                    )}
                </div>
            )}
        </div>
    );
}