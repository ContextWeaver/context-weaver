import { AIProvider, AINarrativeContext } from './interfaces';

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  constructor(private apiKey?: string, private model: string = 'gpt-3.5-turbo') {}

  isAvailable(): boolean {
    return !!(this.apiKey && typeof fetch !== 'undefined');
  }

  async generateNarrative(prompt: string, context?: AINarrativeContext): Promise<string> {
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

      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || 'An unexpected event occurred.';
    } catch (error) {
      console.warn('OpenAI generation failed:', error);
      throw error;
    }
  }

  enhanceEvent(event: any, context?: AINarrativeContext): any {
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

  private buildPrompt(basePrompt: string, context?: AINarrativeContext): string {
    let prompt = basePrompt;

    if (context) {
      if (context.genre) prompt += ` in a ${context.genre} style`;
      if (context.storyTone) prompt += ` with a ${context.storyTone} tone`;
      if (context.playerLevel) prompt += ` for a level ${context.playerLevel} character`;
    }

    return prompt;
  }
}

export class LocalLLMProvider implements AIProvider {
  name = 'local-llm';

  constructor(private endpoint: string = 'http://localhost:11434') {}

  isAvailable(): boolean {
    return typeof fetch !== 'undefined';
  }

  async generateNarrative(prompt: string, context?: AINarrativeContext): Promise<string> {
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

      const data = await response.json() as any;
      return data.response || 'An unexpected event occurred.';
    } catch (error) {
      console.warn('Local LLM generation failed:', error);
      throw error;
    }
  }

  enhanceEvent(event: any, context?: AINarrativeContext): any {
    const enhancedDescription = event.description.length > 30
      ? `${event.description} The mystery deepens with each passing moment.`
      : `${event.description} Ancient forces seem to be at work here.`;

    return {
      ...event,
      description: enhancedDescription,
      tags: [...(event.tags || []), 'ai-enhanced']
    };
  }

  private buildPrompt(basePrompt: string, context?: AINarrativeContext): string {
    let prompt = `You are a creative RPG storyteller. ${basePrompt}`;

    if (context) {
      if (context.genre) prompt += ` Write in ${context.genre} genre.`;
      if (context.storyTone) prompt += ` Use a ${context.storyTone} tone.`;
    }

    return prompt;
  }
}

export class MockProvider implements AIProvider {
  name = 'mock';

  isAvailable(): boolean {
    return true;
  }

  async generateNarrative(prompt: string): Promise<string> {
    return `Enhanced narrative: ${prompt.substring(0, 50)}...`;
  }

  async enhanceEvent(event: any): Promise<any> {
    return {
      ...event,
      description: `Enhanced: ${event.description}`,
      tags: [...(event.tags || []), 'ai-enhanced']
    };
  }
}