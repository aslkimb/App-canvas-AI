
export type StepKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Step {
    id: StepKey;
    name: string;
    description: string;
    prompt: (idea: string, data: AppData, context?: any) => string;
    schema?: any; // Add schema for structured output
    needsClarification?: boolean;
    clarificationPrompt: (idea: string, data: AppData) => string;
}

export interface Module {
    id: string;
    name: string;
    description: string;
}

export interface Feature {
    id: string;
    moduleId: string;
    name: string;
    description: string;
}

export interface Action {
    id: string;
    featureId: string;
    name: string;
    description: string;
}

export interface Page {
    name: string;
    moduleId: string;
    description: string;
    layout: string;
    components: string[];
}

export interface Entity {
    name: string;
    attributes: { name: string; type: string; description: string }[];
    relationships: string[];
    constraints: string[];
    logging: string[];
}

export interface FeatureDetail {
    featureId: string;
    stateManagement: string;
    formHandling: string;
    authorization: string;
}

export interface BackendFunction {
    featureId: string;
    name: string;
    description: string;
}

export interface CronJob {
    name: string;
    schedule: string;
    description: string;
}

export interface DesignGuidelines {
    colors: { primary: string; secondary: string; accent: string; neutral: string };
    typography: { heading: string; body: string; };
    style: string;
    spacing: string;
    icons: string;
}


// A flexible container for data from all steps
export interface AppData {
    [key: number]: any;
    1?: { description: string; modules: Module[] };
    2?: { features: Feature[] };
    3?: { actions: Action[] };
    4?: { pages: Page[] };
    5?: { database: Entity[] };
    6?: { featureDetails: FeatureDetail[] };
    7?: { backend: { functions: BackendFunction[], cronJobs: CronJob[] } };
    8?: { designGuidelines: DesignGuidelines };
}

export interface Clarification {
    question: string;
    options: string[];
}