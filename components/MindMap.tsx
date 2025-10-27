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

    // Normalize strings for comparison
    const normalizeForComparison = (str: string): string => {
        if (!str) return '';
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    // Enhanced matching function that handles various naming conventions
    const isModuleMatch = (featureModuleId: string, moduleId: string, moduleName: string): boolean => {
        if (!featureModuleId || !moduleId) return false;
        
        // Normalize all strings for comparison
        const normFeatureModuleId = normalizeForComparison(featureModuleId);
        const normModuleId = normalizeForComparison(moduleId);
        const normModuleName = normalizeForComparison(moduleName);
        
        // Direct exact match (normalized)
        if (normFeatureModuleId === normModuleId) return true;
        
        // Check if one contains the other
        if (normFeatureModuleId.includes(normModuleId) || 
            normModuleId.includes(normFeatureModuleId)) return true;
            
        // Check if module name is contained in feature module ID
        if (normFeatureModuleId.includes(normModuleName)) return true;
        
        // Split by common separators and check for partial matches
        const featureParts = normFeatureModuleId.split(/[_\-\s]/);
        const moduleParts = normModuleId.split(/[_\-\s]/);
        const nameParts = normModuleName.split(/[_\-\s]/);
        
        // Check for any matching parts (avoid very short matches)
        const allParts = [...moduleParts, ...nameParts];
        for (const featurePart of featureParts) {
            if (featurePart.length < 3) continue; // Skip very short parts
            for (const modulePart of allParts) {
                if (modulePart.length < 3) continue; // Skip very short parts
                if (featurePart === modulePart) return true;
            }
        }
        
        return false;
    };

    const data = useMemo(() => {
        console.log('=== MIND MAP DATA PROCESSING ===');
        console.log('Full appData:', appData);
        console.log('appData[1] (Modules):', appData[1]);
        console.log('appData[2] (Features):', appData[2]?.features?.length || 0, 'features');
        console.log('appData[3] (Actions):', appData[3]?.actions?.length || 0, 'actions');
        
        // Check if we have the required data
        if (!appData[1]?.modules) {
            console.log('No modules data found');
            return {
                id: 'app-idea',
                name: appData[1]?.refinedIdea || 'App Idea',
                description: appData[1]?.refinedIdea,
                children: []
            };
        }
        
        const tree = {
            id: 'app-idea',
            name: appData[1]?.refinedIdea || 'App Idea',
            description: appData[1]?.refinedIdea,
            children: appData[1]?.modules?.map(module => {
                console.log(`Processing module: ${module.id} (${module.name})`);
                
                // Get features for this module
                let moduleFeatures = [];
                if (appData[2]?.features) {
                    moduleFeatures = appData[2].features.filter(feature => {
                        const isMatch = isModuleMatch(feature.moduleId, module.id, module.name);
                        if (isMatch) {
                            console.log(`  ✓ Matched feature ${feature.id} to module ${module.id}`);
                        }
                        return isMatch;
                    });
                }
                
                console.log(`Module "${module.id}" has ${moduleFeatures.length} features`);
                
                return {
                    ...module,
                    children: moduleFeatures.map(feature => {
                        // Get actions for this feature
                        let featureActions = [];
                        if (appData[3]?.actions) {
                            const normFeatureId = normalizeForComparison(feature.id);
                            featureActions = appData[3].actions.filter(action => {
                                const normActionFeatureId = normalizeForComparison(action.featureId);
                                const isMatch = normActionFeatureId === normFeatureId;
                                if (isMatch) {
                                    console.log(`    ✓ Matched action ${action.id} to feature ${feature.id}`);
                                }
                                return isMatch;
                            });
                        }
                        
                        console.log(`  Feature ${feature.id} has ${featureActions.length} actions`);
                        
                        return {
                            ...feature,
                            children: featureActions
                        };
                    })
                };
            })
        };
        
        console.log('Final MindMap tree structure created');
        return tree;
    }, [appData]);

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

    const Node = ({ node, level }: { node: any; level: number; key?: string }) => {
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
                    className={`p-2 border-l-4 ${borderColor} ${isCollapsed ? 'border-dashed' : ''} ${bgColor} rounded-r-md ${hasChildren ? 'cursor-pointer' : ''} hover:shadow-md transition-shadow relative ${isHighlighted ? 'ring-4 ring-orange-500 ring-opacity-70 animate-pulse' : ''}`}
                >
                    <div className="flex items-center">
                         {hasChildren && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCollapse(node.id);
                                }}
                                className="mr-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                            >
                                {isCollapsed ? '[+]' : '[-]'}
                            </button>
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