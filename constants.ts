import { Type } from '@google/genai';
import type { Step, AppData } from './types';

// Helper functions to create detailed context strings from previous steps.
const getModulesContext = (data: AppData) => data[1] ? `Modules:\n${JSON.stringify(data[1].modules, null, 2)}\n` : '';
const getFeaturesContext = (data: AppData) => data[2] ? `Features:\n${JSON.stringify(data[2].features, null, 2)}\n` : '';
const getActionsContext = (data: AppData) => data[3] ? `Actions:\n${JSON.stringify(data[3].actions, null, 2)}\n` : '';
const getSchemaContext = (data: AppData) => data[5] ? `Data Schema:\n${JSON.stringify(data[5].database, null, 2)}\n` : '';

export const STEPS: Step[] = [
    {
        id: 0,
        name: 'Refine Idea',
        description: 'Clarifying the core concept.',
        prompt: (idea: string, data: AppData, context: any) => `
            Original app idea: "${idea}".
            The user clarified the primary goal is: "${context.clarificationAnswer}".
            Please rewrite the app idea into a single, refined paragraph that incorporates this goal.
            Also, identify the primary target audience based on this refined idea.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                refinedIdea: { type: Type.STRING, description: "The refined, single-paragraph app idea." },
                targetAudience: { type: Type.STRING, description: "The primary target audience for the app." }
            },
            required: ['refinedIdea', 'targetAudience'],
        },
        needsClarification: true,
        clarificationPrompt: (idea: string) => `To better understand your app idea "${idea}", which of these best describes its primary goal?`,
    },
    {
        id: 1,
        name: 'Modules & Core Concept',
        description: 'Defining the high-level structure.',
        prompt: (idea: string, data: AppData, context: any) => `
            Based on the refined app idea "${idea}", and keeping in mind the user wants to focus on "${context.clarificationAnswer}", provide a concise, one-paragraph summary of the core concept.
            Then, break down the application into logical, high-level modules that reflect this focus. For each module, provide a unique snake_case_id, a name, and a short description of its purpose. Include a "Settings" module for global application settings.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: "A one-paragraph summary of the app idea." },
                modules: {
                    type: Type.ARRAY,
                    description: "A list of high-level application modules.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique snake_case identifier for the module." },
                            name: { type: Type.STRING, description: "The user-friendly name of the module." },
                            description: { type: Type.STRING, description: "A short description of the module's purpose." },
                        },
                        required: ['id', 'name', 'description'],
                    },
                },
            },
            required: ['description', 'modules'],
        },
        needsClarification: true,
        clarificationPrompt: (idea: string) => `For the app idea "${idea}", what is the most critical area to focus on when defining the main modules?`,
    },
    {
        id: 2,
        name: 'Features per Module',
        description: 'Detailing the features for each module.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            Here are the application modules:
            ${JSON.stringify(data[1]?.modules, null, 2)}
            
            The user has indicated a preference for "${context.clarificationAnswer}". With that in mind, for each module listed above, define a set of specific features. For each feature, provide a unique snake_case_id, a name, and a description of what it does. Ensure each feature is assigned to the correct 'moduleId' by using the exact 'id' from the module list.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                features: {
                    type: Type.ARRAY,
                    description: "A list of all features for the application, categorized by module.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique snake_case identifier for the feature." },
                            moduleId: { type: Type.STRING, description: "The ID of the module this feature belongs to." },
                            name: { type: Type.STRING, description: "The user-friendly name of the feature." },
                            description: { type: Type.STRING, description: "A description of the feature's functionality." },
                        },
                        required: ['id', 'moduleId', 'name', 'description'],
                    },
                },
            },
            required: ['features'],
        },
        needsClarification: true,
        clarificationPrompt: () => `When designing features for the modules we've defined, should we prioritize simplicity and ease-of-use, or a rich, comprehensive feature set?`,
    },
    {
        id: 3,
        name: 'User Actions per Feature',
        description: 'Listing user actions for each feature.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            Here are the application's features, grouped by module:
            ${JSON.stringify(data[2]?.features, null, 2)}
            
            For each feature, define a list of specific user actions. A user action is a single, concrete task a user can perform. Focus on "${context.clarificationAnswer}" when defining the actions. Provide a unique snake_case_id, a name, and a description for each action. Assign each action to its parent feature using the correct 'featureId'.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                actions: {
                    type: Type.ARRAY,
                    description: "A list of all user actions for the application, categorized by feature.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique snake_case identifier for the action." },
                            featureId: { type: Type.STRING, description: "The ID of the feature this action belongs to." },
                            name: { type: Type.STRING, description: "The name of the user action (e.g., 'Submit Form')." },
                            description: { type: Type.STRING, description: "A description of what happens when the user performs this action." },
                        },
                        required: ['id', 'featureId', 'name', 'description'],
                    },
                },
            },
            required: ['actions'],
        },
        needsClarification: true,
        clarificationPrompt: () => `For the user actions within each feature, should the focus be on granular, step-by-step interactions or high-level, primary actions?`,
    },
    {
        id: 4,
        name: 'Application Pages',
        description: 'Defining UI pages and components.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            Modules and features:
            ${getModulesContext(data)}
            ${getFeaturesContext(data)}

            Based on the modules and features, define the primary pages or screens for the user interface. Prioritize a "${context.clarificationAnswer}" approach. For each page, specify its name, the 'moduleId' it belongs to, a brief description, a suggested layout type (e.g., 'Dashboard', 'Form'), and a list of key UI components it would contain.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                pages: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            moduleId: { type: Type.STRING },
                            description: { type: Type.STRING },
                            layout: { type: Type.STRING, description: "e.g., 'Dashboard Layout', 'Two-Column', 'Modal Dialog'" },
                            components: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., ['User Profile Card', 'Data Table', 'Search Bar']" }
                        },
                        required: ['name', 'moduleId', 'description', 'layout', 'components']
                    }
                }
            },
            required: ['pages']
        },
        needsClarification: true,
        clarificationPrompt: () => `When designing the application pages, should we prioritize a mobile-first design or a desktop/web experience?`,
    },
    {
        id: 5,
        name: 'Database Schema',
        description: 'Designing the data model.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            We have defined the following features and user actions:
            ${getFeaturesContext(data)}
            ${getActionsContext(data)}

            Based on the data requirements implied by these features, design a database schema. Design the schema with a priority on "${context.clarificationAnswer}". Define the entities (tables), their attributes (columns) with data types, relationships, constraints, and logging requirements.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                database: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The name of the data entity (e.g., 'User', 'Post')." },
                            attributes: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        type: { type: Type.STRING, description: "SQL-like data type (e.g., 'VARCHAR(255)', 'INTEGER', 'BOOLEAN', 'TIMESTAMP')." },
                                        description: { type: Type.STRING }
                                    },
                                    required: ['name', 'type', 'description']
                                }
                            },
                            relationships: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., ['has many Posts', 'belongs to a User']" },
                            constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., ['email must be unique', 'password must be hashed']" },
                            logging: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., ['log on create', 'log on update']" }
                        },
                        required: ['name', 'attributes', 'relationships', 'constraints', 'logging']
                    }
                }
            },
            required: ['database']
        },
        needsClarification: true,
        clarificationPrompt: () => `For the database schema, what is the higher priority: scalability, simplicity, or data integrity?`,
    },
    {
        id: 6,
        name: 'Feature Details',
        description: 'Fleshing out implementation details.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            Here are the features:
            ${getFeaturesContext(data)}
            And the data schema:
            ${getSchemaContext(data)}

            For each feature, provide implementation details. Favor a "${context.clarificationAnswer}" technical approach. Consider state management, form handling (validation, submission), and authorization (e.g., 'public', 'user only', 'admin only').
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                featureDetails: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            featureId: { type: Type.STRING },
                            stateManagement: { type: Type.STRING, description: "How is UI state managed for this feature?" },
                            formHandling: { type: Type.STRING, description: "How are forms and user input validated and submitted?" },
                            authorization: { type: Type.STRING, description: "What permissions are required to use this feature?" },
                        },
                        required: ['featureId', 'stateManagement', 'formHandling', 'authorization']
                    }
                }
            },
            required: ['featureDetails']
        },
        needsClarification: true,
        clarificationPrompt: () => `Regarding the implementation details for features, what technical approach should we favor?`,
    },
    {
        id: 7,
        name: 'Backend Logic',
        description: 'Defining backend functions and jobs.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            Context:
            ${getFeaturesContext(data)}
            ${getActionsContext(data)}
            ${getSchemaContext(data)}

            Based on the application's needs, define the necessary backend logic. The architecture should lean towards a "${context.clarificationAnswer}" model. This includes serverless functions or API endpoints tied to features, as well as any recurring background tasks (cron jobs).
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                backend: {
                    type: Type.OBJECT,
                    properties: {
                        functions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    featureId: { type: Type.STRING },
                                    name: { type: Type.STRING, description: "e.g., 'processUserProfileUpdate'" },
                                    description: { type: Type.STRING, description: "What does this serverless function or API endpoint do?" },
                                },
                                required: ['featureId', 'name', 'description']
                            }
                        },
                        cronJobs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    schedule: { type: Type.STRING, description: "e.g., '0 0 * * *' (daily at midnight)" },
                                    description: { type: Type.STRING, description: "What does this scheduled task do?" },
                                },
                                required: ['name', 'schedule', 'description']
                            }
                        }
                    },
                    required: ['functions', 'cronJobs']
                }
            },
            required: ['backend']
        },
        needsClarification: true,
        clarificationPrompt: () => `For the backend architecture, should we lean towards a serverless model for scalability or a more traditional monolithic API for simplicity?`,
    },
    {
        id: 8,
        name: 'Design System',
        description: 'Establishing the visual style.',
        prompt: (idea: string, data: AppData, context: any) => `
            App Idea: "${idea}".
            Target Audience: "${data[0]?.targetAudience}".
            Clarification from user: The desired aesthetic is "${context.clarificationAnswer}".
            
            Based on the app idea, target audience, and desired aesthetic, generate a set of design guidelines. This should include a color palette (primary, secondary, accent, neutral hex codes), typography choices (heading and body fonts), the overall style, a spacing system, and an icon style.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                designGuidelines: {
                    type: Type.OBJECT,
                    properties: {
                        colors: {
                            type: Type.OBJECT,
                            properties: {
                                primary: { type: Type.STRING, description: "Hex code for primary color." },
                                secondary: { type: Type.STRING, description: "Hex code for secondary color." },
                                accent: { type: Type.STRING, description: "Hex code for accent color." },
                                neutral: { type: Type.STRING, description: "Hex code for neutral/background color." }
                            },
                            required: ['primary', 'secondary', 'accent', 'neutral']
                        },
                        typography: {
                            type: Type.OBJECT,
                            properties: {
                                heading: { type: Type.STRING, description: "Font family for headings." },
                                body: { type: Type.STRING, description: "Font family for body text." }
                            },
                            required: ['heading', 'body']
                        },
                        style: { type: Type.STRING, description: "Overall aesthetic (e.g., 'Minimalist', 'Playful', 'Corporate')." },
                        spacing: { type: Type.STRING, description: "Spacing system (e.g., '8-point grid system')." },
                        icons: { type: Type.STRING, description: "Icon style (e.g., 'Line icons', 'Solid icons')." }
                    },
                    required: ['colors', 'typography', 'style', 'spacing', 'icons']
                }
            },
            required: ['designGuidelines']
        },
        needsClarification: true,
        clarificationPrompt: (idea: string, data: AppData) => `What kind of visual style or aesthetic are you imagining for "${data[0]?.refinedIdea || idea}"?`,
    },
];