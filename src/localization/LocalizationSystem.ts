// RPG Event Generator v3.0.0 - Localization System
// Manages language packs, translations, and internationalization

import { LanguagePack } from '../types';
import { ILocalizationSystem } from '../interfaces';

export interface TranslationOptions {
  [key: string]: string | number;
}

export interface LocalizationStats {
  currentLanguage: string;
  availableLanguages: string[];
  totalTranslations: number;
  loadedLanguagePacks: number;
}

export class LocalizationSystem implements ILocalizationSystem {
  private locales: Map<string, LanguagePack>;
  private currentLanguage: string;
  private fallbackLanguage: string;

  constructor(defaultLanguage: string = 'en') {
    this.locales = new Map();
    this.currentLanguage = defaultLanguage;
    this.fallbackLanguage = 'en';
    this.loadDefaultLocale();
  }

  /**
   * Load the default English locale
   */
  private loadDefaultLocale(): void {
    const defaultLocale: LanguagePack = {
      ui: {
        // UI translations
        'event.title.default': 'Unexpected Event',
        'event.description.default': 'Something unexpected happened.',
        'choice.fight': 'Fight',
        'choice.flee': 'Flee',
        'choice.negotiate': 'Negotiate',
        'choice.accept': 'Accept',
        'choice.decline': 'Decline',
        'choice.investigate': 'Investigate',
        'choice.ignore': 'Ignore',

        // Status messages
        'system.ready': 'System ready',
        'system.loading': 'Loading...',
        'system.error': 'An error occurred',

        // Relationship types
        'relationship.ally': 'Ally',
        'relationship.enemy': 'Enemy',
        'relationship.neutral': 'Neutral',
        'relationship.friend': 'Friend',
        'relationship.rival': 'Rival',

        // Difficulty levels
        'difficulty.easy': 'Easy',
        'difficulty.normal': 'Normal',
        'difficulty.hard': 'Hard',
        'difficulty.legendary': 'Legendary',

        // Seasons
        'season.spring': 'Spring',
        'season.summer': 'Summer',
        'season.autumn': 'Autumn',
        'season.winter': 'Winter'
      }
    };

    this.locales.set('en', defaultLocale);
  }

  /**
   * Load a language pack
   */
  loadLanguagePack(language: string, languagePack: LanguagePack): void {
    this.locales.set(language, {
      ...this.locales.get(language), // Preserve existing data
      ...languagePack
    });
  }

  /**
   * Set the current language
   */
  setLanguage(language: string): boolean {
    if (this.locales.has(language)) {
      this.currentLanguage = language;
      return true;
    } else {
      console.warn(`Language '${language}' not loaded, staying with '${this.currentLanguage}'`);
      return false;
    }
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get translated text with variable substitution
   */
  translate(key: string, variables: TranslationOptions = {}): string {
    // Try current language first
    let locale = this.locales.get(this.currentLanguage);

    // Fall back to default language if translation not found
    if (!locale || !locale.ui?.[key]) {
      locale = this.locales.get(this.fallbackLanguage);
    }

    // Return key if no translation found
    if (!locale || !locale.ui?.[key]) {
      return key;
    }

    let translation = locale.ui[key];

    // Substitute variables
    Object.entries(variables).forEach(([varKey, value]) => {
      const placeholder = `{{${varKey}}}`;
      translation = translation.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return translation;
  }

  /**
   * Check if a translation key exists
   */
  hasTranslation(key: string): boolean {
    const locale = this.locales.get(this.currentLanguage) || this.locales.get(this.fallbackLanguage);
    return !!(locale?.ui?.[key]);
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): string[] {
    return Array.from(this.locales.keys());
  }

  /**
   * Add a translation key to the current language
   */
  addTranslation(key: string, translation: string): void {
    if (!this.locales.has(this.currentLanguage)) {
      this.locales.set(this.currentLanguage, { ui: {} });
    }

    const locale = this.locales.get(this.currentLanguage)!;
    if (!locale.ui) {
      locale.ui = {};
    }

    locale.ui[key] = translation;
  }

  /**
   * Remove a translation key
   */
  removeTranslation(key: string): boolean {
    const locale = this.locales.get(this.currentLanguage);
    if (locale?.ui?.[key]) {
      delete locale.ui[key];
      return true;
    }
    return false;
  }

  /**
   * Get the complete language pack for a language
   */
  getLanguagePack(language: string): LanguagePack | null {
    return this.locales.get(language) || null;
  }

  /**
   * Export the current language pack
   */
  exportLanguagePack(language?: string): LanguagePack | null {
    const targetLanguage = language || this.currentLanguage;
    return this.locales.get(targetLanguage) || null;
  }

  /**
   * Import a language pack
   */
  importLanguagePack(language: string, languagePack: LanguagePack): void {
    this.loadLanguagePack(language, languagePack);
  }

  /**
   * Get all translation keys for the current language
   */
  getTranslationKeys(): string[] {
    const locale = this.locales.get(this.currentLanguage) || this.locales.get(this.fallbackLanguage);
    return locale?.ui ? Object.keys(locale.ui) : [];
  }

  /**
   * Validate a language pack structure
   */
  validateLanguagePack(languagePack: LanguagePack): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!languagePack || typeof languagePack !== 'object') {
      errors.push('Language pack must be an object');
      return { isValid: false, errors };
    }

    // Check required structure
    if (languagePack.ui && typeof languagePack.ui !== 'object') {
      errors.push('ui property must be an object');
    }

    // Validate UI translations
    if (languagePack.ui) {
      Object.entries(languagePack.ui).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          errors.push(`UI translation '${key}' must be a string`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get localization statistics
   */
  getStats(): LocalizationStats {
    let totalTranslations = 0;

    this.locales.forEach(locale => {
      if (locale.ui) {
        totalTranslations += Object.keys(locale.ui).length;
      }
    });

    return {
      currentLanguage: this.currentLanguage,
      availableLanguages: Array.from(this.locales.keys()),
      totalTranslations,
      loadedLanguagePacks: this.locales.size
    };
  }

  /**
   * Create a contextual translation helper
   */
  createTranslator(context: string): (key: string, variables?: TranslationOptions) => string {
    return (key: string, variables: TranslationOptions = {}) => {
      const contextualKey = `${context}.${key}`;
      return this.translate(contextualKey, variables) !== contextualKey
        ? this.translate(contextualKey, variables)
        : this.translate(key, variables);
    };
  }

  /**
   * Format numbers according to locale (basic implementation)
   */
  formatNumber(num: number): string {
    // Basic number formatting - could be extended for different locales
    return num.toLocaleString(this.currentLanguage);
  }

  /**
   * Format dates according to locale (basic implementation)
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return date.toLocaleDateString(this.currentLanguage, options);
  }

  /**
   * Get pluralization rules for current language (simplified)
   */
  getPluralRule(count: number): 'zero' | 'one' | 'other' {
    // Simplified pluralization - English rules
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    return 'other';
  }

  /**
   * Clear all loaded language packs (except default)
   */
  clearLanguagePacks(): void {
    const defaultPack = this.locales.get('en');
    this.locales.clear();
    if (defaultPack) {
      this.locales.set('en', defaultPack);
    }
    this.currentLanguage = 'en';
  }
}