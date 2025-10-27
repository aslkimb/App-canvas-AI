import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import type { AppData } from '../types';

interface PageDiagramProps {
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

export const PageDiagram: React.FC<PageDiagramProps> = ({ appData, onNodeSelect, selectedNodeIds, theme, highlightedNodeIds, searchTerm }) => {
    const pages = appData[4]?.pages || [];
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
        if (pages.length > 0 && Object.keys(customPositions).length === 0) {
            const initialPositions: { [key: string]: { x: number; y: number } } = {};
            const containerWidth = containerRef.current?.clientWidth || 800;
            const containerHeight = containerRef.current?.clientHeight || 600;
            
            pages.forEach((page, index) => {
                // Calculate grid position
                const cols = Math.max(1, Math.floor(containerWidth / 250));
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                initialPositions[page.id] = {
                    x: Math.max(20, col * 250 + 50),
                    y: Math.max(80, row * 150 + 100)
                };
            });
            
            setCustomPositions(initialPositions);
        }
    }, [pages]);

    const getPosition = (id: string) => {
        // Check if we have a custom position for this node
        if (customPositions[id]) {
            return { ...customPositions[id], width: 200, height: 100 }; // Approximate width/height
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
        const constrainedX = Math.max(20, Math.min(containerRect.width - 220, x));
        const constrainedY = Math.max(80, Math.min(containerRect.height - 120, y));
        
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

    // If no pages data, show loading message
    if (!appData[4] || pages.length === 0) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">No page data available yet. Waiting for step to complete...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 p-8 overflow-auto relative">
            <h2 className="text-xl font-bold mb-8 absolute top-4 left-4 z-20 bg-white dark:bg-gray-900 px-2 py-1 rounded">Page Flow</h2>
            <div className="relative" style={{ minHeight: '800px', minWidth: '100%' }}>
                {pages.map(page => {
                    const isHighlighted = highlightedNodeIds.includes(page.id);
                    const isDimmed = searchTerm && !isHighlighted;
                    const position = getPosition(page.id);

                    return (
                        <div
                            key={page.id}
                            ref={el => { nodeRefs.current[page.id] = el; }}
                            onClick={() => onNodeSelect(page.id)}
                            onMouseDown={(e) => handleMouseDown(e, page.id)}
                            className={`absolute p-4 rounded-lg shadow-lg cursor-move transition-all border-2 ${selectedNodeIds.includes(page.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 scale-105' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'} ${isDimmed ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'ring-4 ring-orange-500 ring-opacity-70 animate-pulse' : ''}`}
                            style={{
                                left: position ? `${position.x}px` : '50px',
                                top: position ? `${position.y}px` : '100px',
                                width: '200px',
                                transform: draggingNode === page.id ? 'rotate(5deg)' : 'none',
                                zIndex: draggingNode === page.id ? 1000 : 10
                            }}
                        >
                            <h3 className="font-bold text-center">{page.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{page.layout}</p>
                        </div>
                    );
                })}
            </div>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: '100%', minHeight: '100%' }}>
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColor} />
                    </marker>
                    <marker id="arrow-highlight" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={highlightColor} />
                    </marker>
                </defs>
                {pages.map(page => {
                    const fromPos = getPosition(page.id);
                    if (!fromPos) return null;
                    
                    // Filter out invalid links
                    const validLinks = page.links_to.filter(targetId => {
                        // Make sure the target page exists
                        return pages.some(p => p.id === targetId);
                    });
                    
                    return validLinks.map(targetId => {
                        const toPos = getPosition(targetId);
                        if (!toPos) return null;

                        const isHighlighted = highlightedNodeIds.includes(page.id) || highlightedNodeIds.includes(targetId);
                        const isDimmed = searchTerm && !isHighlighted;

                        const startX = fromPos.x + fromPos.width / 2;
                        const startY = fromPos.y + fromPos.height / 2;
                        const endX = toPos.x + toPos.width / 2;
                        const endY = toPos.y + toPos.height / 2;

                        return (
                            <line 
                                key={`${page.id}-${targetId}`} 
                                x1={startX} y1={startY} 
                                x2={endX} y2={endY} 
                                stroke={isHighlighted ? highlightColor : lineColor} 
                                strokeWidth={isHighlighted ? 3 : 2} 
                                markerEnd={isHighlighted ? "url(#arrow-highlight)" : "url(#arrow)"} 
                                className={`transition-all duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                            />
                        );
                    });
                })}
            </svg>
        </div>
    );
};