import { Type } from '@google/genai';
import { Step } from './types';

// FIX: Added AVAILABLE_MODELS export.
export const AVAILABLE_MODELS = [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
];

export const STEPS: Step[] = [
    // Step 0 is the initial idea input, not part of this array
    {
        id: 1,
        name: "Refine Idea & Define Modules",
        description: "AI refines the initial idea and breaks it down into high-level modules.",
        prompt: (idea, data) => `
            You are an expert software architect. Your task is to analyze an application idea and structure it.
            Initial Idea: "${idea}"
            
            1.  Refine the initial idea into a clear, concise, and compelling concept.
            2.  Break down the refined idea into high-level, logical modules. Each module should represent a major functional area of the application.
            
            Provide the output in the specified JSON format.
            -   'id' for modules should be in snake_case.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                refinedIdea: { type: Type.STRING, description: 'A clear, concise, and compelling version of the initial app idea.' },
                modules: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: 'Unique identifier for the module (e.g., user_management).' },
                            name: { type: Type.STRING, description: 'The name of the module (e.g., User Management).' },
                            description: { type: Type.STRING, description: 'A brief description of what this module covers.' }
                        },
                        required: ['id', 'name', 'description']
                    }
                }
            },
            required: ['refinedIdea', 'modules']
        },
        needsClarification: true,
        clarificationPrompt: (idea) => `To better define the application's core, what is the primary goal for users of this app: "${idea}"?`
    },
    {
        id: 2,
        name: "Define Features",
        description: "Identify the key features within each module.",
        prompt: (idea, data) => `
            Based on the refined idea and modules for the application, define the key features for each module.
            Refined Idea: "${data[1]?.refinedIdea}"
            Modules:
            ${data[1]?.modules.map(m => `- ${m.name}: ${m.description}`).join('\n')}

            For each module, list the essential features. Each feature should be a distinct piece of functionality.
            Provide the output in the specified JSON format.
            -   'id' for features should be in snake_case.
            -   Ensure 'moduleId' correctly matches one of the provided module IDs.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                features: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: 'Unique identifier for the feature (e.g., user_login).' },
                            moduleId: { type: Type.STRING, description: 'The ID of the parent module.' },
                            name: { type: Type.STRING, description: 'The name of the feature (e.g., User Login).' },
                            description: { type: Type.STRING, description: 'A brief description of the feature.' }
                        },
                        required: ['id', 'moduleId', 'name', 'description']
                    }
                }
            },
            required: ['features']
        },
        clarificationPrompt: (idea, data) => `Considering the features for "${data[1]?.refinedIdea}", are there any specific integrations with third-party services (like social media login, payment gateways, etc.) that are essential?`
    },
    {
        id: 3,
        name: "Detail User Actions",
        description: "Break down each feature into specific user actions.",
        prompt: (idea, data) => `
            For each feature defined, break it down into specific, atomic user actions. An action is a single thing a user can *do*.
            Features:
            ${data[2]?.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

            Provide the output in the specified JSON format.
            -   'id' for actions should be in snake_case.
            -   Ensure 'featureId' correctly matches one of the provided feature IDs.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                actions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: 'Unique identifier for the action (e.g., click_login_button).' },
                            featureId: { type: Type.STRING, description: 'The ID of the parent feature.' },
                            name: { type: Type.STRING, description: 'The name of the action (e.g., Click Login Button).' },
                            description: { type: Type.STRING, description: 'A brief description of what the action does.' }
                        },
                        required: ['id', 'featureId', 'name', 'description']
                    }
                }
            },
            required: ['actions']
        },
        clarificationPrompt: () => `Are there different user roles with different permissions (e.g., admin, user, moderator)?`
    },
    {
        id: 4,
        name: "Design Pages & User Flow",
        description: "Outline the application's pages and how they connect.",
        prompt: (idea, data) => `
            Based on the modules and features, design the necessary pages (or screens) for the application.
            Modules: ${JSON.stringify(data[1]?.modules)}
            Features: ${JSON.stringify(data[2]?.features)}

            For each page, define its purpose, the main components it would contain, and which other pages it links to.
            Provide the output in the specified JSON format.
            -   'id' for pages should be in snake_case.
            -   'links_to' should contain the IDs of other pages.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                pages: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: 'Unique identifier for the page (e.g., login_page).' },
                            name: { type: Type.STRING, description: 'The name of the page (e.g., Login Page).' },
                            moduleId: { type: Type.STRING, description: 'The ID of the primary module this page belongs to.' },
                            description: { type: Type.STRING, description: 'The purpose of this page.' },
                            layout: { type: Type.STRING, description: 'A suggested layout type (e.g., "Dashboard with Sidebar", "Centered Form", "Grid View").' },
                            components: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of key UI components on this page (e.g., "Login Form", "User Profile Header").' },
                            links_to: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of page IDs that this page links to.' },
                        },
                        required: ['id', 'name', 'moduleId', 'description', 'layout', 'components', 'links_to']
                    }
                }
            },
            required: ['pages']
        },
        clarificationPrompt: () => `Is this primarily a mobile app, a desktop web app, or both?`
    },
    {
        id: 5,
        name: "Define Database Schema",
        description: "Design the data models, attributes, and relationships.",
        prompt: (idea, data) => `
            Based on the application's features and pages, design the database schema.
            Features: ${JSON.stringify(data[2]?.features)}
            Pages: ${JSON.stringify(data[4]?.pages)}

            Define the necessary data entities, their attributes (with types), and the relationships between them.
            Also, consider any constraints or logging requirements.
            Provide the output in the specified JSON format.
            - 'id' for entities should be in PascalCase (e.g., UserProfile).
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                database: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: 'Unique identifier for the entity, in PascalCase (e.g., UserProfile).' },
                            name: { type: Type.STRING, description: 'The name of the entity.' },
                            attributes: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: 'Attribute name (e.g., userName).' },
                                        type: { type: Type.STRING, description: 'Data type (e.g., String, Int, DateTime, Boolean).' },
                                        description: { type: Type.STRING, description: 'Description of the attribute.' },
                                    },
                                    required: ['name', 'type', 'description']
                                }
                            },
                            relationships: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        targetEntityId: { type: Type.STRING, description: 'The ID of the entity this one relates to.' },
                                        type: { type: Type.STRING, description: 'Type of relationship (e.g., One-to-Many, Many-to-One, One-to-One).' },
                                        description: { type: Type.STRING, description: 'Description of the relationship.' },
                                    },
                                    required: ['targetEntityId', 'type', 'description']
                                }
                            },
                            constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Data constraints (e.g., "email must be unique").' },
                            logging: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Logging requirements (e.g., "log on create", "log on update").' },
                        },
                        required: ['id', 'name', 'attributes', 'relationships', 'constraints', 'logging']
                    }
                }
            },
            required: ['database']
        },
        clarificationPrompt: () => `What level of data persistence and security is required? Does it need to comply with regulations like GDPR or HIPAA?`
    },
    {
        id: 6,
        name: "Plan Feature Implementation",
        description: "Detail technical aspects for each feature.",
        prompt: (idea, data) => `
            For each key feature, provide a high-level technical implementation plan.
            Features: ${JSON.stringify(data[2]?.features)}

            Consider state management, form handling, and authorization logic for each feature.
            Provide the output in the specified JSON format.
        `,
        schema: {
            type: Type.OBJECT,
            properties: {
                featureDetails: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            featureId: { type: Type.STRING, description: 'The ID of the feature being detailed.' },
                            stateManagement: { type: Type.STRING, description: 'How to manage state for this feature (e.g., "Local component state for form inputs, global state for user data").' },
                            formHandling: { type: Type.STRING, description: 'How to handle forms and validation (e.g., "Use a library like Formik, with Yup for validation").' },
                            authorization: { type: Type.STRING, description: 'Authorization rules (e.g., "Only authenticated users can access. Admins have full CRUD.").' },
                        },
                        required: ['featureId', 'stateManagement', 'formHandling', 'authorization']
                    }
                }
            },
            required: ['featureDetails']
        },
        clarificationPrompt: () => `What is the preferred technology stack for the frontend (e.g., React, Vue, Angular)?`
    },
    {
        id: 7,
        name: "Define Backend Logic",
        description: "Outline backend functions and cron jobs.",
        prompt: (idea, data) => `
            Based on the features and data models, define the necessary backend API endpoints/functions and any required scheduled tasks (cron jobs).
            Features: ${JSON.stringify(data[2]?.features)}
            Database Entities: ${JSON.stringify(data[5]?.database.map(e => e.id))}

            Provide the output in the specified JSON format.
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
                                    featureId: { type: Type.STRING, description: 'The ID of the feature this function supports.' },
                                    name: { type: Type.STRING, description: 'The name of the function (e.g., "createUser").' },
                                    description: { type: Type.STRING, description: 'What this function does, its inputs, and what it returns.' },
                                },
                                required: ['featureId', 'name', 'description']
                            }
                        },
                        cronJobs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: 'The name of the cron job.' },
                                    schedule: { type: Type.STRING, description: 'The schedule in cron format (e.g., "0 0 * * *").' },
                                    description: { type: Type.STRING, description: 'What this job does.' },
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
        clarificationPrompt: () => `What is the preferred technology stack for the backend (e.g., Node.js, Python, serverless)?`
    },
    {
        id: 8,
        name: "Establish Design System",
        description: "Define colors, typography, and style guidelines.",
        prompt: (idea, data) => `
            To ensure a consistent user experience, create a basic design system for the application.
            Refined Idea: "${data[1]?.refinedIdea}"
            
            Suggest a color palette, typography rules, general style, and guidelines for spacing and icons.
            Provide the output in the specified JSON format.
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
                                primary: { type: Type.STRING, description: "Primary color hex code (e.g., #FF6600)." },
                                secondary: { type: Type.STRING, description: "Secondary color hex code." },
                                accent: { type: Type.STRING, description: "Accent color hex code." },
                                neutral: { type: Type.STRING, description: "Neutral/background color hex code." },
                            },
                            required: ['primary', 'secondary', 'accent', 'neutral']
                        },
                        typography: {
                            type: Type.OBJECT,
                            properties: {
                                heading: { type: Type.STRING, description: "Font family for headings (e.g., 'Inter')." },
                                body: { type: Type.STRING, description: "Font family for body text." },
                            },
                             required: ['heading', 'body']
                        },
                        style: { type: Type.STRING, description: "Overall style guide (e.g., 'Modern and minimalist with rounded corners')." },
                        spacing: { type: Type.STRING, description: "Spacing system (e.g., '4-point grid system')." },
                        icons: { type: Type.STRING, description: "Icon style (e.g., 'Feather Icons, outlined style')." },
                    },
                    required: ['colors', 'typography', 'style', 'spacing', 'icons']
                }
            },
            required: ['designGuidelines']
        },
        clarificationPrompt: () => `What is the target audience and desired brand personality (e.g., playful, professional, minimalist)?`
    },
];
