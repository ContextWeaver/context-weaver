import { AIProvider, AIEnhancementOptions, AINarrativeContext } from './interfaces';
import { OpenAIProvider, LocalLLMProvider, MockProvider } from './providers';

export class AIEnhancer {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider?: AIProvider;
  private options: AIEnhancementOptions;

  constructor(options: AIEnhancementOptions = {}) {
    this.options = { enabled: false, ...options };
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers.set('mock', new MockProvider());

    if (this.options.provider === 'openai' && this.options.apiKey) {
      this.providers.set('openai', new OpenAIProvider(this.options.apiKey, this.options.model));
      this.defaultProvider = this.providers.get('openai');
    } else if (this.options.provider === 'local-llm') {
      this.providers.set('local-llm', new LocalLLMProvider());
      this.defaultProvider = this.providers.get('local-llm');
    } else {
      this.defaultProvider = this.providers.get('mock');
    }
  }

  isEnabled(): boolean {
    return this.options.enabled === true;
  }

  isAvailable(): boolean {
    return this.defaultProvider?.isAvailable() || false;
  }

  enhanceEvent(event: any, context?: AINarrativeContext): any {
    if (!this.isEnabled() || !this.isAvailable()) {
      return event;
    }

    try {
      // For synchronous operation, return enhanced event or fallback
      const enhanced = this.defaultProvider!.enhanceEvent(event, context);
      if (enhanced && typeof enhanced.then === 'function') {
        // If provider returns a promise, return original for now
        return event;
      }
      return enhanced;
    } catch (error) {
      console.warn('AI enhancement failed, using original event:', error);
      return event;
    }
  }

  async generateNarrative(prompt: string, context?: AINarrativeContext): Promise<string> {
    if (!this.isEnabled() || !this.isAvailable()) {
      throw new Error('AI enhancement not available');
    }

    return await this.defaultProvider!.generateNarrative(prompt, context);
  }

  setProvider(providerName: string, config?: any): void {
    if (providerName === 'openai') {
      const provider = new OpenAIProvider(config?.apiKey, config?.model);
      this.providers.set('openai', provider);
      this.defaultProvider = provider;
    } else if (providerName === 'local-llm') {
      const provider = new LocalLLMProvider(config?.endpoint);
      this.providers.set('local-llm', provider);
      this.defaultProvider = provider;
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(name =>
      this.providers.get(name)!.isAvailable()
    );
  }

  updateOptions(options: Partial<AIEnhancementOptions>): void {
    this.options = { ...this.options, ...options };
    this.initializeProviders();
  }
}