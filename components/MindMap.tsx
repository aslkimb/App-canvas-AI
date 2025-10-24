import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

export type Node = d3.SimulationNodeDatum & {
    id: string;
    name: string;
    type: 'idea' | 'module' | 'feature' | 'action';
    color: string;
};

export interface Link extends d3.SimulationLinkDatum<Node> {}

interface MindMapProps {
    data: {
        nodes: Node[];
        links: Link[];
    };
    onNodeClick: (event: any, node: Node | null) => void;
    onNodeDoubleClick: (event: any, node: Node) => void;
    selectedNodeIds: string[];
    collapsedNodes: Set<string>;
}

export const MindMap: React.FC<MindMapProps> = ({ data, onNodeClick, onNodeDoubleClick, selectedNodeIds, collapsedNodes }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

    const { nodes, links } = useMemo(() => {
        const nodesCopy = data.nodes.map(n => ({ ...n }));
        const linksCopy = data.links.map(l => ({ ...l as Link }));
        return { nodes: nodesCopy, links: linksCopy };
    }, [data]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [-width / 2, -height / 2, width, height]);

        const g = svg.select<SVGGElement>('g.content');

        // Restart simulation with new data
        if (simulationRef.current) {
            simulationRef.current.stop();
        }
        
        const simulation = d3.forceSimulation<Node>(nodes)
            .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(d => {
                const sourceType = (d.source as Node).type;
                if (sourceType === 'idea') return 150;
                if (sourceType === 'module') return 100;
                return 60;
            }).strength(1))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(0,0))
            .force('x', d3.forceX(0).strength(0.05))
            .force('y', d3.forceY(0).strength(0.05));
        
        simulationRef.current = simulation;

        const link = g.selectAll<SVGPathElement, Link>('.link')
            .data(links, d => `${(d.source as Node).id}-${(d.target as Node).id}`)
            .join('path')
            .attr('class', 'link')
            .attr('stroke', '#4b5563')
            .attr('stroke-width', 1.5);

        const node = g.selectAll<SVGGElement, Node>('.node')
            .data(nodes, d => d.id)
            .join(enter => {
                const nodeGroup = enter.append('g')
                    .attr('class', 'node cursor-pointer')
                    .call(drag(simulation));
                
                nodeGroup.append('circle')
                    .attr('r', d => d.type === 'idea' ? 30 : d.type === 'module' ? 20 : 15)
                    .attr('fill', d => d.color)
                    .attr('stroke', '#9ca3af')
                    .attr('stroke-width', 2);

                nodeGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.35em')
                    .attr('fill', '#f3f4f6')
                    .attr('class', 'text-xs font-semibold pointer-events-none select-none')
                    .attr('stroke-width', 3)
                    .attr('stroke', '#111827')
                    .attr('paint-order', 'stroke')
                    .text(d => d.name);

                return nodeGroup;
            });
        
        node.on('click', (event, d) => {
            event.stopPropagation();
            onNodeClick(event, d);
        });

        node.on('dblclick', (event, d) => {
            event.stopPropagation();
            onNodeDoubleClick(event, d);
        });

        simulation.on('tick', () => {
            link.attr('d', d => {
                const source = d.source as Node;
                const target = d.target as Node;
                return `M${source.x || 0},${source.y || 0} L${target.x || 0},${target.y || 0}`;
            });
            node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
        });

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.2, 5])
            .on('zoom', (event) => {
                g.attr('transform', event.transform.toString());
            });

        svg.call(zoom);
        svg.on("click", (event) => onNodeClick(event, null));

        return () => {
            simulation.stop();
        };

    }, [nodes, links, onNodeClick, onNodeDoubleClick]);

    useEffect(() => {
        d3.selectAll<SVGGElement, Node>('.node circle')
            .transition().duration(200)
            .attr('stroke', d => selectedNodeIds.includes(d.id) ? '#fb923c' : '#9ca3af')
            .attr('stroke-width', d => selectedNodeIds.includes(d.id) ? 4 : 2)
            .attr('stroke-dasharray', d => collapsedNodes.has(d.id) ? '4 2' : 'none');
    }, [selectedNodeIds, collapsedNodes]);

    const drag = (simulation: d3.Simulation<Node, any>) => {
        function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, any>, d: Node) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x ?? null;
            d.fy = d.y ?? null;
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, Node, any>, d: Node) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, Node, any>, d: Node) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag<SVGGElement, Node>()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    return (
        <div ref={containerRef} className="w-full h-full">
            <svg ref={svgRef} className="w-full h-full">
                <g className="content"></g>
            </svg>
        </div>
    );
};