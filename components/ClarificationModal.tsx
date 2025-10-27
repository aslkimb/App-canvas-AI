import React, { useState } from 'react';

interface Clarification {
    question: string;
    options: string[];
}

interface ClarificationModalProps {
    questions: Clarification[];
    onAnswer: (answers: string[][], remarks: string) => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({ questions, onAnswer }) => {
    const [selectedOptions, setSelectedOptions] = useState<string[][]>(Array(questions.length).fill([]));
    const [remarks, setRemarks] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleToggleOption = (option: string, questionIndex: number) => {
        setSelectedOptions(prev => {
            const newSelectedOptions = [...prev];
            const questionOptions = newSelectedOptions[questionIndex];
            newSelectedOptions[questionIndex] = questionOptions.includes(option)
                ? questionOptions.filter(item => item !== option)
                : [...questionOptions, option];
            return newSelectedOptions;
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        // Check if all questions have at least one selected option
        const allAnswered = selectedOptions.every(options => options.length > 0);
        if (allAnswered) {
            onAnswer(selectedOptions, remarks.trim());
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const currentSelectedOptions = selectedOptions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-300 dark:border-gray-700 animate-fade-in flex flex-col" style={{maxHeight: '80vh'}}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-orange-500 dark:text-orange-400">
                        {currentQuestion.question}
                    </h3>
                    {questions.length > 1 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {currentQuestionIndex + 1} of {questions.length}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-shrink-0">Select all that apply.</p>
                <div className="space-y-3 flex-1 overflow-y-auto mb-4 pr-2">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = currentSelectedOptions.includes(option);
                        return (
                            <div
                                key={index}
                                onClick={() => handleToggleOption(option, currentQuestionIndex)}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-3 border-2 ${
                                    isSelected
                                        ? 'bg-orange-500/20 border-orange-500'
                                        : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 ${isSelected ? 'bg-orange-600 border-orange-500' : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500'}`}>
                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span>{option}</span>
                            </div>
                        )
                    })}
                </div>
                {questions.length > 1 && (
                    <div className="flex justify-between mb-4">
                        <button
                            onClick={handlePrevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextQuestion}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
                 <div className="mt-2 mb-6 flex-shrink-0">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Additional Remarks (Optional)
                    </label>
                    <textarea
                        id="remarks"
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any extra context or details here..."
                        className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={selectedOptions.some(options => options.length === 0)}
                    className="w-full p-3 bg-orange-500 dark:bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};