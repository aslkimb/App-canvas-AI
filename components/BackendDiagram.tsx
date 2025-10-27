import React, { useState } from 'react';
import type { AppData } from '../types';

interface BackendDiagramProps {
    appData: AppData;
    onNodeSelect: (id: string) => void;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    searchTerm: string;
}

interface NodeProps {
    node: any;
    level: number;
    type?: string;
}

export const BackendDiagram: React.FC<BackendDiagramProps> = ({ appData, onNodeSelect, selectedNodeIds, highlightedNodeIds, searchTerm }) => {
    const features = appData[2]?.features || [];
    const backendData = appData[7]?.backend;

    // Generate function IDs to match InspectorPanel expectations
    const functions = backendData?.functions.map((f, i) => ({ 
        ...f, 
        id: `func-${i}-${f.name.replace(/\s/g, '-')}`,
        index: i 
    })) || [];
    
    // Generate cron job IDs to match InspectorPanel expectations
    const cronJobs = backendData?.cronJobs.map((c, i) => ({ 
        ...c, 
        id: `cron-${i}-${c.name.replace(/\s/g, '-')}`,
        index: i 
    })) || [];

    const featuresWithFunctions = features.map(feature => ({
        ...feature,
        children: functions.filter(f => f.featureId === feature.id)
    }));

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

    const Node: React.FC<NodeProps> = ({ node, level, type = 'feature' }) => {
        const isSelected = selectedNodeIds.includes(node.id);
        const isCollapsed = collapsedNodes.has(node.id);
        const basePadding = 'pl-4';
        const levelPadding = `ml-${level * 6}`;
        
        const isHighlighted = highlightedNodeIds.includes(node.id);
        const isDimmed = searchTerm && !isHighlighted;

        let bgColor = 'bg-gray-100 dark:bg-gray-800';
        let textColor = 'text-gray-800 dark:text-gray-200';
        let borderColor = 'border-gray-300 dark:border-gray-600';

        if (type === 'function') {
            borderColor = 'border-blue-500';
            bgColor = 'bg-blue-50 dark:bg-blue-900/30';
        } else if (type === 'cron') {
            borderColor = 'border-purple-500';
            bgColor = 'bg-purple-50 dark:bg-purple-900/30';
        }

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
                            {node.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{node.description}</p>}
                            {node.schedule && <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mt-2 inline-block">{node.schedule}</code>}
                        </div>
                    </div>
                </div>
                {hasChildren && !isCollapsed && (
                    <div className="mt-2">
                        {node.children.map((child: any) => <Node key={child.id} node={child} level={level + 1} type="function" />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 p-4 overflow-auto">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">Backend Logic</h2>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Functions per Feature</h3>
            {featuresWithFunctions.map(feature => <Node key={feature.id} node={feature} level={0} />)}
            
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2">Cron Jobs</h3>
            {cronJobs.length > 0 ? (
                 cronJobs.map(job => <Node key={job.id} node={job} level={0} type="cron" />)
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No cron jobs defined.</p>
            )}
        </div>
    );
};