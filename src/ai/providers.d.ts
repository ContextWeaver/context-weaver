import { AIProvider, AINarrativeContext } from './interfaces';
export declare class OpenAIProvider implements AIProvider {
    private apiKey?;
    private model;
    name: string;
    constructor(apiKey?: string, model?: string);
    isAvailable(): boolean;
    generateNarrative(prompt: string, context?: AINarrativeContext): Promise<string>;
    enhanceEvent(event: any, context?: AINarrativeContext): any;
    private buildPrompt;
}
export declare class LocalLLMProvider implements AIProvider {
    private endpoint;
    name: string;
    constructor(endpoint?: string);
    isAvailable(): boolean;
    generateNarrative(prompt: string, context?: AINarrativeContext): Promise<string>;
    enhanceEvent(event: any, context?: AINarrativeContext): any;
    private buildPrompt;
}
export declare class MockProvider implements AIProvider {
    name: string;
    isAvailable(): boolean;
    generateNarrative(prompt: string): Promise<string>;
    enhanceEvent(event: any): Promise<any>;
}
//# sourceMappingURL=providers.d.ts.map