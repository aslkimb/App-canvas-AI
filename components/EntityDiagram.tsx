import React, { useRef, useLayoutEffect, useState, useCallback, useEffect } from 'react';
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
    const [draggingNode, setDraggingNode] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [customPositions, setCustomPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
    
    const lineColor = theme === 'dark' ? '#4b5563' : '#9ca3af';
    const highlightColor = '#f97316'; // orange-500

    const calculatePositions = useCallback(() => {
        if (!containerRef.current) return;
        const newPositions: NodePosition[] = [];
        const containerRect = containerRef.current.getBoundingClientRect();

        Object.entries(nodeRefs.current).forEach(([id, el]) => {
            if (el) {
                const rect = (el as HTMLDivElement).getBoundingClientRect();
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
    }, []);

    useLayoutEffect(() => {
        calculatePositions();
        const resizeObserver = new ResizeObserver(calculatePositions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [calculatePositions, customPositions]);

    // Initialize nodes in visible area if no custom positions exist
    useEffect(() => {
        if (entities.length > 0 && Object.keys(customPositions).length === 0) {
            const initialPositions: { [key: string]: { x: number; y: number } } = {};
            const containerWidth = containerRef.current?.clientWidth || 800;
            const containerHeight = containerRef.current?.clientHeight || 600;
            
            entities.forEach((entity, index) => {
                // Calculate grid position
                const cols = Math.max(1, Math.floor(containerWidth / 300));
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                initialPositions[entity.id] = {
                    x: Math.max(20, col * 300 + 50),
                    y: Math.max(80, row * 200 + 100)
                };
            });
            
            setCustomPositions(initialPositions);
        }
    }, [entities]);

    const getPosition = (id: string) => {
        // Check if we have a custom position for this node
        if (customPositions[id]) {
            return { ...customPositions[id], width: 250, height: 150 }; // Approximate width/height
        }
        return positions.find(p => p.id === id);
    };

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const nodePos = getPosition(id);
        if (!nodePos) return;
        
        setDraggingNode(id);
        setDragOffset({
            x: e.clientX - nodePos.x,
            y: e.clientY - nodePos.y
        });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!draggingNode || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - containerRect.left - dragOffset.x;
        const y = e.clientY - containerRect.top - dragOffset.y;
        
        // Constrain movement to container bounds with padding
        const constrainedX = Math.max(20, Math.min(containerRect.width - 270, x));
        const constrainedY = Math.max(80, Math.min(containerRect.height - 170, y));
        
        setCustomPositions(prev => ({
            ...prev,
            [draggingNode]: { x: constrainedX, y: constrainedY }
        }));
    }, [draggingNode, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setDraggingNode(null);
    }, []);

    useEffect(() => {
        if (draggingNode) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggingNode, handleMouseMove, handleMouseUp]);

    // If no entities data, show loading message
    if (!appData[5] || entities.length === 0) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">No database schema available yet. Waiting for step to complete...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 p-8 overflow-auto relative">
            <h2 className="text-xl font-bold mb-8 absolute top-4 left-4 z-20 bg-white dark:bg-gray-900 px-2 py-1 rounded">Database Schema</h2>
            <div className="relative" style={{ minHeight: '800px', minWidth: '100%' }}>
                {entities.map(entity => {
                    const isHighlighted = highlightedNodeIds.includes(entity.id);
                    const isDimmed = searchTerm && !isHighlighted;
                    const position = getPosition(entity.id);

                    return (
                        <div
                            key={entity.id}
                            ref={el => { nodeRefs.current[entity.id] = el; }}
                            onClick={() => onNodeSelect(entity.id)}
                            onMouseDown={(e) => handleMouseDown(e, entity.id)}
                            className={`absolute p-4 rounded-lg shadow-lg cursor-move transition-all border-2 ${selectedNodeIds.includes(entity.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'} ${isDimmed ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'ring-4 ring-orange-500 ring-opacity-70 animate-pulse' : ''}`}
                            style={{
                                left: position ? `${position.x}px` : '50px',
                                top: position ? `${position.y}px` : '100px',
                                width: '250px',
                                transform: draggingNode === entity.id ? 'rotate(2deg)' : 'none',
                                zIndex: draggingNode === entity.id ? 1000 : 10
                            }}
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

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: '100%', minHeight: '100%' }}>
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