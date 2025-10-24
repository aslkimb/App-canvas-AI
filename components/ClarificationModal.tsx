
import React from 'react';

interface ClarificationModalProps {
    question: string;
    options: string[];
    onAnswer: (answer: string) => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({ question, options, onAnswer }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-700 animate-fade-in">
                <h3 className="text-lg font-bold text-orange-400 mb-4">{question}</h3>
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => onAnswer(option)}
                            className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
