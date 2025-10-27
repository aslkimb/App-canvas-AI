import React, { useState } from 'react';

interface ExportModalProps {
    onExport: (format: 'md' | 'json' | 'txt' | 'png', selectedSteps: number[]) => void;
    onClose: () => void;
    completedSteps: number[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ onExport, onClose, completedSteps }) => {
    const [selectedFormat, setSelectedFormat] = useState<'md' | 'json' | 'txt' | 'png' | null>(null);
    const [selectedSteps, setSelectedSteps] = useState<number[]>(completedSteps);
    const [selectAll, setSelectAll] = useState(true);

    const handleStepToggle = (step: number) => {
        if (selectedSteps.includes(step)) {
            setSelectedSteps(selectedSteps.filter(s => s !== step));
        } else {
            setSelectedSteps([...selectedSteps, step]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedSteps([]);
        } else {
            setSelectedSteps(completedSteps);
        }
        setSelectAll(!selectAll);
    };

    const handleExport = () => {
        if (selectedFormat && selectedSteps.length > 0) {
            onExport(selectedFormat, selectedSteps);
            onClose();
        }
    };

    const getFormatClass = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
            case 'orange': return 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200';
            case 'blue': return 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
            case 'green': return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
            default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const formatOptions = [
        { id: 'png', name: 'PNG Image', color: 'red' },
        { id: 'md', name: 'Markdown', color: 'orange' },
        { id: 'json', name: 'JSON', color: 'blue' },
        { id: 'txt', name: 'Plain Text', color: 'green' }
    ];

    const stepNames = [
        "Refine Idea & Define Modules",
        "Define Features",
        "Detail User Actions",
        "Design Pages & User Flow",
        "Define Database Schema",
        "Plan Feature Implementation",
        "Define Backend Logic",
        "Establish Design System"
    ];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-300 dark:border-gray-700 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Export Options</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-bold mb-2">Select Format</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {formatOptions.map(format => (
                            <button
                                key={format.id}
                                onClick={() => setSelectedFormat(format.id as 'md' | 'json' | 'txt' | 'png')}
                                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                    selectedFormat === format.id 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <span className={`font-mono text-xs px-2 py-1 rounded ${getFormatClass(format.color)}`}>
                                    {format.id.toUpperCase()}
                                </span>
                                <span className="font-semibold">{format.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Select Steps</h3>
                        <button 
                            onClick={handleSelectAll}
                            className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                            {selectAll ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        {completedSteps.map(step => (
                            <div key={step} className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    id={`step-${step}`}
                                    checked={selectedSteps.includes(step)}
                                    onChange={() => handleStepToggle(step)}
                                    className="mr-2 h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                                />
                                <label htmlFor={`step-${step}`} className="text-sm">
                                    <span className="font-medium">Step {step}:</span> {stepNames[step - 1]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!selectedFormat || selectedSteps.length === 0}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                            !selectedFormat || selectedSteps.length === 0
                                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                    >
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};