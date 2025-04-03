// src/components/MainMenu.js
import React from "react";

function MainMenu({ onSelectSubject }) {

    const subjects = [
        { id: "calcAB", name: "Calculus AB 📐", color: "bg-blue-500", hoverColor: "bg-blue-600" },
        { id: "calcBC", name: "Calculus BC 📏", color: "bg-blue-500", hoverColor: "bg-blue-600" },
        { id: "stats", name: "Statistics 📊", color: "bg-green-500", hoverColor: "bg-green-600" },
        { id: "bio", name: "Biology 🧬", color: "bg-green-500", hoverColor: "bg-green-600" },
        { id: "physicsC", name: "Physics C ⚛️", color: "bg-purple-500", hoverColor: "bg-purple-600" },
        { id: "usHistory", name: "US History 🗽", color: "bg-red-500", hoverColor: "bg-red-600" },
        { id: "chem", name: "Chemistry 🧪", color: "bg-yellow-500", hoverColor: "bg-yellow-600" },
        { id: "euroHistory", name: "European History 🏰", color: "bg-red-500", hoverColor: "bg-red-600" },
        { id: "psych", name: "Psychology 🧠", color: "bg-pink-500", hoverColor: "bg-pink-600" },
        { id: "compSci", name: "Computer Science A 💻", color: "bg-indigo-500", hoverColor: "bg-indigo-600" },
        { id: "humanGeo", name: "Human Geography 🌍", color: "bg-teal-500", hoverColor: "bg-teal-600" },
        { id: "lit", name: "Literature 📚", color: "bg-amber-500", hoverColor: "bg-amber-600" }
    ];

    return (
        <div className="max-w-5xl mx-auto mt-10 p-8 bg-pastelBlue rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-2 text-center text-blue-900">AP Practice Questions</h1>
            <p className="text-center text-blue-950 mb-8">Select a subject to get a random question</p>

            {/* Replace the old container with this new grid container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.map((subject) => (
                    <button
                        key={subject.id}
                        onClick={() => onSelectSubject(subject.name)}
                        className={`relative p-5 ${subject.color} text-white rounded-lg shadow-md 
                                   hover:${subject.hoverColor} transform hover:-translate-y-1 transition-all duration-200
                                   focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-300`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-semibold">{subject.name}</span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white bg-opacity-30 rounded-b"></div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default MainMenu;