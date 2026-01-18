"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = exports.LocalLLMProvider = exports.OpenAIProvider = void 0;
class OpenAIProvider {
    constructor(apiKey, model = 'gpt-3.5-turbo') {
        this.apiKey = apiKey;
        this.model = model;
        this.name = 'openai';
    }
    isAvailable() {
        return !!(this.apiKey && typeof fetch !== 'undefined');
    }
    async generateNarrative(prompt, context) {
        if (!this.isAvailable()) {
            throw new Error('OpenAI provider not configured');
        }
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: this.buildPrompt(prompt, context) }],
                    temperature: 0.7,
                    max_tokens: 150,
                }),
            });
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'An unexpected event occurred.';
        }
        catch (error) {
            console.warn('OpenAI generation failed:', error);
            throw error;
        }
    }
    enhanceEvent(event, context) {
        // For synchronous operation, return a simple enhanced version
        // Full async enhancement would require changing the entire generation pipeline
        const enhancedDescription = event.description.length > 50
            ? `${event.description} The situation seems particularly challenging.`
            : `${event.description} This event carries special significance.`;
        return {
            ...event,
            description: enhancedDescription,
            tags: [...(event.tags || []), 'ai-enhanced']
        };
    }
    buildPrompt(basePrompt, context) {
        let prompt = basePrompt;
        if (context) {
            if (context.genre)
                prompt += ` in a ${context.genre} style`;
            if (context.storyTone)
                prompt += ` with a ${context.storyTone} tone`;
            if (context.playerLevel)
                prompt += ` for a level ${context.playerLevel} character`;
        }
        return prompt;
    }
}
exports.OpenAIProvider = OpenAIProvider;
class LocalLLMProvider {
    constructor(endpoint = 'http://localhost:11434') {
        this.endpoint = endpoint;
        this.name = 'local-llm';
    }
    isAvailable() {
        return typeof fetch !== 'undefined';
    }
    async generateNarrative(prompt, context) {
        if (!this.isAvailable()) {
            throw new Error('Local LLM provider not available');
        }
        try {
            const response = await fetch(`${this.endpoint}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama2',
                    prompt: this.buildPrompt(prompt, context),
                    stream: false,
                }),
            });
            if (!response.ok) {
                throw new Error(`Local LLM API error: ${response.status}`);
            }
            const data = await response.json();
            return data.response || 'An unexpected event occurred.';
        }
        catch (error) {
            console.warn('Local LLM generation failed:', error);
            throw error;
        }
    }
    enhanceEvent(event, context) {
        const enhancedDescription = event.description.length > 30
            ? `${event.description} The mystery deepens with each passing moment.`
            : `${event.description} Ancient forces seem to be at work here.`;
        return {
            ...event,
            description: enhancedDescription,
            tags: [...(event.tags || []), 'ai-enhanced']
        };
    }
    buildPrompt(basePrompt, context) {
        let prompt = `You are a creative RPG storyteller. ${basePrompt}`;
        if (context) {
            if (context.genre)
                prompt += ` Write in ${context.genre} genre.`;
            if (context.storyTone)
                prompt += ` Use a ${context.storyTone} tone.`;
        }
        return prompt;
    }
}
exports.LocalLLMProvider = LocalLLMProvider;
class MockProvider {
    constructor() {
        this.name = 'mock';
    }
    isAvailable() {
        return true;
    }
    async generateNarrative(prompt) {
        return `Enhanced narrative: ${prompt.substring(0, 50)}...`;
    }
    async enhanceEvent(event) {
        return {
            ...event,
            description: `Enhanced: ${event.description}`,
            tags: [...(event.tags || []), 'ai-enhanced']
        };
    }
}
exports.MockProvider = MockProvider;
//# sourceMappingURL=providers.js.map