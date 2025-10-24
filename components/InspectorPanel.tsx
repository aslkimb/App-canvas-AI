import React from 'react';
import type { AppData, StepKey, Module, Feature, Action, Page, Entity } from '../types';

interface InspectorPanelProps {
    selectedNodeIds: string[];
    appData: AppData;
    activeStep: StepKey;
    onClose: () => void;
}

// --- Reusable UI Components for the Panel ---

const DetailSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`mb-5 ${className}`}>
        <h4 className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{title}</h4>
        <div>{children}</div>
    </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: 'gray' | 'blue' | 'green' | 'orange' }> = ({ children, color = 'gray' }) => {
    const colors = {
        gray: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[color]}`}>{children}</span>;
};


// --- Data Finding and Rendering Logic ---

const findSelectedItem = (nodeId: string, activeStep: StepKey, appData: AppData) => {
    if (!nodeId) return null;

    if (activeStep <= 3) {
        if (nodeId === 'app-idea') return { id: 'app-idea', name: appData[0]?.refinedIdea || 'App Idea', description: appData[0]?.refinedIdea, type: 'idea' };
        
        const module = appData[1]?.modules?.find(m => m.id === nodeId);
        if (module) return { ...module, type: 'module' };
        
        const feature = appData[2]?.features?.find(f => f.id === nodeId);
        if (feature) return { ...feature, type: 'feature' };
        
        const action = appData[3]?.actions?.find(a => a.id === nodeId);
        if (action) return { ...action, type: 'action' };

        return null;
    }
    
    switch (activeStep) {
        case 4:
            const page = appData[4]?.pages?.find(p => p.id === nodeId);
            return page ? { ...page, type: 'page' } : null;
        case 5:
            const entity = appData[5]?.database?.find(e => e.id === nodeId);
            return entity ? { ...entity, type: 'entity' } : null;
        case 6:
            if (nodeId === 'app-idea') return { id: 'app-idea', name: 'App Idea', type: 'idea' };
            const feature = appData[2]?.features?.find(f => f.id === nodeId);
            if (feature) return { ...feature, type: 'feature' };
            
            const detailMatch = nodeId.match(/(.*)-(state|form|auth)/);
            if (detailMatch) {
                const [, featureId, detailType] = detailMatch;
                const detailData = appData[6]?.featureDetails?.find(d => d.featureId === featureId);
                if (!detailData) return null;
                switch(detailType) {
                    case 'state': return { id: nodeId, name: 'State Management', type: 'detail', content: detailData.stateManagement, featureId };
                    case 'form': return { id: nodeId, name: 'Form Handling', type: 'detail', content: detailData.formHandling, featureId };
                    case 'auth': return { id: nodeId, name: 'Authorization', type: 'detail', content: detailData.authorization, featureId };
                }
            }
            return null;
        case 7:
            if (nodeId === 'app-idea') return { id: 'app-idea', name: 'App Idea', type: 'idea' };
            const backendFeature = appData[2]?.features?.find(f => f.id === nodeId);
            if (backendFeature) return { ...backendFeature, type: 'feature' };

            const allFuncs = appData[7]?.backend?.functions.map((f, i) => ({...f, id: `func-${i}-${f.name.replace(/\s/g, '-')}`})) || [];
            const allCrons = appData[7]?.backend?.cronJobs.map((c, i) => ({...c, id: `cron-${i}-${c.name.replace(/\s/g, '-')}`})) || [];

            const func = allFuncs.find(f => f.id === nodeId);
            if (func) return {...func, type: 'function'};
            const cron = allCrons.find(c => c.id === nodeId);
            if (cron) return {...cron, type: 'cron_job'};
            return null;
        default:
            return null;
    }
}


const renderContent = (item: any, appData: AppData) => {
    switch (item.type) {
        case 'idea':
            return <DetailSection title="Refined Idea"><p className="text-sm text-gray-800 dark:text-gray-200">{item.description}</p></DetailSection>;
        case 'module':
        case 'feature':
        case 'action':
            return <DetailSection title="Description"><p className="text-sm text-gray-800 dark:text-gray-200">{(item as Module).description}</p></DetailSection>;
        case 'page':
            const page = item as Page;
            return (
                <>
                    <DetailSection title="Description"><p className="text-sm">{page.description}</p></DetailSection>
                    <DetailSection title="Layout"><Badge color="blue">{page.layout}</Badge></DetailSection>
                    <DetailSection title="Components">
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {page.components.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </DetailSection>
                    {page.links_to.length > 0 && (
                        <DetailSection title="Links To">
                            <div className="flex flex-wrap gap-2">
                                {page.links_to.map((link, i) => <Badge key={i} color="gray">{link}</Badge>)}
                            </div>
                        </DetailSection>
                    )}
                </>
            );
        case 'entity':
             const entity = item as Entity;
            return (
                 <>
                    <DetailSection title="Attributes">
                        <div className="space-y-1 font-mono text-xs">
                            {entity.attributes.map((attr, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded bg-gray-100 dark:bg-gray-800">
                                    <span className="text-gray-800 dark:text-gray-200">{attr.name}</span>
                                    <Badge color="blue">{attr.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </DetailSection>
                    {entity.relationships.length > 0 && (
                        <DetailSection title="Relationships">
                            <div className="space-y-2 text-sm">
                                {entity.relationships.map((rel, i) => (
                                    <div key={i} className="p-2 rounded bg-gray-100 dark:bg-gray-800">
                                        <div><Badge color="green">{rel.type}</Badge> to <code className="text-xs">{rel.targetEntityId}</code></div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{rel.description}</p>
                                    </div>
                                ))}
                            </div>
                        </DetailSection>
                    )}
                    {entity.constraints.length > 0 && (
                        <DetailSection title="Constraints">
                            <div className="flex flex-wrap gap-2">
                                {entity.constraints.map((c, i) => <Badge key={i} color="orange">{c}</Badge>)}
                            </div>
                        </DetailSection>
                    )}
                    {entity.logging.length > 0 && (
                        <DetailSection title="Logging">
                             <div className="flex flex-wrap gap-2">
                                {entity.logging.map((l, i) => <Badge key={i}>{l}</Badge>)}
                            </div>
                        </DetailSection>
                    )}
                 </>
            )
        case 'detail':
            const parentFeature = appData[2]?.features?.find(f => f.id === item.featureId);
            return (
                 <>
                    {parentFeature && <DetailSection title="Feature"><Badge color="gray">{parentFeature.name}</Badge></DetailSection>}
                    <DetailSection title="Details">
                        <p className="text-sm whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-800 rounded">{item.content}</p>
                    </DetailSection>
                 </>
            );
        case 'function':
             const parentBackendFeature = appData[2]?.features?.find(f => f.id === item.featureId);
             return (
                 <>
                    {parentBackendFeature && <DetailSection title="Feature"><Badge color="gray">{parentBackendFeature.name}</Badge></DetailSection>}
                    <DetailSection title="Description"><p className="text-sm">{item.description}</p></DetailSection>
                 </>
             );
        case 'cron_job':
             return (
                 <>
                    <DetailSection title="Schedule"><Badge color="orange">{item.schedule}</Badge></DetailSection>
                    <DetailSection title="Description"><p className="text-sm">{item.description}</p></DetailSection>
                 </>
            )
        default:
            return <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">{JSON.stringify(item, null, 2)}</pre>;
    }
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ selectedNodeIds, appData, activeStep, onClose }) => {
    const selectedItem = findSelectedItem(selectedNodeIds[0], activeStep, appData);

    if (!selectedItem) {
        return (
             <aside className="w-80 bg-white/80 dark:bg-gray-900/80 p-4 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                 <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="font-semibold">Inspector</p>
                        <p className="text-sm">Click a node on the canvas to see its details here.</p>
                    </div>
                 </div>
             </aside>
        );
    }

    return (
        <aside className="w-80 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 p-4 border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-orange-500 dark:text-orange-400 truncate pr-2">{selectedItem.name}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                 {renderContent(selectedItem, appData)}
            </div>
        </aside>
    );
};
