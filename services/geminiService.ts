import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface GenerateParams {
    apiKey: string;
    modelName: string;
    prompt: string;
    schema?: any;
    type: 'generation' | 'clarification';
    cacheKey?: string;
    forceRefetch?: boolean;
}

const cache: Record<string, any> = {};

function parseApiError(error: any): string {
    console.error("Original API Error:", error); 

    let friendlyMessage = "An unexpected error occurred with the AI service. Please try again. If the problem persists, check your API key and network connection.";

    if (error && error.message) {
        const message = error.message.toLowerCase();

        if (message.includes('quota') || message.includes('resource_exhausted') || message.includes('429')) {
            friendlyMessage = "You've exceeded your current API quota. Please check your plan and billing details with Google AI Studio.";
        }
        else if (message.includes('api key not valid') || message.includes('permission denied') || message.includes('401') || message.includes('403')) {
            friendlyMessage = "Your API Key is invalid or missing permissions. Please verify your key in the Settings panel.";
        }
        else if (message.includes('invalid argument') || message.includes('400')) {
             friendlyMessage = "The request to the AI was invalid. This might be due to a problem with the prompt or a temporary model issue. Please try regenerating the step.";
        }
        else if (message.includes('safety')) {
            friendlyMessage = "The response was blocked due to safety settings. Please modify your input or try a different approach.";
        }
        else if (message.includes('failed to fetch') || message.includes('network')) {
             friendlyMessage = "A network error occurred. Please check your internet connection and try again.";
        }
    }
    
    return friendlyMessage;
}

function isRetryableError(error: any): boolean {
    if (error && error.message) {
        const message = error.message.toLowerCase();
        // Rate limits, network errors, and generic server errors (5xx) are often transient.
        if (
            message.includes('quota') ||
            message.includes('resource_exhausted') ||
            message.includes('429') ||
            message.includes('failed to fetch') ||
            message.includes('network') ||
            message.includes('500') ||
            message.includes('503') ||
            message.includes('service unavailable')
        ) {
            return true;
        }
    }
    return false;
}


export async function generate(params: GenerateParams): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: params.apiKey || process.env.API_KEY! });
    const MAX_RETRIES = 3;

    if (params.type === 'clarification') {
        const fullPrompt = `
        You are a helpful assistant. A user is planning an application and needs to answer a clarifying question.
        Based on the following question, generate 3-5 plausible and distinct multiple-choice options.
        Do not repeat the question in your response.
        Question: "${params.prompt}"

        Return ONLY a JSON object with a "question" key (the original question) and an "options" key (an array of strings).
        Example format: {"question": "Is this a mobile app or a web app?", "options": ["Mobile App", "Web App", "Both Mobile and Web"]}
    `;
    
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: fullPrompt,
                    config: {
                        responseMimeType: 'application/json',
                    }
                });

                const text = response.text;
                try {
                    return JSON.parse(text); // Success
                } catch (jsonError) {
                     throw new Error("The AI's response for the clarification question was not in the expected format. Please try again.");
                }
            } catch (error) {
                if (attempt === MAX_RETRIES || !isRetryableError(error)) {
                    throw new Error(parseApiError(error));
                }
                console.warn(`Attempt ${attempt} failed. Retrying in ${attempt}s...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    // type === 'generation'
    if (params.cacheKey && !params.forceRefetch && cache[params.cacheKey]) {
        return cache[params.cacheKey];
    }
    
     for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: params.modelName,
                contents: params.prompt,
                config: {
                    responseMimeType: params.schema ? 'application/json' : 'text/plain',
                    responseSchema: params.schema,
                    temperature: 0.5,
                    topP: 0.95,
                    topK: 64,
                },
            });

            const text = response.text;

            if (params.schema) {
                try {
                    const result = JSON.parse(text);
                    if (params.cacheKey) {
                        cache[params.cacheKey] = result;
                    }
                    return result;
                } catch (jsonError) {
                    throw new Error("The AI returned a response that wasn't in the expected JSON format. This can be a temporary issue. Please try regenerating the step.");
                }
            }
            
            if (params.cacheKey) {
                cache[params.cacheKey] = text;
            }
            return text;
        } catch (error) {
            if (attempt === MAX_RETRIES || !isRetryableError(error)) {
                throw new Error(parseApiError(error));
            }
            console.warn(`Attempt ${attempt} failed. Retrying in ${attempt}s...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    
    // This should not be reachable if the loop logic is correct.
    throw new Error("API call failed after multiple retries.");
}