import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
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
    }, [pages]);

    const getPosition = (id: string) => positions.find(p => p.id === id);

    return (
        <div ref={containerRef} className="flex-1 p-8 overflow-auto relative">
            <h2 className="text-xl font-bold mb-8 absolute top-4 left-4 z-20">Page Flow</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
                {pages.map(page => {
                    const isHighlighted = highlightedNodeIds.includes(page.id);
                    const isDimmed = searchTerm && !isHighlighted;

                    return (
                        <div
                            key={page.id}
                            ref={el => { nodeRefs.current[page.id] = el; }}
                            onClick={() => onNodeSelect(page.id)}
                            className={`p-4 rounded-lg shadow-lg cursor-pointer transition-all border-2 ${selectedNodeIds.includes(page.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 scale-105' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'} ${isDimmed ? 'opacity-30' : 'opacity-100'} ${isHighlighted ? 'ring-2 ring-orange-500' : ''}`}
                        >
                            <h3 className="font-bold text-center">{page.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{page.layout}</p>
                        </div>
                    );
                })}
            </div>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: containerRef.current?.scrollWidth, minHeight: containerRef.current?.scrollHeight }}>
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
                    return page.links_to.map(targetId => {
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
