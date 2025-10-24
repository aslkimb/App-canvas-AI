
import { GoogleGenAI, Type } from '@google/genai';
import type { Clarification } from '../types';

// A simple in-memory cache to avoid re-fetching the same data
const cache = new Map<string, any>();

async function callGeminiAPI<T>(apiKey: string, prompt: string, schema?: any): Promise<T> {
    const cacheKey = JSON.stringify({ prompt, schema });
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey) as T;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // The response from the API is a promise that resolves with a `GenerateContentResponse` object.
    // The `text` property of this object contains the raw text response.
    // If a schema is provided, the API is instructed to format this text as a JSON string.
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: schema ? 'application/json' : undefined,
            responseSchema: schema,
            temperature: 0.7,
        },
    });

    try {
        const textResponse = result.text.trim();
        // We must parse the text response to get the actual JSON object.
        const jsonResponse = JSON.parse(textResponse);
        cache.set(cacheKey, jsonResponse);
        return jsonResponse as T;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", result.text);
        throw new Error("Received an invalid response from the AI model.");
    }
}


export const generateContent = async <T,>(apiKey: string, prompt: string, schema?: any): Promise<T> => {
    return callGeminiAPI<T>(apiKey, prompt, schema);
};

export const generateClarifyingQuestion = async (apiKey: string, prompt:string): Promise<Clarification> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['question', 'options'],
    };
    // FIX: The schema enforces the JSON output format, so we don't need to
    // explicitly ask for JSON in the prompt.
    return callGeminiAPI<Clarification>(apiKey, prompt, schema);
};
