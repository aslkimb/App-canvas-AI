import React, { useState, useEffect, useMemo, useRef } from 'react';
import { STEPS, AVAILABLE_MODELS } from './constants';
import { generate as generateService } from './services/geminiService';
import type { AppData, Clarification, StepKey, Theme } from './types';

// Import Components
import { IdeaInput } from './components/IdeaInput';
import { Timeline } from './components/Timeline';
import { MindMap } from './components/MindMap';
import { PageDiagram } from './components/PageDiagram';
import { EntityDiagram } from './components/EntityDiagram';
import { FeatureDetailDiagram } from './components/FeatureDetailDiagram';
import { BackendDiagram } from './components/BackendDiagram';
import { DesignSystemDiagram } from './components/DesignSystemDiagram';
import { InspectorPanel } from './components/InspectorPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ClarificationModal } from './components/ClarificationModal';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportModal } from './components/ExportModal';
import { DiagramSearchBar } from './components/DiagramSearchBar';
import html2canvas from 'html2canvas';


// Icons for buttons
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const NextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110 2h11.586l-4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const RegenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0112 5v0a9 9 0 017.5 12.5M20 20l-1.5-1.5A9 9 0 0112 19v0a9 9 0 01-7.5-12.5" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const LoadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0112 5v0a9 9 0 017.5 12.5M20 20l-1.5-1.5A9 9 0 0112 19v0a9 9 0 01-7.5-12.5" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

function App() {
    const [idea, setIdea] = useState<string>('');
    const [appData, setAppData] = useState<AppData>({});
    const [activeStep, setActiveStep] = useState<StepKey>(0);
    const [completedSteps, setCompletedSteps] = useState<StepKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clarification, setClarification] = useState<{ questions: Clarification[] } | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);
    const [expandedPages, setExpandedPages] = useState<string[]>([]);
    const [expandedEntities, setExpandedEntities] = useState<string[]>([]);

    const [isInspectorOpen, setIsInspectorOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const [theme, setTheme] = useState<Theme>('dark');
    const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
    const [modelName, setModelName] = useState(AVAILABLE_MODELS[0].id);

    const [searchTerm, setSearchTerm] = useState('');
    const diagramContainerRef = useRef<HTMLDivElement>(null);


    // --- Effects ---
    // Initial load from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('appcanvas_theme') as Theme | null;
        const savedKey = localStorage.getItem('appcanvas_apikey');
        const savedModel = localStorage.getItem('appcanvas_model');

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

        if (savedKey) setApiKey(savedKey);
        if (savedModel) setModelName(savedModel);

    }, []);

    // Update theme class on html element
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('appcanvas_theme', theme);
    }, [theme]);

    // Feedback message timer
    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => setFeedbackMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);
    
    // Core step processing logic
    useEffect(() => {
        // This effect runs when the active step is one that hasn't been completed yet.
        const shouldProcess = activeStep > 0 && !completedSteps.includes(activeStep) && !isLoading && !clarification && !error;
        if (shouldProcess) {
            runStep();
        }
    }, [activeStep, completedSteps, isLoading, clarification, error]);


    // --- State & Data Handlers ---
    const runStep = async (context?: any, forceRefetch = false) => {
        const currentStep = STEPS.find(s => s.id === activeStep);
        if (!currentStep) return;

        setIsLoading(true);
        setError(null);
        setClarification(null);

        try {
            // Always validate API key - no development mode exceptions
            if (!apiKey) {
                throw new Error("An API Key must be set");
            }

            if (currentStep.needsClarification && !context) {
                const prompt = currentStep.clarificationPrompt(idea, appData);
                
                // Generate multiple clarifying questions using the AI service
                // Create a prompt that asks for multiple questions using MCPS approach
                const multiQuestionPrompt = `
You are an expert application planning assistant using Multi-Clarification Prompting System (MCPS) to gather detailed requirements.

CONTEXT:
- Original Idea: "${idea}"
${appData[1] ? `- Refined Idea: "${appData[1].refinedIdea}"` : ''}
${appData[1] && appData[1].modules ? `- Current Modules: ${appData[1].modules.map(m => m.name).join(', ')}` : ''}

TASK:
Generate exactly 2 clarifying questions to better understand the requirements for this step:
"${currentStep.name}"

REQUIREMENTS FOR QUESTIONS:
1. Each question must be specific and directly related to the step and context
2. Questions should progressively refine the requirements
3. Each question must have exactly 3 relevant answer options
4. Answer options should represent distinct approaches or choices
5. Questions should help identify key decisions for implementation

OUTPUT FORMAT:
Return ONLY a JSON array with exactly 2 objects. Each object must have:
- "question": A specific clarifying question (string)
- "options": Exactly 3 distinct answer options (array of strings)

Example format:
[
  {
    "question": "What is the primary goal for users of this app?",
    "options": ["Connect with others", "Learn new skills", "Complete tasks efficiently"]
  },
  {
    "question": "What is the target user experience priority?",
    "options": ["Speed and performance", "Rich features and customization", "Simplicity and ease of use"]
  }
]

Do not include any other text, explanations, or formatting in your response.
`;

                // Generate multiple questions using the AI service
                try {
                    const result = await generateService({ 
                        apiKey, 
                        modelName, 
                        prompt: multiQuestionPrompt, 
                        type: 'generation',  // Use generation type to get array response
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question: { type: 'string' },
                                    options: { 
                                        type: 'array',
                                        items: { type: 'string' },
                                        minItems: 3,
                                        maxItems: 3
                                    }
                                },
                                required: ['question', 'options']
                            },
                            minItems: 2,
                            maxItems: 2
                        }
                    });
                    
                    // Ensure we have the right format
                    const multiClarification = {
                        questions: Array.isArray(result) ? result : [result]
                    };
                    setClarification(multiClarification);
                } catch (error) {
                    console.error("Error generating multiple questions:", error);
                    // Fallback to single question generation
                    const result = await generateService({ 
                        apiKey, 
                        modelName, 
                        prompt: currentStep.clarificationPrompt(idea, appData), 
                        type: 'clarification' 
                    });
                    // Convert single clarification to multi-clarification format
                    const multiClarification = {
                        questions: [result]
                    };
                    setClarification(multiClarification);
                }
                // Stop here and wait for user input
                return;
            }

            // If no clarification needed or context is provided, proceed to generate content
            await generateStepContent(context || {}, forceRefetch);

        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateStepContent = async (context: any, forceRefetch = false) => {
        const currentStep = STEPS.find(s => s.id === activeStep);
        if (!currentStep) return;

        setIsLoading(true);
        setError(null);
        
        try {
            // Remove all mock data - always use AI model
            const prompt = currentStep.prompt(idea, appData, context);
            const result = await generateService({
                apiKey,
                modelName,
                prompt,
                schema: currentStep.schema,
                type: 'generation',
                cacheKey: `step_${activeStep}_${idea}`,
                forceRefetch,
            });
            
            setAppData(prev => ({ ...prev, [activeStep]: result }));
            setCompletedSteps(prev => [...new Set([...prev, activeStep])]);

        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
         setIsLoading(false);
        }
    };

    const handleStart = (initialIdea: string) => {
        setIdea(initialIdea);
        setAppData({ 0: { refinedIdea: initialIdea, targetAudience: 'General Audience' } });
        setCompletedSteps([0]);
        setActiveStep(1);
        setSelectedNodeIds(['app-idea']);
    };

    const handleClarificationAnswer = (answers: string[][], remarks: string) => {
        const context = {
            clarificationAnswers: answers,
            remarks: remarks,
        };
        setClarification(null);
        
        // Generate content for all steps by calling runStep with the context
        runStep(context);
    };

    const handleApiKeySave = (newApiKey: string, newModel: string) => {
        setApiKey(newApiKey);
        setModelName(newModel);
        localStorage.setItem('appcanvas_apikey', newApiKey);
        localStorage.setItem('appcanvas_model', newModel);
        setFeedbackMessage('Settings saved!');
    };
    
    const handleRegenerate = () => {
        if (window.confirm(`Are you sure you want to regenerate Step ${activeStep}? All subsequent steps will be cleared.`)) {
            const newCompleted = completedSteps.filter(s => s < activeStep);
            const newData = { ...appData };
            for (let i = activeStep; i <= STEPS.length; i++) {
                delete newData[i];
            }
            setCompletedSteps(newCompleted);
            setAppData(newData);
            setError(null); // Clear error to allow useEffect to re-trigger
        }
    };

    const handleSave = () => {
        try {
            const stateToSave = {
                idea,
                appData,
                activeStep,
                completedSteps,
                collapsedNodes,
                expandedPages,
                expandedEntities
            };
            localStorage.setItem('appcanvas_session', JSON.stringify(stateToSave));
            setFeedbackMessage('Session saved!');
        } catch (e) {
            console.error(e);
            setFeedbackMessage('Failed to save session.');
        }
    };

    const handleLoad = () => {
         if (window.confirm(`Are you sure you want to load the last session? Any unsaved progress will be lost.`)) {
            try {
                const savedState = localStorage.getItem('appcanvas_session');
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    setIdea(parsed.idea);
                    setAppData(parsed.appData);
                    setActiveStep(parsed.activeStep);
                    setCompletedSteps(parsed.completedSteps);
                    setCollapsedNodes(parsed.collapsedNodes || []);
                    setExpandedPages(parsed.expandedPages || []);
                    setExpandedEntities(parsed.expandedEntities || []);
                    setFeedbackMessage('Session loaded!');
                } else {
                    setFeedbackMessage('No saved session found.');
                }
            } catch (e) {
                 console.error(e);
                 setFeedbackMessage('Failed to load session.');
            }
        }
    };

    const handleExport = (format: 'md' | 'json' | 'txt' | 'png', selectedSteps: number[]) => {
        if (format === 'png') {
            if (diagramContainerRef.current) {
                setIsLoading(true);
                html2canvas(diagramContainerRef.current, {
                    backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
                    scale: 2
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `app-canvas-export.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }).catch(err => {
                    console.error("Error exporting PNG:", err);
                    setError("Failed to export diagram as PNG.");
                }).finally(() => {
                    setIsLoading(false);
                });
            }
            return;
        }

        let content = '';
        let filename = `app-canvas-export.${format}`;

        // Filter appData to only include selected steps
        const filteredData: any = {};
        selectedSteps.forEach(step => {
            if (appData[step]) {
                filteredData[step] = appData[step];
            }
        });

        if (format === 'json') {
            // Create a structured export with relationships
            const exportData: any = {
                idea: appData[0]?.refinedIdea,
                exportedSteps: selectedSteps,
                timestamp: new Date().toISOString()
            };
            
            if (selectedSteps.includes(1)) {
                exportData.modules = appData[1]?.modules;
            }
            
            if (selectedSteps.includes(2)) {
                exportData.features = appData[2]?.features;
            }
            
            if (selectedSteps.includes(3)) {
                exportData.actions = appData[3]?.actions;
            }
            
            if (selectedSteps.includes(4)) {
                exportData.pages = appData[4]?.pages;
            }
            
            if (selectedSteps.includes(5)) {
                exportData.database = appData[5]?.database;
            }
            
            if (selectedSteps.includes(6)) {
                exportData.featureDetails = appData[6]?.featureDetails;
            }
            
            if (selectedSteps.includes(7)) {
                exportData.backend = appData[7]?.backend;
            }
            
            if (selectedSteps.includes(8)) {
                exportData.designGuidelines = appData[8]?.designGuidelines;
            }
            
            content = JSON.stringify(exportData, null, 2);
        } else if (format === 'md') {
            content = generateMarkdownExport(filteredData, selectedSteps);
        } else {
            // Plain text format
            content = generateTextExport(filteredData, selectedSteps);
        }

        const blob = new Blob([content], { type: `text/${format};charset=utf-8;` });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const generateMarkdownExport = (filteredData: any, selectedSteps: number[]): string => {
        let content = `# App Canvas Export\n\n`;
        content += `Exported on: ${new Date().toLocaleString()}\n\n`;
        
        const stepNames = [
            "Refine Idea & Define Modules",
            "Define Features",
            "Detail User Actions",
            "Design Pages & User Flow",
            "Define Database Schema",
            "Plan Feature Implementation",
            "Define Backend Logic",
            "Establish Design System"
        ];
        
        selectedSteps.forEach(step => {
            content += `## Step ${step}: ${stepNames[step - 1]}\n\n`;
            
            switch (step) {
                case 1:
                    content += `**Refined Idea:** ${filteredData[1]?.refinedIdea}\n\n`;
                    content += `### Modules\n\n`;
                    filteredData[1]?.modules?.forEach((module: any) => {
                        content += `- **${module.name}**: ${module.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 2:
                    content += `### Features\n\n`;
                    filteredData[2]?.features?.forEach((feature: any) => {
                        content += `- **${feature.name}**: ${feature.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 3:
                    content += `### User Actions\n\n`;
                    filteredData[3]?.actions?.forEach((action: any) => {
                        content += `- **${action.name}**: ${action.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 4:
                    content += `### Pages\n\n`;
                    filteredData[4]?.pages?.forEach((page: any) => {
                        content += `- **${page.name}** (${page.layout}): ${page.description}\n`;
                        if (page.components && page.components.length > 0) {
                            content += `  - Components: ${page.components.join(', ')}\n`;
                        }
                        if (page.links_to && page.links_to.length > 0) {
                            content += `  - Links to: ${page.links_to.join(', ')}\n`;
                        }
                    });
                    content += `\n`;
                    break;
                case 5:
                    content += `### Database Entities\n\n`;
                    filteredData[5]?.database?.forEach((entity: any) => {
                        content += `- **${entity.name}**\n`;
                        entity.attributes.forEach((attr: any) => {
                            content += `  - ${attr.name} (${attr.type}): ${attr.description}\n`;
                        });
                    });
                    content += `\n`;
                    break;
                case 6:
                    content += `### Feature Implementation Details\n\n`;
                    filteredData[6]?.featureDetails?.forEach((detail: any) => {
                        content += `- **Feature ID ${detail.featureId}**\n`;
                        content += `  - State Management: ${detail.stateManagement}\n`;
                        content += `  - Form Handling: ${detail.formHandling}\n`;
                        content += `  - Authorization: ${detail.authorization}\n\n`;
                    });
                    break;
                case 7:
                    content += `### Backend Logic\n\n`;
                    content += `#### Functions\n\n`;
                    filteredData[7]?.backend?.functions?.forEach((func: any) => {
                        content += `- **${func.name}**: ${func.description}\n`;
                    });
                    content += `\n#### Cron Jobs\n\n`;
                    filteredData[7]?.backend?.cronJobs?.forEach((job: any) => {
                        content += `- **${job.name}** (${job.schedule}): ${job.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 8:
                    content += `### Design System\n\n`;
                    if (filteredData[8]?.designGuidelines) {
                        const guidelines = filteredData[8].designGuidelines;
                        content += `**Colors:**\n`;
                        content += `- Primary: ${guidelines.colors.primary}\n`;
                        content += `- Secondary: ${guidelines.colors.secondary}\n`;
                        content += `- Accent: ${guidelines.colors.accent}\n`;
                        content += `- Neutral: ${guidelines.colors.neutral}\n\n`;
                        
                        content += `**Typography:**\n`;
                        content += `- Heading: ${guidelines.typography.heading}\n`;
                        content += `- Body: ${guidelines.typography.body}\n\n`;
                        
                        content += `**Style:** ${guidelines.style}\n\n`;
                        content += `**Spacing:** ${guidelines.spacing}\n\n`;
                        content += `**Icons:** ${guidelines.icons}\n\n`;
                    }
                    break;
            }
        });
        
        return content;
    };

    const generateTextExport = (filteredData: any, selectedSteps: number[]): string => {
        let content = `App Canvas Export\n`;
        content += `=================\n\n`;
        content += `Exported on: ${new Date().toLocaleString()}\n\n`;
        
        const stepNames = [
            "Refine Idea & Define Modules",
            "Define Features",
            "Detail User Actions",
            "Design Pages & User Flow",
            "Define Database Schema",
            "Plan Feature Implementation",
            "Define Backend Logic",
            "Establish Design System"
        ];
        
        selectedSteps.forEach(step => {
            content += `Step ${step}: ${stepNames[step - 1]}\n`;
            content += `${'='.repeat(20 + stepNames[step - 1].length)}\n\n`;
            
            switch (step) {
                case 1:
                    content += `Refined Idea: ${filteredData[1]?.refinedIdea}\n\n`;
                    content += `Modules:\n`;
                    filteredData[1]?.modules?.forEach((module: any) => {
                        content += `- ${module.name}: ${module.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 2:
                    content += `Features:\n`;
                    filteredData[2]?.features?.forEach((feature: any) => {
                        content += `- ${feature.name}: ${feature.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 3:
                    content += `User Actions:\n`;
                    filteredData[3]?.actions?.forEach((action: any) => {
                        content += `- ${action.name}: ${action.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 4:
                    content += `Pages:\n`;
                    filteredData[4]?.pages?.forEach((page: any) => {
                        content += `- ${page.name} (${page.layout}): ${page.description}\n`;
                        if (page.components && page.components.length > 0) {
                            content += `  Components: ${page.components.join(', ')}\n`;
                        }
                        if (page.links_to && page.links_to.length > 0) {
                            content += `  Links to: ${page.links_to.join(', ')}\n`;
                        }
                    });
                    content += `\n`;
                    break;
                case 5:
                    content += `Database Entities:\n`;
                    filteredData[5]?.database?.forEach((entity: any) => {
                        content += `- ${entity.name}\n`;
                        entity.attributes.forEach((attr: any) => {
                            content += `  - ${attr.name} (${attr.type}): ${attr.description}\n`;
                        });
                    });
                    content += `\n`;
                    break;
                case 6:
                    content += `Feature Implementation Details:\n`;
                    filteredData[6]?.featureDetails?.forEach((detail: any) => {
                        content += `- Feature ID ${detail.featureId}\n`;
                        content += `  State Management: ${detail.stateManagement}\n`;
                        content += `  Form Handling: ${detail.formHandling}\n`;
                        content += `  Authorization: ${detail.authorization}\n\n`;
                    });
                    break;
                case 7:
                    content += `Backend Logic:\n`;
                    content += `Functions:\n`;
                    filteredData[7]?.backend?.functions?.forEach((func: any) => {
                        content += `- ${func.name}: ${func.description}\n`;
                    });
                    content += `\nCron Jobs:\n`;
                    filteredData[7]?.backend?.cronJobs?.forEach((job: any) => {
                        content += `- ${job.name} (${job.schedule}): ${job.description}\n`;
                    });
                    content += `\n`;
                    break;
                case 8:
                    content += `Design System:\n`;
                    if (filteredData[8]?.designGuidelines) {
                        const guidelines = filteredData[8].designGuidelines;
                        content += `Colors:\n`;
                        content += `- Primary: ${guidelines.colors.primary}\n`;
                        content += `- Secondary: ${guidelines.colors.secondary}\n`;
                        content += `- Accent: ${guidelines.colors.accent}\n`;
                        content += `- Neutral: ${guidelines.colors.neutral}\n\n`;
                        
                        content += `Typography:\n`;
                        content += `- Heading: ${guidelines.typography.heading}\n`;
                        content += `- Body: ${guidelines.typography.body}\n\n`;
                        
                        content += `Style: ${guidelines.style}\n\n`;
                        content += `Spacing: ${guidelines.spacing}\n\n`;
                        content += `Icons: ${guidelines.icons}\n\n`;
                    }
                    break;
            }
        });
        
        return content;
    };

    // --- Derived State & Render Logic ---
    const currentStepDef = STEPS.find(s => s.id === activeStep);
    const isLastStep = activeStep > STEPS.length;
    
    const highlightedNodeIds = useMemo(() => {
        if (!searchTerm) return [];
        const ids: string[] = [];
        const term = searchTerm.toLowerCase();

        const checkAndPush = (item: {id: string, name: string}) => {
            if (item.name.toLowerCase().includes(term)) {
                ids.push(item.id);
            }
        };

        appData[1]?.modules?.forEach(checkAndPush);
        appData[2]?.features?.forEach(checkAndPush);
        appData[3]?.actions?.forEach(checkAndPush);
        appData[4]?.pages?.forEach(checkAndPush);
        appData[5]?.database?.forEach(checkAndPush);
        
        // Add feature detail nodes
        appData[6]?.featureDetails?.forEach(detail => {
             const feature = appData[2]?.features?.find(f => f.id === detail.featureId);
             if (feature && feature.name.toLowerCase().includes(term)) {
                 ids.push(feature.id, `${feature.id}-state`, `${feature.id}-form`, `${feature.id}-auth`);
             }
        });
        
        // Add backend nodes - using the correct ID format from BackendDiagram
        if (appData[7]?.backend) {
            appData[7].backend.functions.forEach((f, i) => {
                // Use the same ID format as in BackendDiagram
                const id = `func-${i}-${f.name.replace(/\s/g, '-')}`;
                if (f.name.toLowerCase().includes(term)) ids.push(id);
            });
            appData[7].backend.cronJobs.forEach((c, i) => {
                 // Use the same ID format as in BackendDiagram
                 const id = `cron-${i}-${c.name.replace(/\s/g, '-')}`;
                 if (c.name.toLowerCase().includes(term)) ids.push(id);
            });
        }
        
        return ids;
    }, [searchTerm, appData]);

    const renderDiagram = () => {
        const hasDiagram = activeStep > 0 && activeStep < 9 && !isLastStep;
        if (!hasDiagram) {
             return (
                 <div className="flex-1 p-8 overflow-auto text-center flex flex-col justify-center items-center">
                    <h2 className="text-2xl font-bold mb-4">{isLastStep ? 'Project Plan Complete!' : 'Application Canvas'}</h2>
                    <p className="max-w-md">
                        {isLastStep
                            ? "All steps have been completed. You can now review the details and export the project plan."
                            : "Use the 'Next' button to proceed through the steps of building your app plan."
                        }
                    </p>
                 </div>
            )
        }

        return (
            <div ref={diagramContainerRef} className="flex-1 w-full h-full overflow-auto relative">
                 {activeStep >= 1 && activeStep <= 3 && <MindMap appData={appData} onNodeSelect={(id) => setSelectedNodeIds([id])} selectedNodeIds={selectedNodeIds} highlightedNodeIds={highlightedNodeIds} searchTerm={searchTerm} />}
                 {activeStep === 4 && <PageDiagram appData={appData} onNodeSelect={(id) => setSelectedNodeIds([id])} selectedNodeIds={selectedNodeIds} theme={theme} highlightedNodeIds={highlightedNodeIds} searchTerm={searchTerm}/>}
                 {activeStep === 5 && <EntityDiagram appData={appData} onNodeSelect={(id) => setSelectedNodeIds([id])} selectedNodeIds={selectedNodeIds} theme={theme} highlightedNodeIds={highlightedNodeIds} searchTerm={searchTerm}/>}
                 {activeStep === 6 && <FeatureDetailDiagram appData={appData} onNodeSelect={(id) => setSelectedNodeIds([id])} selectedNodeIds={selectedNodeIds} highlightedNodeIds={highlightedNodeIds} searchTerm={searchTerm}/>}
                 {activeStep === 7 && <BackendDiagram appData={appData} onNodeSelect={(id) => setSelectedNodeIds([id])} selectedNodeIds={selectedNodeIds} highlightedNodeIds={highlightedNodeIds} searchTerm={searchTerm}/>}
                 {activeStep === 8 && <DesignSystemDiagram appData={appData} />}
            </div>
        );
    };
    
    if (!idea) {
        return (
            <>
                {isSettingsOpen && <SettingsPanel apiKey={apiKey} model={modelName} onSave={handleApiKeySave} onClose={() => setIsSettingsOpen(false)} />}
                <IdeaInput onStart={handleStart} onSettingsClick={() => setIsSettingsOpen(true)} />
            </>
        )
    }

    return (
        <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
            {isLoading && <LoadingSpinner />}
            {clarification && <ClarificationModal questions={clarification.questions} onAnswer={handleClarificationAnswer} />}
            {isSettingsOpen && <SettingsPanel apiKey={apiKey} model={modelName} onSave={handleApiKeySave} onClose={() => setIsSettingsOpen(false)} />}
            {isExportModalOpen && <ExportModal onExport={handleExport} onClose={() => setIsExportModalOpen(false)} completedSteps={completedSteps}/>}
            {feedbackMessage && (
                <div className="animate-fade-in-out fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    {feedbackMessage}
                </div>
            )}
            
            {/* Header */}
            <header className="flex-shrink-0 h-16 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between px-4 z-20">
                 <div className="flex items-center gap-4">
                     <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500">
                        App Canvas AI
                    </h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveStep(prev => prev > 1 ? (prev - 1) as StepKey : 1)} disabled={activeStep <= 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"><BackIcon /> Back</button>
                        <button onClick={handleRegenerate} disabled={!completedSteps.includes(activeStep) || isLoading} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"><RegenerateIcon /> Regenerate</button>
                    </div>
                 </div>
                 
                <div className="flex items-center gap-2">
                    {!isLastStep && (
                         <button 
                            onClick={() => setActiveStep(prev => (prev + 1) as StepKey)}
                            disabled={isLoading || !completedSteps.includes(activeStep)}
                            className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        >
                            {`Next: ${currentStepDef?.name || 'Finish'}`}
                            <NextIcon />
                        </button>
                    )}
                    <button onClick={handleSave} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Save Session"><SaveIcon /></button>
                    <button onClick={handleLoad} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Load Session"><LoadIcon /></button>
                    <button onClick={() => setIsExportModalOpen(true)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Export"><ExportIcon /></button>
                     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Toggle Theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Settings"><SettingsIcon /></button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
                    <Timeline steps={STEPS} activeStep={activeStep} completedSteps={completedSteps} />
                </aside>

                <main className="flex-1 flex flex-col bg-grid-pattern relative">
                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-lg w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-30 shadow-lg flex justify-between items-center" role="alert">
                           <div>
                               <strong className="font-bold">An error occurred:</strong>
                               <span className="block sm:inline ml-2 whitespace-pre-wrap">{error}</span>
                           </div>
                           <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                    )}
                    <div className="absolute top-2 left-2 z-10 w-64">
                       {activeStep > 0 && activeStep < 9 && <DiagramSearchBar onSearch={setSearchTerm} />}
                    </div>
                    {renderDiagram()}
                </main>

                {isInspectorOpen && (
                    <InspectorPanel 
                        selectedNodeIds={selectedNodeIds} 
                        appData={appData} 
                        activeStep={activeStep}
                        onClose={() => setIsInspectorOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default App;