
import React, { useState } from 'react';

interface IdeaInputProps {
    onStart: (idea: string) => void;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ onStart }) => {
    const [idea, setIdea] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onStart(idea.trim());
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900 bg-grid-pattern p-4">
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">App Canvas AI</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-400 mb-8">
                    Turn your brilliant idea into a detailed application plan.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="e.g., A social network for urban gardeners..."
                        className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                    <button
                        type="submit"
                        disabled={!idea.trim()}
                        className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        Start Brainstorming
                    </button>
                </form>
            </div>
        </div>
    );
};
