import { AIEnhancementOptions, AINarrativeContext } from './interfaces';
export declare class AIEnhancer {
    private providers;
    private defaultProvider?;
    private options;
    constructor(options?: AIEnhancementOptions);
    private initializeProviders;
    isEnabled(): boolean;
    isAvailable(): boolean;
    enhanceEvent(event: any, context?: AINarrativeContext): any;
    generateNarrative(prompt: string, context?: AINarrativeContext): Promise<string>;
    setProvider(providerName: string, config?: any): void;
    getAvailableProviders(): string[];
    updateOptions(options: Partial<AIEnhancementOptions>): void;
}
//# sourceMappingURL=enhancer.d.ts.map