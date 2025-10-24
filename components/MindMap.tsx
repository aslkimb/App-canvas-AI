import React, { useState, useMemo } from 'react';
import type { AppData } from '../types';

interface MindMapProps {
    appData: AppData;
    onNodeSelect: (id: string) => void;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    searchTerm: string;
}

export const MindMap: React.FC<MindMapProps> = ({ appData, onNodeSelect, selectedNodeIds, highlightedNodeIds, searchTerm }) => {
    const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);

    const handleToggleCollapse = (nodeId: string) => {
        setCollapsedNodes(prev =>
            prev.includes(nodeId)
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    };

    const data = useMemo(() => ({
        id: 'app-idea',
        name: appData[0]?.refinedIdea || 'App Idea',
        description: appData[0]?.refinedIdea,
        children: appData[1]?.modules?.map(module => ({
            ...module,
            children: appData[2]?.features?.filter(f => f.moduleId === module.id).map(feature => ({
                ...feature,
                children: appData[3]?.actions?.filter(a => a.featureId === feature.id)
            }))
        }))
    }), [appData]);

    const allParentNodeIds = useMemo(() => {
        const ids: string[] = [];
        const findParentIds = (node: any) => {
            if (!node) return;
            if (node.children && node.children.length > 0) {
                ids.push(node.id);
                node.children.forEach(findParentIds);
            }
        };
        findParentIds(data);
        return ids;
    }, [data]);

    const handleCollapseAll = () => {
        setCollapsedNodes(allParentNodeIds);
    };

    const handleExpandAll = () => {
        setCollapsedNodes([]);
    };

    const Node = ({ node, level }: { node: any; level: number }) => {
        if (!node) return null;
        const isSelected = selectedNodeIds.includes(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isCollapsed = collapsedNodes.includes(node.id);

        const isHighlighted = highlightedNodeIds.includes(node.id);
        const isDimmed = searchTerm && !isHighlighted;

        let bgColor = 'bg-gray-100 dark:bg-gray-800';
        let borderColor = 'border-gray-300 dark:border-gray-600';
        
        if (isSelected) {
            bgColor = 'bg-orange-100 dark:bg-orange-900/50';
            borderColor = 'border-orange-500';
        }

        return (
            <div 
                style={{ marginLeft: `${level * 1.5}rem`}} 
                className={`my-1 transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
            >
                <div 
                    onClick={() => onNodeSelect(node.id)}
                    onDoubleClick={() => hasChildren && handleToggleCollapse(node.id)}
                    className={`p-2 border-l-4 ${borderColor} ${isCollapsed ? 'border-dashed' : ''} ${bgColor} rounded-r-md ${hasChildren ? 'cursor-pointer' : ''} hover:shadow-md transition-shadow relative ${isHighlighted ? 'ring-2 ring-orange-500' : ''}`}
                >
                    <div className="flex items-center">
                         {hasChildren && (
                            <span className="mr-2 text-xs text-gray-400 dark:text-gray-500 select-none">
                                {isCollapsed ? '[+]' : '[-]'}
                            </span>
                        )}
                        <div className={`font-bold text-gray-800 dark:text-gray-200`}>{node.name}</div>
                    </div>

                    {node.description && level > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{node.description}</p>}
                </div>
                {!isCollapsed && hasChildren && (
                     <div className="mt-1">
                        {node.children.map((child: any) => <Node key={child.id} node={child} level={level + 1} />)}
                     </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Application Structure</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleCollapseAll}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Collapse All
                    </button>
                    <button
                        onClick={handleExpandAll}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Expand All
                    </button>
                </div>
            </div>
            <Node node={data} level={0} />
        </div>
    );
};
