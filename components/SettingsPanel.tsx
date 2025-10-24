import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '../constants';

interface SettingsPanelProps {
    apiKey: string;
    model: string;
    onSave: (apiKey: string, model: string) => void;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ apiKey: initialApiKey, model: initialModel, onSave, onClose }) => {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [model, setModel] = useState(initialModel);

    const handleSave = () => {
        onSave(apiKey, model);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-end z-50" onClick={onClose}>
            <div className="w-96 bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">API Configuration</h3>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter your API key"
                            />
                        </div>
                        <div>
                             <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Model
                            </label>
                            <select
                                id="model"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                            >
                                {AVAILABLE_MODELS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                     <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
