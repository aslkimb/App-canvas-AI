import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { STEPS } from './constants';
import { generateContent, generateClarifyingQuestion } from './services/geminiService';
import type { AppData, StepKey, Clarification, Module, Feature, Action } from './types';
import { MindMap, Node, Link } from './components/MindMap';
import { Timeline } from './components/Timeline';
import { InspectorPanel } from './components/InspectorPanel';
import { IdeaInput } from './components/IdeaInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ClarificationModal } from './components/ClarificationModal';
import { SettingsPanel } from './components/SettingsPanel';


// Simple SVG Icons to avoid creating new files
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17 3H5a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2zm-3 8a1 1 0 01-1 1H7a1 1 0 110-2h6a1 1 0 011 1zm-1-4a1 1 0 00-1-1H7a1 1 0 100 2h6a1 1 0 001-1z" />
    </svg>
);

const LoadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);


const App: React.FC = () => {
    const [apiKey] = useState(process.env.API_KEY || '');
    const [idea, setIdea] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppData>({});
    const [activeStep, setActiveStep] = useState<StepKey>(0);
    const [completedSteps, setCompletedSteps] = useState<StepKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clarification, setClarification] = useState<Clarification | null>(null);
    const [clarificationContext, setClarificationContext] = useState<any>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => setFeedbackMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    const handleStart = (userIdea: string) => {
        if (!apiKey) {
            setError("API Key is not configured. Please set the API_KEY environment variable.");
            return;
        }
        setIdea(userIdea);
        setIsStarted(true);
        setActiveStep(0);
        setAppData({});
        setCompletedSteps([]);
    };

    const runStep = useCallback(async (stepKey: StepKey, context?: any) => {
        const baseIdea = idea || '';
        if (!baseIdea || !apiKey) return;

        const step = STEPS.find(s => s.id === stepKey);
        if (!step) {
            setError(`Step ${stepKey} not found.`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const effectiveIdea = appData[0]?.refinedIdea || baseIdea;

            // Path 1: Ask for clarification if needed and not already provided
            if (step.needsClarification && !context) {
                const clarificationPrompt = step.clarificationPrompt(effectiveIdea, appData);
                const question = await generateClarifyingQuestion(apiKey, clarificationPrompt);
                setClarification(question);
                setClarificationContext({ stepKey });
                setIsLoading(false); // Stop loading, we are now waiting for user input
                return; // Exit early, wait for user to answer
            }

            // Path 2: Generate content for the step
            const prompt = step.prompt(effectiveIdea, appData, context);
            const result = await generateContent<any>(apiKey, prompt, step.schema);
            
            setAppData(prevData => ({ ...prevData, [stepKey]: result }));
            setCompletedSteps(prev => [...new Set([...prev, stepKey])].sort((a,b) => a-b));
            setSelectedNodeIds([]);
            
            // Cleanup state after successful content generation
            setClarification(null);
            setClarificationContext(null);
            setIsLoading(false);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while processing the request.');
            // Cleanup state on error
            setClarification(null);
            setClarificationContext(null);
            setIsLoading(false);
        }
    }, [idea, apiKey, appData]);


    useEffect(() => {
        // This effect is the single source of truth for generating step content.
        // It runs when the active step is not yet completed.
        if (isStarted && idea && !completedSteps.includes(activeStep) && !isLoading && !clarification) {
            runStep(activeStep);
        }
    }, [isStarted, idea, activeStep, completedSteps, isLoading, clarification, runStep]);

    const handleClarificationAnswer = (answer: string) => {
        if (clarificationContext) {
            // User has answered, now run the step again with the answer as context
            runStep(clarificationContext.stepKey, { clarificationAnswer: answer });
        }
    };

    const handleBack = () => {
        setActiveStep(prev => Math.max(0, prev - 1) as StepKey);
    };
    
    const handleNext = () => {
        const nextStepKey = (activeStep + 1) as StepKey;
        if (nextStepKey < STEPS.length) {
            setActiveStep(nextStepKey);
        }
    };
    
    const handleRegenerate = () => {
        if (isLoading || clarification) return;

        // Clear data for the current step and all subsequent steps
        setAppData(prevData => {
            const newData = { ...prevData };
            Object.keys(newData).forEach(key => {
                if (parseInt(key, 10) >= activeStep) {
                    delete newData[parseInt(key, 10) as StepKey];
                }
            });
            return newData;
        });

        // Remove the current step and all subsequent steps from the completed list
        setCompletedSteps(prev => prev.filter(id => id < activeStep));
        // The main useEffect will now detect that the activeStep is no longer complete and will re-run it.
    };

    const handleSave = () => {
        try {
            const stateToSave = {
                idea,
                appData,
                activeStep,
                completedSteps,
                collapsedNodes: Array.from(collapsedNodes), // Convert Set to Array for JSON
            };
            localStorage.setItem('appCanvasAIState', JSON.stringify(stateToSave));
            setFeedbackMessage('Session saved successfully!');
        } catch (e) {
            setError('Failed to save session to local storage.');
            console.error('Save error:', e);
        }
    };

    const handleLoad = () => {
        try {
            const savedStateJSON = localStorage.getItem('appCanvasAIState');
            if (savedStateJSON) {
                const loadedState = JSON.parse(savedStateJSON);

                if (loadedState.idea && loadedState.appData) {
                    setIdea(loadedState.idea);
                    setAppData(loadedState.appData);
                    setActiveStep(loadedState.activeStep || 0);
                    setCompletedSteps(loadedState.completedSteps || []);
                    setCollapsedNodes(new Set(loadedState.collapsedNodes || []));
                    setIsStarted(true);
                    setFeedbackMessage('Session loaded successfully!');
                } else {
                    setError('Could not load session. The saved data is invalid.');
                }
            } else {
                setError('No saved session found in local storage.');
            }
        } catch (e) {
            setError('Failed to load session from local storage.');
            console.error('Load error:', e);
        }
    };
    
    const handleExport = () => {
        try {
            const modules = appData[1]?.modules || [];
            const features = appData[2]?.features || [];
            const actions = appData[3]?.actions || [];

            const exportData = {
                idea: idea,
                refinedIdea: appData[0]?.refinedIdea,
                modules: modules.map((module: Module) => ({
                    ...module,
                    features: features
                        .filter((feature: Feature) => feature.moduleId === module.id)
                        .map((feature: Feature) => ({
                            ...feature,
                            actions: actions.filter((action: Action) => action.featureId === feature.id),
                        })),
                })),
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = 'app-canvas-export.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            setFeedbackMessage('Exporting JSON file...');
        } catch (e) {
            setError('Failed to export data.');
            console.error('Export error:', e);
        }
    };

    const handleNodeClick = (event: any, node: Node | null) => {
        if (node === null) {
            setSelectedNodeIds([]);
            return;
        }
        const nodeId = node.id;
        if (event.shiftKey) {
            setSelectedNodeIds(prev =>
                prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
            );
        } else {
            setSelectedNodeIds([nodeId]);
        }
    };

    const handleNodeDoubleClick = (_event: any, node: Node) => {
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(node.id)) {
                newSet.delete(node.id);
            } else {
                newSet.add(node.id);
            }
            return newSet;
        });
    };

    const mindMapData = useMemo<{ nodes: Node[], links: Link[] }>(() => {
        if (!idea) return { nodes: [], links: [] };

        const nodes: Node[] = [];
        const links: Link[] = [];

        nodes.push({ id: 'idea', name: idea.length > 20 ? idea.substring(0, 17) + '...' : idea, type: 'idea', color: '#f97316' });

        const modules: Module[] = appData[1]?.modules || [];
        modules.forEach(m => {
            nodes.push({ id: m.id, name: m.name, type: 'module', color: '#3b82f6' });
            links.push({ source: 'idea', target: m.id } as unknown as Link);
        });

        const features: Feature[] = appData[2]?.features || [];
        features.forEach(f => {
            nodes.push({ id: f.id, name: f.name, type: 'feature', color: '#22c55e' });
            links.push({ source: f.moduleId, target: f.id } as unknown as Link);
        });

        const actions: Action[] = appData[3]?.actions || [];
        actions.forEach(a => {
            nodes.push({ id: a.id, name: a.name, type: 'action', color: '#a855f7' });
            links.push({ source: a.featureId, target: a.id } as unknown as Link);
        });
        
        if (collapsedNodes.size === 0) {
            return { nodes, links };
        }

        const childrenMap = new Map<string, string[]>();
        links.forEach(link => {
            const sourceId = ((link as any).source as string);
            const targetId = ((link as any).target as string);
            if (!childrenMap.has(sourceId)) childrenMap.set(sourceId, []);
            childrenMap.get(sourceId)!.push(targetId);
        });

        const hiddenNodeIds = new Set<string>();
        const queue: string[] = [];

        collapsedNodes.forEach(collapsedId => {
            (childrenMap.get(collapsedId) || []).forEach(childId => queue.push(childId));
        });

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (!hiddenNodeIds.has(currentId)) {
                hiddenNodeIds.add(currentId);
                (childrenMap.get(currentId) || []).forEach(childId => queue.push(childId));
            }
        }
        
        const visibleNodes = nodes.filter(node => !hiddenNodeIds.has(node.id));
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

        const visibleLinks = links.filter(link => 
            visibleNodeIds.has(((link as any).source as string)) && 
            visibleNodeIds.has(((link as any).target as string))
        );
        
        return { nodes: visibleNodes, links: visibleLinks };

    }, [idea, appData, collapsedNodes]);

    if (!isStarted) {
        return <IdeaInput onStart={handleStart} />;
    }
    
    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === STEPS.length - 1;
    const allStepsComplete = completedSteps.length === STEPS.length;
    const isCurrentStepComplete = completedSteps.includes(activeStep);

    const nextStepInfo = STEPS.find(s => s.id === activeStep + 1);
    const isNextStepGenerated = nextStepInfo ? completedSteps.includes(nextStepInfo.id) : false;

    let nextButtonText = 'Next';
    if (!isLastStep && isCurrentStepComplete) {
        nextButtonText = isNextStepGenerated ? 'Next' : `Generate: ${nextStepInfo?.name || ''}`;
    }
    if (isLastStep && allStepsComplete) {
        nextButtonText = "Finished";
    }
    
    const disableNext = isLoading || !!clarification || (isLastStep && isCurrentStepComplete) || !isCurrentStepComplete;

    return (
        <div className="bg-gray-800 text-white h-screen flex flex-col font-sans">
            {isLoading && <LoadingSpinner />}
            {clarification && (
                <ClarificationModal
                    question={clarification.question}
                    options={clarification.options}
                    onAnswer={handleClarificationAnswer}
                />
            )}
             {isSettingsOpen && <SettingsPanel onClose={() => setIsSettingsOpen(false)} />}
            
            <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-3 flex justify-between items-center z-20">
                <div>
                    <h1 className="text-xl font-bold">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">App Canvas AI</span>
                    </h1>
                    <p className="text-xs text-gray-400 truncate max-w-md" title={idea || ''}>{appData[0]?.refinedIdea || idea}</p>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={handleSave}
                        className="bg-gray-700 px-3 py-2 text-sm font-bold rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
                        title="Save Session"
                    >
                        <SaveIcon />
                        Save
                    </button>
                    <button 
                        onClick={handleLoad}
                        className="bg-gray-700 px-3 py-2 text-sm font-bold rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
                        title="Load Session"
                    >
                        <LoadIcon />
                        Load
                    </button>
                    <button 
                        onClick={handleExport}
                        className="bg-gray-700 px-3 py-2 text-sm font-bold rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
                        title="Export as JSON"
                    >
                        <ExportIcon />
                        Export
                    </button>
                    
                    <div className="w-px h-6 bg-gray-600 mx-2"></div>

                    <button
                        onClick={handleRegenerate}
                        disabled={isLoading || !isCurrentStepComplete}
                        className="bg-gray-700 px-3 py-2 text-sm font-bold rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Regenerate this step"
                    >
                        <RefreshIcon />
                        Regenerate
                    </button>
                    <button 
                        onClick={handleBack}
                        disabled={isFirstStep || isLoading}
                        className="bg-gray-700 px-4 py-2 text-sm font-bold rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ArrowLeftIcon/>
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={disableNext}
                        className="bg-orange-600 px-4 py-2 text-sm font-bold rounded-lg hover:bg-orange-500 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {nextButtonText}
                        {!(isLastStep && allStepsComplete) && <ArrowRightIcon />}
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-700 transition">
                         <CogIcon />
                    </button>
                </div>
            </header>

            <main className="flex-grow flex overflow-hidden">
                <aside className="w-64 flex-shrink-0 p-4 border-r border-gray-800 overflow-y-auto">
                    <h2 className="text-sm font-semibold uppercase text-gray-400 mb-4">Project Timeline</h2>
                    <Timeline steps={STEPS} activeStep={activeStep} completedSteps={completedSteps} />
                </aside>

                <div className="flex-grow relative bg-gray-900 bg-grid-pattern">
                    <MindMap 
                        data={mindMapData} 
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick} 
                        selectedNodeIds={selectedNodeIds}
                        collapsedNodes={collapsedNodes}
                    />
                </div>

                <aside className="w-96 flex-shrink-0 p-4 border-l border-gray-800 overflow-y-auto">
                    <h2 className="text-sm font-semibold uppercase text-gray-400 mb-4">Inspector</h2>
                     <InspectorPanel selectedNodeIds={selectedNodeIds} appData={appData} activeStep={activeStep} />
                </aside>
            </main>
            {feedbackMessage && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 animate-fade-in">{feedbackMessage}</div>}
            {error && <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50 animate-fade-in">{error}</div>}
        </div>
    );
};

export default App;