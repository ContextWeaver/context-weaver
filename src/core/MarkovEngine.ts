// RPG Event Generator v3.0.0 - Markov Chain Engine
// Core text generation using Markov chains

import { GENERATION_DEFAULTS } from '../utils';
import { IMarkovEngine } from '../interfaces';

interface MarkovOptions {
  stateSize?: number;
  minLength?: number;
  maxLength?: number;
  maxTries?: number;
  allowDuplicates?: boolean;
}

interface MarkovResult {
  string: string;
}

export class MarkovEngine implements IMarkovEngine {
  private stateSize: number;
  private data: string[];
  private chain: Map<string, string[]>;
  private themeMap: Map<string, number[]>;

  constructor(options: { stateSize?: number } = {}) {
    this.stateSize = options.stateSize || GENERATION_DEFAULTS.STATE_SIZE;
    this.data = [];
    this.chain = new Map();
    this.themeMap = new Map();
  }

  /**
   * Add training data to the Markov chain
   */
  addData(texts: string[], theme?: string): void {
    const startIndex = this.data.length;
    this.data = this.data.concat(texts);

    if (theme) {
      if (!this.themeMap.has(theme)) {
        this.themeMap.set(theme, []);
      }
      const indices = texts.map((_, i) => startIndex + i);
      this.themeMap.get(theme)!.push(...indices);
    }

    this.buildChain();
  }

  /**
   * Build the Markov chain from training data
   */
  private buildChain(): void {
    this.chain.clear();

    this.data.forEach(text => {
      const words = text.split(/\s+/);
      for (let i = 0; i <= words.length - this.stateSize; i++) {
        const state = words.slice(i, i + this.stateSize).join(' ');
        const nextWord = words[i + this.stateSize];

        if (!this.chain.has(state)) {
          this.chain.set(state, []);
        }

        const stateArray = this.chain.get(state);
        if (stateArray && nextWord) {
          stateArray.push(nextWord);
        }
      }
    });
  }

  /**
   * Generate text using the Markov chain
   */
  generate(options: MarkovOptions = {}): MarkovResult {
    const minLength = options.minLength || GENERATION_DEFAULTS.MIN_LENGTH;
    const maxLength = options.maxLength || GENERATION_DEFAULTS.MAX_LENGTH;
    const maxTries = options.maxTries || GENERATION_DEFAULTS.MAX_TRIES;

    for (let tries = 0; tries < maxTries; tries++) {
      const result = this.generateAttempt(minLength, maxLength);
      if (result) {
        return { string: result };
      }
    }

    // Fallback: combine random fragments
    const fragments: string[] = [];
    const numFragments = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < numFragments; i++) {
      const fragment = this.data[Math.floor(Math.random() * this.data.length)];
      if (fragment && !fragments.includes(fragment)) {
        fragments.push(fragment);
      }
    }

    let combined = fragments.join('. ');
    if (!combined.endsWith('.')) combined += '.';

    return { string: combined };
  }

  /**
   * Generate context-aware text based on player state and preferences
   */
  generateContextual(context: any, theme?: string): MarkovResult {
    let filteredData = [...this.data];

    // Filter by theme if specified
    if (theme && this.themeMap.has(theme)) {
      const themeIndices = this.themeMap.get(theme)!;
      filteredData = themeIndices.map(i => this.data[i]).filter(Boolean);
    }

    // Weight generation based on context
    if (context.powerLevel > 50) {
      // Higher power level - prefer more complex narratives
      filteredData = filteredData.filter(text => text.length > 20);
    }

    if (filteredData.length === 0) {
      filteredData = this.data;
    }

    // Temporarily replace data for generation
    const originalData = this.data;
    this.data = filteredData;

    try {
      const result = this.generate({
        minLength: Math.max(15, context.complexity || 10),
        maxLength: Math.min(100, (context.complexity || 30) * 2)
      });
      return result;
    } finally {
      this.data = originalData;
    }
  }

  /**
   * Analyze generation patterns and provide statistics
   */
  analyzePatterns(): {
    averageLength: number;
    commonWords: Array<{word: string, count: number}>;
    themes: string[];
    quality: number;
  } {
    if (this.data.length === 0) {
      return { averageLength: 0, commonWords: [], themes: [], quality: 0 };
    }

    const lengths = this.data.map(text => text.length);
    const averageLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    const wordCounts: Map<string, number> = new Map();
    for (const text of this.data) {
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 2) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      }
    }

    const commonWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    const themes = Array.from(this.themeMap.keys());

    // Quality score based on diversity and length
    const uniqueWords = new Set();
    for (const text of this.data) {
      text.toLowerCase().split(/\s+/).forEach(word => uniqueWords.add(word));
    }
    const quality = Math.min(100, (uniqueWords.size / this.data.length) * 10 + averageLength / 2);

    return { averageLength, commonWords, themes, quality };
  }

  /**
   * Attempt to generate text within length constraints
   */
  private generateAttempt(minLength: number, maxLength: number): string | null {
    const states = Array.from(this.chain.keys());
    if (states.length === 0) return null;

    let currentState = states[Math.floor(Math.random() * states.length)];
    const words = currentState.split(' ');
    let attempts = 0;
    const maxAttempts = GENERATION_DEFAULTS.MAX_ATTEMPTS;

    while (words.join(' ').length < maxLength && attempts < maxAttempts) {
      const nextWords = this.chain.get(currentState);
      if (!nextWords || nextWords.length === 0) {
        // Try to find similar states
        const similarStates = states.filter(s => s.split(' ')[0] === words[words.length - 1]);
        if (similarStates.length > 0) {
          currentState = similarStates[Math.floor(Math.random() * similarStates.length)];
          const stateWords = currentState.split(' ');
          words.push(...stateWords.slice(1));
        } else {
          break;
        }
      } else {
        const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
        words.push(nextWord);
        currentState = words.slice(-this.stateSize).join(' ');
      }
      attempts++;
    }

    const result = words.join(' ');

    // Capitalize first letter and add punctuation
    let finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    if (!finalResult.endsWith('.') && !finalResult.endsWith('!') && !finalResult.endsWith('?')) {
      finalResult += '.';
    }

    return finalResult.length >= minLength && finalResult.length <= maxLength ? finalResult : null;
  }

  /**
   * Check if generated text is interesting enough to use
   */
  isInterestingText(text: string): boolean {
    // Basic heuristics for interesting text
    const words = text.split(/\s+/);
    if (words.length < 5) return false;

    // Check for repetitive patterns
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const uniquenessRatio = uniqueWords.size / words.length;

    return uniquenessRatio > 0.6; // At least 60% unique words
  }

  /**
   * Get statistics about the Markov chain
   */
  getStats(): {
    stateCount: number;
    averageTransitions: number;
    totalTransitions: number;
  } {
    const transitions = Array.from(this.chain.values());
    const totalTransitions = transitions.reduce((sum, arr) => sum + arr.length, 0);

    return {
      stateCount: this.chain.size,
      averageTransitions: this.chain.size > 0 ? totalTransitions / this.chain.size : 0,
      totalTransitions
    };
  }

  /**
   * Clear all training data and reset the chain
   */
  clear(): void {
    this.data = [];
    this.chain.clear();
  }
}