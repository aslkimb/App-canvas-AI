import React, { useState } from 'react';
import type { AppData } from '../types';

interface FeatureDetailDiagramProps {
    appData: AppData;
    onNodeSelect: (id: string) => void;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    searchTerm: string;
}

interface NodeProps {
    node: any;
    level: number;
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

    // State for collapsed nodes
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

    const toggleNode = (id: string) => {
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const Node: React.FC<NodeProps> = ({ node, level }) => {
        const isSelected = selectedNodeIds.includes(node.id);
        const isCollapsed = collapsedNodes.has(node.id);
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

        // Determine if node has children
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div className={`${basePadding} ${levelPadding} my-2 transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
                <div 
                    onClick={() => onNodeSelect(node.id)}
                    className={`p-3 border-l-4 ${borderColor} ${bgColor} rounded-r-md cursor-pointer hover:shadow-lg transition-shadow relative ${isHighlighted ? 'ring-4 ring-orange-500 ring-opacity-70 animate-pulse' : ''}`}
                >
                    <div className="flex items-start">
                        {hasChildren && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                }}
                                className="mr-2 mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                            >
                                {isCollapsed ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        )}
                        <div>
                            <div className={`font-bold ${textColor}`}>{node.name}</div>
                            {node.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{node.description}</p>}
                        </div>
                    </div>
                </div>
                {hasChildren && !isCollapsed && (
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