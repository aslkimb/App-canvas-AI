
import React, { useState } from 'react';

interface IdeaInputProps {
    onStart: (idea: string) => void;
    onSettingsClick: () => void;
}

const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


export const IdeaInput: React.FC<IdeaInputProps> = ({ onStart, onSettingsClick }) => {
    const [idea, setIdea] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onStart(idea.trim());
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-grid-pattern p-4 relative">
             <button
                onClick={onSettingsClick}
                className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Settings"
            >
                <SettingsIcon />
            </button>
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500">App Canvas AI</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Turn your brilliant idea into a detailed application plan.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="e.g., A social network for urban gardeners..."
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                    <button
                        type="submit"
                        disabled={!idea.trim()}
                        className="px-6 py-3 bg-orange-500 dark:bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        Start Brainstorming
                    </button>
                </form>
            </div>
        </div>
    );
};