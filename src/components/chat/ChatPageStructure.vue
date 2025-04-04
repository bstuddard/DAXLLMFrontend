<template>
    <div class="min-h-[calc(100vh-5rem)] flex flex-col max-w-3xl w-full">
        <!-- Clear All Button -->
        <div class="flex justify-end px-2 sm:px-6 py-2">
            <button 
                @click="handleClearAll"
                class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors rounded-md border border-gray-800 hover:border-gray-700 cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Reset Chat</span>
            </button>
        </div>

        <!-- Chat Messages Container -->
        <div class="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4 scroll-smooth">

            <!-- Displaying messages -->
            <div v-if="messages.length" class="space-y-4">
                <div v-for="(message, index) in messages" 
                    :key="index" 
                    class="flex items-start gap-3"
                    :class="{
                        'flex-row-reverse': message.role === 'user'
                    }"
                    :id="index === messages.length - 1 ? 'lastMessage' : `message-${message.role}-${index}`"
                >
                    <!-- Icon for the message -->
                    <div :class="{
                        'bg-blue-500 p-2 rounded-full': message.role === 'user',
                        'bg-gray-700 p-2 rounded-full': message.role !== 'user'
                    }">
                        <svg v-if="message.role === 'user'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <!-- Message content -->
                    <div :class="{
                        'bg-gray-800 p-3 sm:p-4 rounded-xl max-w-[85%] sm:max-w-[80%]': message.role === 'user',
                        'bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-800 max-w-[85%] sm:max-w-[80%] relative': message.role !== 'user'
                    }">
                        <article class="prose prose-invert prose-pre:bg-transparent text-gray-50 list-disc marker:text-gray-50" v-html="renderMarkdown(message.message)"></article>
                        <!-- Confidence Score (only shown for the last AI message) -->
                        <div v-if="message.role === 'assistant' && index === messages.length - 1 && confidenceScore" class="pb-5">
                            <div class="absolute bottom-2 right-2 text-xs bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-700/50 shadow-sm"
                                :class="{
                                    'text-green-400': parseFloat(confidenceScore) > 6,
                                    'text-gray-400': parseFloat(confidenceScore) <= 6
                                }">
                                Confidence: {{ confidenceScore }}/10
                            </div>
                        </div>
                    </div>
                </div>
                <!-- This section handles the display of the AI's response if it is streaming -->
                <div v-if="isStreaming" class="flex items-start gap-3">
                    <div class="bg-gray-700 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-50 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 max-w-[80%]">
                        <article class="prose prose-invert prose-pre:bg-transparent text-gray-50 list-disc marker:text-gray-50">
                            {{ streamData || 'Thinking...' }}
                        </article>
                    </div>
                </div>
            </div>
            <div v-else>
                <!-- Watermark and instructions (only if messages empty) -->
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
                    <p class="text-6xl text-gray-100 opacity-10 font-bold select-none">
                        DAX AI
                    </p>
                    <div class="flex flex-col items-center gap-2 pointer-events-auto">
                        <p class="text-gray-100 text-lg select-none">
                            Upload a PBIT file and get help with your DAX code!
                        </p>
                        <button 
                            @click="showPbitInfo = !showPbitInfo"
                            class="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>What is a PBIT file?</span>
                        </button>
                        
                        <!-- PBIT Info Panel -->
                        <div v-if="showPbitInfo" class="mt-4 bg-gray-800 p-6 rounded-xl max-w-lg text-left border border-gray-700">
                            <h3 class="text-gray-100 font-semibold mb-3">About PBIT Files</h3>
                            <div class="space-y-3 text-sm text-gray-300">
                                <p>A PBIT (Power BI Template) file contains your Power BI report's structure, including:</p>
                                <ul class="list-disc pl-4 space-y-1">
                                    <li>Table relationships</li>
                                    <li>Column names and data types</li>
                                    <li>Measures and calculated columns</li>
                                </ul>
                                <p class="pt-2">To create a PBIT file:</p>
                                <ol class="list-decimal pl-4 space-y-1">
                                    <li>Open your PBIX file in Power BI Desktop</li>
                                    <li>Go to File → Export → Power BI Template</li>
                                    <li>Save the PBIT file</li>
                                    <li>Upload it below to get better DAX suggestions</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!--Display errors, if any-->
            <div v-if="streamError" class="p-4 rounded-xl bg-red-300 text-red-900">
                <p class="font-semibold italic">Error occurred during AI conversation</p>
                <p>{{ streamError }}</p>
            </div>

        </div>

        <!-- Input Box -->
        <div class="px-2 sm:px-6 pb-6 sticky bottom-0 bg-gray-950">            

            <!-- Input Box -->
            <div class="flex items-center gap-2 bg-gray-900 rounded-2xl shadow-xl p-2 focus-within:ring-2 focus-within:ring-gray-300">
                <textarea
                    v-model="userInput"
                    type="text"
                    :placeholder="isStreaming ? 'Waiting for response...' : 'Ask a question'" 
                    class="flex-1 px-2 pt-1 pb-4 rounded-2xl resize-none focus:outline-none text-gray-50 disabled:text-gray-400"
                    @keydown.enter.prevent="handleSendMessage"
                    :disabled="isStreaming"
                ></textarea>
                <button 
                    @click="handleSendMessage"
                    class="button bg-gray-50 text-gray-950 font-semibold mx-2 py-2 px-4 shadow-md rounded-md cursor-pointer sm:hover:bg-gray-200 sm:transition disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isStreaming || !userInput.trim()"
                >
                    {{ isStreaming ? 'Processing...' : 'Send' }}
                </button>
            </div>
            <div class="flex items-center justify-center p-1">
                <p class="text-sm text-gray-100 font-light">{{ isStreaming ? 'AI is thinking...' : 'Mistakes can be made, check important info.' }}</p>
            </div>

            <!-- File Upload -->
            <div class="mb-4">
                <div class="flex items-center justify-end gap-4">
                    <div class="flex-1">
                        <div class="flex items-center">
                            <div v-if="selectedFileName" class="flex items-center gap-2 text-sm text-gray-400">
                                <span>Using PBIT file:</span>
                                <span class="font-medium">{{ selectedFileName }}</span>
                                <button class="relative flex items-center" type="button">
                                    <span class="sr-only">Replace file</span>
                                    <span class="text-blue-400 hover:text-blue-300 transition-colors" :class="{ 'opacity-50': isStreaming || isProcessing }">
                                        Replace
                                    </span>
                                    <input 
                                        type="file" 
                                        @change="handleFileUpload" 
                                        accept=".pbit"
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                                        :disabled="isStreaming || isProcessing"
                                    />
                                </button>
                            </div>
                            <div v-else class="flex items-center w-full">
                                <div class="flex-1 px-3 py-2 bg-gray-800 border border-r-0 border-gray-700 rounded-l-full text-sm text-gray-300 truncate">
                                    <div v-if="isProcessing">
                                        <span class="inline-block animate-pulse">Processing file...</span>
                                    </div>
                                    <div v-else>
                                        No file selected
                                    </div>
                                </div>
                                <button class="relative flex items-center" type="button">
                                    <span class="sr-only">Choose file</span>
                                    <span class="rounded-r-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors border border-blue-700" 
                                        :class="{ 'opacity-50': isStreaming || isProcessing }">
                                        Choose PBIT File
                                    </span>
                                    <input 
                                        type="file" 
                                        @change="handleFileUpload" 
                                        accept=".pbit"
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                                        :disabled="isStreaming || isProcessing"
                                    />
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col items-end mt-1 space-y-0.5">
                            <p v-if="fileError" class="text-xs text-red-400">{{ fileError }}</p>
                            <template v-else-if="!selectedFileName">
                                <p class="text-xs text-gray-400">Uploading a PBIT file can improve the generated DAX code</p>
                                <p class="text-xs text-gray-400">To export PBIX as PBIT: File → Export → Power BI Template. Save and upload this file.</p>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Library
import { ref } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import { devlog } from '@/devlogger/devlogger';

// Types
import type { Ref } from 'vue';
import type { StreamingParsedResponse } from '@/composables/useStreamingAPI';
import type { ChatMessage, ChatInputPayload } from '@/types/chatTypes';

// Local file
import useStreamingAPI from '@/composables/useStreamingAPI';
import daxHighlighter from './helpers/DaxHighlighter';
hljs.registerLanguage('dax', daxHighlighter);
import usePowerBIParser from '@/composables/usePowerBIParser';
import useAPI from '@/composables/useStandardAPI';

const { fetchStream, streamData, isStreaming, streamError } = useStreamingAPI();
const { parsePowerBIFile, tables, relationships, isProcessing } = usePowerBIParser();
const { fetchResult } = useAPI();
const userInput: Ref<string> = ref('');
const messages: Ref<ChatMessage[]> = ref([]);
const selectedFileName: Ref<string> = ref('');
const fileError: Ref<string> = ref('');
const showPbitInfo = ref(false);
const confidenceScore: Ref<string> = ref('');

/**
 * Formats the PowerBI metadata into a readable string format
 */
function formatPowerBIMetadata(): string {
    if (!tables.value.length) return '';

    let result = '\n\nKeep in mind my data structure is as follows, via the PBIT file I uploaded:\n\n';
    
    // Add tables and columns
    result += '## Tables and Columns\n';
    tables.value.forEach(table => {
        result += `\n### ${table.name}\n`;
        table.columns.forEach(column => {
            result += `- ${column}\n`;
        });
    });

    // Add relationships if they exist
    if (relationships.value.length) {
        result += '\n## Relationships\n';
        relationships.value.forEach(rel => {
            result += `- ${rel.fromTable}[${rel.fromColumn}] ${rel.fromCardinality} to ${rel.toCardinality} ${rel.toTable}[${rel.toColumn}]\n`;
        });
    }

    return result;
}

/**
 * Copies the text content to clipboard and shows feedback
 */
function copyToClipboard(button: HTMLButtonElement, text: string) {
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
        `;
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

/**
 * Renders the markdown content and applies syntax highlighting to the code blocks.
 * 
 * This function:
 * 1. Sanitizes the content to remove any potential malicious code.
 * 2. Creates a temporary div element and sets its innerHTML to the sanitized content.
 * 3. Applies syntax highlighting to each code block in the content.
 * 4. Adds copy button to each code block.
 * 
 * @param content - The markdown content to be rendered.
 * @returns The innerHTML of the temporary div element.
 */
function renderMarkdown(content: string): string {
    const rawHtml = marked(content) as string;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHtml;

    // Apply syntax highlighting and add copy button to each code block
    tempDiv.querySelectorAll('pre code').forEach((block) => {
        const pre = block.parentElement;
        if (!pre) return;

        // Create wrapper for the code block
        const wrapper = document.createElement('div');
        wrapper.className = 'relative';
        
        pre.insertAdjacentElement('beforebegin', wrapper);
        wrapper.appendChild(pre);

        // Add copy button with unique identifier
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn absolute top-2 right-2 p-1.5 rounded bg-gray-700/50 hover:bg-gray-700/80 transition-colors';
        copyButton.setAttribute('type', 'button');
        copyButton.setAttribute('data-code', block.textContent || '');
        copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        `;

        wrapper.appendChild(copyButton);

        // Apply syntax highlighting
        hljs.highlightElement(block as HTMLElement);
    });

    // Add global event listener for copy buttons
    setTimeout(() => {
        document.querySelectorAll('.copy-code-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // @ts-expect-error - 'this' context is correctly bound to HTMLButtonElement in event listener
                const code = this.getAttribute('data-code') || '';
                // @ts-expect-error - 'this' context is correctly bound to HTMLButtonElement in event listener
                copyToClipboard(this as HTMLButtonElement, code.trim());
            });
        });
    }, 0);

    return tempDiv.innerHTML;
}

/**
 * Checks if a message contains DAX code blocks
 */
function containsDaxCode(message: string): boolean {
    return message.includes('```dax') || message.includes('```DAX') || message.includes('```CALCULALATE(');
}

/**
 * Gets the confidence score for the user's message.
 * Only called when DAX code is present in the message.
 * 
 * @returns void
 */
async function getConfidence() {
    // Create a copy of messages for the API call
    const apiMessages = messages.value.map((msg, index) => {
        if (index === 0) {
            return {
                ...msg,
                message: msg.message + formatPowerBIMetadata()
            };
        }
        return msg;
    });

    const chatInputPayload: ChatInputPayload = { chat_input_list: apiMessages };
    const response = await fetchResult('confidence', chatInputPayload);
    if (response.successful) {
        confidenceScore.value = response.data.score as string;
    } else {
        confidenceScore.value = ''; // Clear the confidence score on error
    }
}

/**
 * Handles sending a message from the user and processing the AI response.
 * 
 * This function:
 * 1. Checks if the user input is not empty.
 * 2. Adds the user's message to the messages queue.
 * 3. Sends the combined message queue to the AI for processing.
 * 4. Appends the AI's response to the messages queue if successful.
 * 5. Resets the user input field.
 * 
 * @returns void
 */
async function handleSendMessage() {
    if (userInput.value.trim()) {
        
        // Add to combined queue
        messages.value.push({role: "user", message: userInput.value});
        confidenceScore.value = ''; // Clear confidence score when user sends a new message
        setTimeout(() => document.getElementById('lastMessage')?.scrollIntoView({ behavior: 'smooth' }), 0);
        
        // Clear input field immediately
        userInput.value = '';

        // Create a copy of messages for the API call
        const apiMessages = messages.value.map((msg, index) => {
            if (index === 0) {
                return {
                    ...msg,
                    message: msg.message + formatPowerBIMetadata()
                };
            }
            return msg;
        });

        // Log the message payload before sending
        devlog({ 
            message: 'Sending message to AI',
            payload: { chat_input_list: apiMessages }
        });

        // Get AI Response
        const chatInputPayload: ChatInputPayload = { chat_input_list: apiMessages };
        const response: StreamingParsedResponse = await fetchStream(chatInputPayload);

        // Append AI response once the stream is finished
        if (response.successful) {
            messages.value.push({role: 'assistant', message: streamData.value});
            // Only get confidence if the message contains DAX code
            if (containsDaxCode(streamData.value)) {
                getConfidence();
            } else {
                confidenceScore.value = ''; // Clear any previous confidence score
            }
        }
    }
}

/**
 * Handles the file upload event.
 * 
 */
async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    fileError.value = '';
    
    if (file) {
        selectedFileName.value = file.name;
        const result = await parsePowerBIFile(file);
        
        if (!result.successful) {
            fileError.value = result.error || 'Failed to parse PowerBI file';
            selectedFileName.value = '';
        }
    } else {
        selectedFileName.value = '';
    }
    
    // Clear the input for future uploads
    input.value = '';
}

/**
 * Handles clearing all data
 */
function handleClearAll() {
    userInput.value = '';
    selectedFileName.value = '';
    fileError.value = '';
    messages.value = [];
}

</script>

<style>
/* Add these styles to handle the copy button positioning */
.prose pre {
    position: relative;
}
</style>