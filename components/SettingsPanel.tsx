
import React from 'react';

interface SettingsPanelProps {
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="space-y-4">
                   <p className="text-gray-400">This is a placeholder for model settings and fine-tuning prompts.</p>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                        <input type="password" id="apiKey" value="••••••••••••••••" readOnly className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-300" />
                         <p className="text-xs text-gray-500 mt-1">API Key is managed via environment variables.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
