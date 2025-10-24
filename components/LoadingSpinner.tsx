
import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center z-40">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-white">AI is thinking...</p>
    </div>
);

