import { GoogleGenAI } from '@google/genai';

/**
 * Service for interacting with Google Gemini API
 * Using the new unified SDK (@google/genai)
 */
export class GeminiService {
    private genAI: GoogleGenAI;

    constructor(apiKey: string) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('Gemini API key is required');
        }

        this.genAI = new GoogleGenAI({ apiKey });
    }

    /**
     * Generate content based on a prompt
     */
    async generate(prompt: string): Promise<string> {
        try {
            // Using Gemini 2.0 Flash - fastest and most cost-effective
            // Alternative: 'gemini-2.0-flash-exp' or 'gemini-2.5-flash'
            const response = await this.genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
            });

            // response.text is a string, not undefined
            return response.text || '';
        } catch (error: any) {
            // Handle specific Gemini errors
            if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
                throw new Error('Invalid Gemini API key. Get one at: https://aistudio.google.com/apikey');
            } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('Gemini API quota exceeded. Please try again later.');
            } else if (error.message?.includes('blocked') || error.message?.includes('SAFETY')) {
                throw new Error('Content was blocked by Gemini safety filters.');
            } else {
                throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
            }
        }
    }

    /**
     * Generate content with retry logic
     */
    async generateWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
        let lastError: Error | undefined;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this.generate(prompt);
            } catch (error: any) {
                lastError = error;

                // Don't retry for authentication errors
                if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                }
            }
        }

        throw lastError || new Error('Failed to generate content after retries');
    }
}
