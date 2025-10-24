import React from 'react';
import type { AppData } from '../types';

interface BackendDiagramProps {
    appData: AppData;
    onNodeSelect: (id: string) => void;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    searchTerm: string;
}

export const BackendDiagram: React.FC<BackendDiagramProps> = ({ appData, onNodeSelect, selectedNodeIds, highlightedNodeIds, searchTerm }) => {
    const features = appData[2]?.features || [];
    const backendData = appData[7]?.backend;

    const functions = backendData?.functions.map(f => ({ ...f, id: `func-${f.featureId}-${f.name.replace(/\s/g, '-')}` })) || [];
    const cronJobs = backendData?.cronJobs.map(c => ({ ...c, id: `cron-${c.name.replace(/\s/g, '-')}` })) || [];

    const featuresWithFunctions = features.map(feature => ({
        ...feature,
        children: functions.filter(f => f.featureId === feature.id)
    }));

    const Node = ({ node, level, type = 'feature' }: { node: any; level: number; type?: string }) => {
        const isSelected = selectedNodeIds.includes(node.id);
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

        return (
            <div className={`${basePadding} ${levelPadding} my-2 transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
                <div
                    onClick={() => onNodeSelect(node.id)}
                    className={`p-3 border-l-4 ${borderColor} ${bgColor} rounded-r-md cursor-pointer hover:shadow-lg transition-shadow relative ${isHighlighted ? 'ring-2 ring-orange-500' : ''}`}
                >
                    <div className={`font-bold ${textColor}`}>{node.name}</div>
                    {node.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{node.description}</p>}
                    {node.schedule && <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mt-2 inline-block">{node.schedule}</code>}
                </div>
                {node.children && node.children.length > 0 && (
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
