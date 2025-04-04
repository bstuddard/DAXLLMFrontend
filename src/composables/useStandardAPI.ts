// Library
import { ref } from 'vue';

// Types
import type { Ref } from 'vue';
import type { ChatInputPayload } from '@/types/chatTypes';

// Local Files
import { devlog } from '@/devlogger/devlogger';

// Base URL setup based on env
const baseURL: string = process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:8000' : 'http://localhost:8000';

// Parsed response interface
interface ParsedResponse {
    successful: boolean;
    status: number;
    data: Record<string, unknown>;
    error?: string;
}

export type { ParsedResponse };
export default function useAPI() {
    const isLoading: Ref<boolean> = ref(false); // Loading state

    /**
     * Fetch a response from the API
     * @param endpoint The API endpoint to call
     * @param chatInputPayload The payload to send to the API
     */
    async function fetchResult(endpoint: string, chatInputPayload: ChatInputPayload): Promise<ParsedResponse> {
        try {
            isLoading.value = true;

            const response = await fetch(`${baseURL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatInputPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const dataResult = await response.json();
            devlog(`Received response: ${JSON.stringify(dataResult)}`);
            
            isLoading.value = false;
            return { successful: true, status: response.status, data: dataResult };

        } catch (error: unknown) {
            isLoading.value = false;
            const errorMessage = error instanceof Error ? error.message : "An unknown error has occurred.";
            
            return { 
                successful: false, 
                status: 500,
                data: {}, 
                error: errorMessage 
            };
        }
    }
    
    return {
        fetchResult,
        isLoading
    }
}