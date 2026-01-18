// Localization and internationalization types for RPG Event Generator
// Language packs and translation management

export interface LanguagePack {
  ui: { [key: string]: string };
  events?: { [key: string]: string };
  templates?: { [key: string]: string };
  trainingData?: string[];
}

export interface TranslationOptions {
  [key: string]: string | number;
}