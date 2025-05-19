import React from "react";
import { useAuth } from "../../AuthContext";
import { ArrowLeft } from "lucide-react";

export default function StudyAnything({ onSelectSubject, onViewHistory, onBack }) {

    const { user, signIn, signOut, loading } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-blue-950 text-gray-100">
            <div className="container mx-auto p-6">
                <button
                    onClick={onBack}
                    className="underline text-teal-400 hover:text-teal-200 mb-4"
                >
                    ← Back Home
                </button>
                <h2 className="text-4xl font-extrabold mb-4">study anything; coming soon</h2>
                <p>
                   this page is under development
                </p>
            </div>
        </div>
    );
}