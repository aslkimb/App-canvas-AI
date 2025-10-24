import React from 'react';
import type { AppData, StepKey, Entity } from '../types';
import { STEPS } from '../constants';

interface InspectorPanelProps {
    selectedNodeIds: string[];
    appData: AppData;
    activeStep: StepKey;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
        <div className="text-sm text-gray-200">{value}</div>
    </div>
);

const renderStepContent = (activeStep: StepKey, appData: AppData) => {
    if (activeStep === 0 && appData[0]) {
        return (
             <div>
                <h3 className="text-lg font-bold text-teal-400 mb-4">Refined Idea</h3>
                <DetailItem label="Refined Core Concept" value={appData[0].refinedIdea} />
                <DetailItem label="Identified Target Audience" value={appData[0].targetAudience} />
            </div>
        )
    }

    if (activeStep === 5 && appData[5]) {
        const entities: Entity[] = appData[5]?.database || [];
        if (entities.length === 0) {
            return <div className="text-center text-gray-400 p-8">Database schema will appear here once generated.</div>;
        }
        return (
            <div>
                <h3 className="text-lg font-bold text-teal-400 mb-4">Database Schema</h3>
                <div className="space-y-6">
                    {entities.map((entity, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h4 className="text-md font-semibold text-white mb-3">{entity.name}</h4>
                            
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Attributes</p>
                                <ul className="space-y-2">
                                    {entity.attributes.map((attr, attrIndex) => (
                                        <li key={attrIndex} className="text-sm text-gray-300">
                                            <div className="flex items-center">
                                                <span className="font-mono bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded mr-2">{attr.name}</span>
                                                <span className="font-mono text-cyan-400 text-xs">({attr.type})</span>
                                            </div>
                                            <p className="text-xs text-gray-400 pl-1 mt-1">{attr.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {entity.relationships?.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Relationships</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                        {entity.relationships.map((rel, relIndex) => (
                                            <li key={relIndex}>{rel}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {entity.constraints?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Constraints</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                        {entity.constraints.map((con, conIndex) => (
                                            <li key={conIndex}>{con}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    const stepData = appData[activeStep];
    const stepConfig = STEPS.find(s => s.id === activeStep);

    if (stepConfig && stepData) {
        return (
            <div>
                 <h3 className="text-lg font-bold text-orange-400 mb-2">{stepConfig.name} Details</h3>
                 <pre className="text-xs bg-gray-800 p-2 rounded-md overflow-x-auto border border-gray-700">
                    {JSON.stringify(stepData, null, 2)}
                 </pre>
            </div>
        )
    }

    return <div className="text-center text-gray-400 p-8">Select a node on the mind map or advance to a step with a detailed view.</div>;
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ selectedNodeIds, appData, activeStep }) => {
    
    if (selectedNodeIds.length > 1) {
        return (
            <div className="bg-gray-900/50 p-4 rounded-lg h-full">
                <h3 className="text-lg font-bold text-teal-400 mb-2">Multiple Items Selected</h3>
                <DetailItem label="Count" value={`${selectedNodeIds.length} items`} />
                <p className="text-sm text-gray-400 mt-4">Bulk actions are not yet available. Select a single node to see its details.</p>
            </div>
        );
    }

    const selectedNodeId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;

    const renderNodeContent = () => {
        if (!selectedNodeId) return null;

        if (selectedNodeId === 'idea') {
            const ideaDescription = appData[1]?.description || appData[0]?.refinedIdea;
            return (
                <div>
                    <h3 className="text-lg font-bold text-orange-400 mb-2">Core Idea</h3>
                    <DetailItem label="Summary" value={ideaDescription || 'No summary available yet.'} />
                </div>
            );
        }

        const allModules = appData[1]?.modules || [];
        const module = allModules.find(m => m.id === selectedNodeId);
        if (module) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-2">{module.name}</h3>
                    <DetailItem label="Type" value="Module" />
                    <DetailItem label="ID" value={<code className="text-xs bg-gray-700 p-1 rounded">{module.id}</code>} />
                    <DetailItem label="Description" value={module.description} />
                </div>
            );
        }

        const allFeatures = appData[2]?.features || [];
        const feature = allFeatures.find(f => f.id === selectedNodeId);
        if (feature) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-green-400 mb-2">{feature.name}</h3>
                    <DetailItem label="Type" value="Feature" />
                    <DetailItem label="ID" value={<code className="text-xs bg-gray-700 p-1 rounded">{feature.id}</code>} />
                    <DetailItem label="Module" value={allModules.find(m => m.id === feature.moduleId)?.name || 'Unknown'} />
                    <DetailItem label="Description" value={feature.description} />
                </div>
            );
        }

        const allActions = appData[3]?.actions || [];
        const action = allActions.find(a => a.id === selectedNodeId);
        if (action) {
            return (
                <div>
                    <h3 className="text-lg font-bold text-purple-400 mb-2">{action.name}</h3>
                    <DetailItem label="Type" value="Action" />
                    <DetailItem label="ID" value={<code className="text-xs bg-gray-700 p-1 rounded">{action.id}</code>} />
                    <DetailItem label="Feature" value={allFeatures.find(f => f.id === action.featureId)?.name || 'Unknown'} />
                    <DetailItem label="Description" value={action.description} />
                </div>
            );
        }
        
        return <div className="text-center text-gray-400 p-8">Details for this node are not available yet.</div>;
    };

    return <div className="bg-gray-900/50 p-4 rounded-lg h-full">{selectedNodeId ? renderNodeContent() : renderStepContent(activeStep, appData)}</div>;
};