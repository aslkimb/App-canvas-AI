import React from 'react';
import type { AppData } from '../types';

interface FeatureDetailDiagramProps {
    appData: AppData;
    onNodeSelect: (id: string) => void;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    searchTerm: string;
}

export const FeatureDetailDiagram: React.FC<FeatureDetailDiagramProps> = ({ appData, onNodeSelect, selectedNodeIds, highlightedNodeIds, searchTerm }) => {
    const features = appData[2]?.features || [];
    const details = appData[6]?.featureDetails || [];

    const data = features.map(feature => {
        const detail = details.find(d => d.featureId === feature.id);
        return {
            ...feature,
            children: detail ? [
                { id: `${feature.id}-state`, name: 'State Management', description: detail.stateManagement, featureId: feature.id },
                { id: `${feature.id}-form`, name: 'Form Handling', description: detail.formHandling, featureId: feature.id },
                { id: `${feature.id}-auth`, name: 'Authorization', description: detail.authorization, featureId: feature.id }
            ] : []
        };
    });

    const Node = ({ node, level }: { node: any; level: number }) => {
        const isSelected = selectedNodeIds.includes(node.id);
        const basePadding = 'pl-4';
        const levelPadding = `ml-${level * 6}`;
        
        const isHighlighted = highlightedNodeIds.includes(node.id);
        const isDimmed = searchTerm && !isHighlighted;

        let bgColor = level === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700/50';
        let textColor = 'text-gray-800 dark:text-gray-200';
        let borderColor = 'border-gray-300 dark:border-gray-600';
        
        if (isSelected) {
            bgColor = 'bg-orange-100 dark:bg-orange-900/50';
            borderColor = 'border-orange-500';
        }

        return (
            <div className={`${basePadding} ${levelPadding} my-2 transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
                <div 
                    onClick={() => onNodeSelect(node.id)}
                    className={`p-3 border-l-4 ${borderColor} ${bgColor} rounded-r-md cursor-pointer hover:shadow-lg transition-shadow relative ${isHighlighted ? 'ring-2 ring-orange-500' : ''}`}
                >
                    <div className={`font-bold ${textColor}`}>{node.name}</div>
                    {node.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{node.description}</p>}
                </div>
                {node.children && node.children.length > 0 && (
                     <div className="mt-2">
                        {node.children.map((child: any) => <Node key={child.id} node={child} level={level + 1} />)}
                     </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 p-4 overflow-auto">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">Feature Implementation Details</h2>
            {data.map(feature => <Node key={feature.id} node={feature} level={0} />)}
        </div>
    );
};
