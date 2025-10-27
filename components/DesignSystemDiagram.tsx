import React from 'react';
import type { AppData } from '../types';

interface DesignSystemDiagramProps {
    appData: AppData;
}

export const DesignSystemDiagram: React.FC<DesignSystemDiagramProps> = ({ appData }) => {
    const designGuidelines = appData[8]?.designGuidelines;
    
    if (!designGuidelines) {
        return (
            <div className="flex-1 p-8 overflow-auto text-center flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold mb-4">Design System</h2>
                <p className="text-gray-500 dark:text-gray-400">No design guidelines available.</p>
            </div>
        );
    }

    // Function to convert color names to actual colors
    const getColorStyle = (color: string) => {
        // Check if it's a hex color
        if (color.startsWith('#')) {
            return { backgroundColor: color };
        }
        
        // Check if it's an rgb/rgba color
        if (color.startsWith('rgb')) {
            return { backgroundColor: color };
        }
        
        // Otherwise treat as a CSS color name
        return { backgroundColor: color };
    };

    return (
        <div className="flex-1 p-8 overflow-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Design System</h2>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Color Palette */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Color Palette</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-24 h-24 rounded-lg shadow-md mb-2 border border-gray-200 dark:border-gray-700" 
                                style={getColorStyle(designGuidelines.colors.primary)}
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Primary</span>
                            <code className="text-xs text-gray-500 dark:text-gray-400">{designGuidelines.colors.primary}</code>
                        </div>
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-24 h-24 rounded-lg shadow-md mb-2 border border-gray-200 dark:border-gray-700" 
                                style={getColorStyle(designGuidelines.colors.secondary)}
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Secondary</span>
                            <code className="text-xs text-gray-500 dark:text-gray-400">{designGuidelines.colors.secondary}</code>
                        </div>
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-24 h-24 rounded-lg shadow-md mb-2 border border-gray-200 dark:border-gray-700" 
                                style={getColorStyle(designGuidelines.colors.accent)}
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Accent</span>
                            <code className="text-xs text-gray-500 dark:text-gray-400">{designGuidelines.colors.accent}</code>
                        </div>
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-24 h-24 rounded-lg shadow-md mb-2 border border-gray-200 dark:border-gray-700" 
                                style={getColorStyle(designGuidelines.colors.neutral)}
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Neutral</span>
                            <code className="text-xs text-gray-500 dark:text-gray-400">{designGuidelines.colors.neutral}</code>
                        </div>
                    </div>
                </div>
                
                {/* Typography */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Typography</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-gray-600 dark:text-gray-300 mb-1">Heading</h4>
                            <div 
                                className="text-2xl font-bold p-3 rounded border border-gray-200 dark:border-gray-700"
                                style={{ fontFamily: designGuidelines.typography.heading }}
                            >
                                {designGuidelines.typography.heading || 'Default Heading Font'}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-600 dark:text-gray-300 mb-1">Body</h4>
                            <div 
                                className="text-base p-3 rounded border border-gray-200 dark:border-gray-700"
                                style={{ fontFamily: designGuidelines.typography.body }}
                            >
                                {designGuidelines.typography.body || 'Default Body Font'}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Style & Spacing */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Design Style</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200">{designGuidelines.style || 'No style guidelines specified'}</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Spacing</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200">{designGuidelines.spacing || 'No spacing guidelines specified'}</p>
                    </div>
                </div>
                
                {/* Icons */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Icons</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200">{designGuidelines.icons || 'No icon guidelines specified'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};