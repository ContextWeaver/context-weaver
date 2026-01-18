"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIEnhancer = void 0;
const providers_1 = require("./providers");
class AIEnhancer {
    constructor(options = {}) {
        this.providers = new Map();
        this.options = { enabled: false, ...options };
        this.initializeProviders();
    }
    initializeProviders() {
        this.providers.set('mock', new providers_1.MockProvider());
        if (this.options.provider === 'openai' && this.options.apiKey) {
            this.providers.set('openai', new providers_1.OpenAIProvider(this.options.apiKey, this.options.model));
            this.defaultProvider = this.providers.get('openai');
        }
        else if (this.options.provider === 'local-llm') {
            this.providers.set('local-llm', new providers_1.LocalLLMProvider());
            this.defaultProvider = this.providers.get('local-llm');
        }
        else {
            this.defaultProvider = this.providers.get('mock');
        }
    }
    isEnabled() {
        return this.options.enabled === true;
    }
    isAvailable() {
        return this.defaultProvider?.isAvailable() || false;
    }
    enhanceEvent(event, context) {
        if (!this.isEnabled() || !this.isAvailable()) {
            return event;
        }
        try {
            // For synchronous operation, return enhanced event or fallback
            const enhanced = this.defaultProvider.enhanceEvent(event, context);
            if (enhanced && typeof enhanced.then === 'function') {
                // If provider returns a promise, return original for now
                return event;
            }
            return enhanced;
        }
        catch (error) {
            console.warn('AI enhancement failed, using original event:', error);
            return event;
        }
    }
    async generateNarrative(prompt, context) {
        if (!this.isEnabled() || !this.isAvailable()) {
            throw new Error('AI enhancement not available');
        }
        return await this.defaultProvider.generateNarrative(prompt, context);
    }
    setProvider(providerName, config) {
        if (providerName === 'openai') {
            const provider = new providers_1.OpenAIProvider(config?.apiKey, config?.model);
            this.providers.set('openai', provider);
            this.defaultProvider = provider;
        }
        else if (providerName === 'local-llm') {
            const provider = new providers_1.LocalLLMProvider(config?.endpoint);
            this.providers.set('local-llm', provider);
            this.defaultProvider = provider;
        }
    }
    getAvailableProviders() {
        return Array.from(this.providers.keys()).filter(name => this.providers.get(name).isAvailable());
    }
    updateOptions(options) {
        this.options = { ...this.options, ...options };
        this.initializeProviders();
    }
}
exports.AIEnhancer = AIEnhancer;
//# sourceMappingURL=enhancer.js.map