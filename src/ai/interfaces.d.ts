export interface AIProvider {
    name: string;
    isAvailable(): boolean;
    generateNarrative(prompt: string, context?: any): Promise<string>;
    enhanceEvent(event: any, context?: any): any;
}
export interface AIEnhancementOptions {
    provider?: string;
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    enabled?: boolean;
}
export interface AINarrativeContext {
    playerLevel?: number;
    playerClass?: string;
    currentLocation?: string;
    recentEvents?: string[];
    storyTone?: 'dark' | 'light' | 'neutral';
    genre?: string;
}
//# sourceMappingURL=interfaces.d.ts.map