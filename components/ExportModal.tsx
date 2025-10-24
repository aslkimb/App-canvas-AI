import React from 'react';

interface ExportModalProps {
    onExport: (format: 'md' | 'json' | 'txt' | 'png') => void;
    onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onExport, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-300 dark:border-gray-700 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Export As...</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="space-y-3">
                     <button
                        onClick={() => onExport('png')}
                        className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                         <span className="font-mono text-xs bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 px-2 py-1 rounded">PNG</span>
                        <span className="font-semibold">PNG Image</span>
                    </button>
                    <button
                        onClick={() => onExport('md')}
                        className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <span className="font-mono text-xs bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200 px-2 py-1 rounded">MD</span>
                        <span className="font-semibold">Markdown</span>
                    </button>
                    <button
                        onClick={() => onExport('json')}
                        className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                         <span className="font-mono text-xs bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-2 py-1 rounded">JSON</span>
                        <span className="font-semibold">JSON</span>
                    </button>
                     <button
                        onClick={() => onExport('txt')}
                        className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                         <span className="font-mono text-xs bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded">TXT</span>
                        <span className="font-semibold">Plain Text</span>
                    </button>
                </div>
            </div>
        </div>
    );
};