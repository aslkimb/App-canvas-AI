import React, { useRef, useLayoutEffect, useState } from 'react';
import type { AppData } from '../types';

interface EntityDiagramProps {
    appData: AppData;
    onNodeSelect: (id: string) => void;
    selectedNodeIds: string[];
    theme: 'light' | 'dark';
    highlightedNodeIds: string[];
    searchTerm: string;
}

interface NodePosition {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const EntityDiagram: React.FC<EntityDiagramProps> = ({ appData, onNodeSelect, selectedNodeIds, theme, highlightedNodeIds, searchTerm }) => {
    const entities = appData[5]?.database || [];
    const containerRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [positions, setPositions] = useState<NodePosition[]>([]);
    const lineColor = theme === 'dark' ? '#4b5563' : '#9ca3af';
    const highlightColor = '#f97316'; // orange-500

    useLayoutEffect(() => {
        const calculatePositions = () => {
            if (!containerRef.current) return;
            const newPositions: NodePosition[] = [];
            const containerRect = containerRef.current.getBoundingClientRect();

            Object.entries(nodeRefs.current).forEach(([id, el]) => {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    newPositions.push({
                        id,
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top,
                        width: rect.width,
                        height: rect.height,
                    });
                }
            });
            setPositions(newPositions);
        };

        calculatePositions();
        const resizeObserver = new ResizeObserver(calculatePositions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [entities]);

    const getPosition = (id: string) => positions.find(p => p.id === id);

    return (
        <div ref={containerRef} className="flex-1 p-8 overflow-auto relative">
            <h2 className="text-xl font-bold mb-8 absolute top-4 left-4 z-20">Database Schema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {entities.map(entity => {
                    const isHighlighted = highlightedNodeIds.includes(entity.id);
                    const isDimmed = searchTerm && !isHighlighted;
                    return (
                        <div
                            key={entity.id}
                            ref={el => { nodeRefs.current[entity.id] = el; }}
                            onClick={() => onNodeSelect(entity.id)}
                            className={`p-4 rounded-lg shadow-lg cursor-pointer transition-all border-2 ${selectedNodeIds.includes(entity.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'} ${isDimmed ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'ring-2 ring-orange-500' : ''}`}
                        >
                            <h3 className="font-bold text-center text-orange-600 dark:text-orange-400 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">{entity.name}</h3>
                            <ul className="text-sm">
                                {entity.attributes.map(attr => (
                                    <li key={attr.name} className="flex justify-between font-mono text-xs">
                                        <span>{attr.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{attr.type}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: containerRef.current?.scrollWidth, minHeight: containerRef.current?.scrollHeight }}>
                {entities.map(entity => {
                    const fromPos = getPosition(entity.id);
                    if (!fromPos) return null;
                    return entity.relationships.map(rel => {
                        const toPos = getPosition(rel.targetEntityId);
                        if (!toPos) return null;

                        const isHighlighted = highlightedNodeIds.includes(entity.id) || highlightedNodeIds.includes(rel.targetEntityId);
                        const isDimmed = searchTerm && !isHighlighted;

                        const startX = fromPos.x + fromPos.width / 2;
                        const startY = fromPos.y + fromPos.height / 2;
                        const endX = toPos.x + toPos.width / 2;
                        const endY = toPos.y + toPos.height / 2;

                        return (
                             <line 
                                key={`${entity.id}-${rel.targetEntityId}`} 
                                x1={startX} y1={startY} 
                                x2={endX} y2={endY} 
                                stroke={isHighlighted ? highlightColor : lineColor} 
                                strokeWidth={isHighlighted ? 3 : 2}
                                strokeDasharray="5,5"
                                className={`transition-all duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                             />
                        );
                    });
                })}
            </svg>
        </div>
    );
};
