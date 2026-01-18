const { LocalizationSystem } = require('../dist');

describe('LocalizationSystem', () => {
  let localization;

  beforeEach(() => {
    localization = new LocalizationSystem();
  });

  describe('Initialization', () => {
    test('should initialize with default English language', () => {
      expect(localization.getCurrentLanguage()).toBe('en');
      expect(localization.getAvailableLanguages()).toContain('en');
    });

    test('should initialize with custom default language', () => {
      const customLocalization = new LocalizationSystem('fr');
      expect(customLocalization.getCurrentLanguage()).toBe('fr');
    });

    test('should load default English locale', () => {
      expect(localization.hasTranslation('event.title.default')).toBe(true);
      expect(localization.hasTranslation('choice.fight')).toBe(true);
      expect(localization.hasTranslation('difficulty.normal')).toBe(true);
    });
  });

  describe('Language Management', () => {
    test('should set language successfully', () => {
      const result = localization.setLanguage('en');
      expect(result).toBe(true);
      expect(localization.getCurrentLanguage()).toBe('en');
    });

    test('should fail to set non-existent language', () => {
      const result = localization.setLanguage('nonexistent');
      expect(result).toBe(false);
      expect(localization.getCurrentLanguage()).toBe('en'); // Should remain unchanged
    });

    test('should load and switch to new language pack', () => {
      const frenchPack = {
        ui: {
          'event.title.default': 'Événement Inattendu',
          'choice.fight': 'Combattre',
          'choice.flee': 'Fuire'
        }
      };

      localization.loadLanguagePack('fr', frenchPack);
      localization.setLanguage('fr');

      expect(localization.getCurrentLanguage()).toBe('fr');
      expect(localization.translate('event.title.default')).toBe('Événement Inattendu');
      expect(localization.translate('choice.fight')).toBe('Combattre');
    });
  });

  describe('Translation', () => {
    test('should translate existing keys', () => {
      expect(localization.translate('choice.fight')).toBe('Fight');
      expect(localization.translate('choice.flee')).toBe('Flee');
    });

    test('should return key for non-existent translations', () => {
      expect(localization.translate('nonexistent.key')).toBe('nonexistent.key');
    });

    test('should handle variable substitution', () => {
      // Add a test translation with variables
      localization.addTranslation('test.greeting', 'Hello {{name}}, you have {{count}} items');

      const result = localization.translate('test.greeting', { name: 'Alice', count: 5 });
      expect(result).toBe('Hello Alice, you have 5 items');
    });

    test('should handle missing variables gracefully', () => {
      localization.addTranslation('test.partial', 'Hello {{name}}');

      const result = localization.translate('test.partial', {});
      expect(result).toBe('Hello {{name}}'); // Variables not replaced
    });

    test('should support contextual translation with fallback', () => {
      localization.addTranslation('combat.attack', 'Attack the enemy');

      const translator = localization.createTranslator('combat');
      expect(translator('attack')).toBe('Attack the enemy');
      expect(translator('nonexistent')).toBe('nonexistent'); // Fallback to base key
    });
  });

  describe('Translation Management', () => {
    test('should add new translations', () => {
      localization.addTranslation('test.newkey', 'New Value');
      expect(localization.translate('test.newkey')).toBe('New Value');
    });

    test('should remove translations', () => {
      localization.addTranslation('test.temp', 'Temp Value');
      expect(localization.hasTranslation('test.temp')).toBe(true);

      const removed = localization.removeTranslation('test.temp');
      expect(removed).toBe(true);
      expect(localization.hasTranslation('test.temp')).toBe(false);
    });

    test('should return false when removing non-existent translation', () => {
      const removed = localization.removeTranslation('nonexistent');
      expect(removed).toBe(false);
    });

    test('should get all translation keys', () => {
      const keys = localization.getTranslationKeys();
      expect(keys).toContain('event.title.default');
      expect(keys).toContain('choice.fight');
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe('Language Pack Operations', () => {
    test('should export language pack', () => {
      const pack = localization.exportLanguagePack('en');
      expect(pack).toHaveProperty('ui');
      expect(pack.ui['event.title.default']).toBe('Unexpected Event');
    });

    test('should return null for non-existent language pack', () => {
      const pack = localization.exportLanguagePack('nonexistent');
      expect(pack).toBeNull();
    });

    test('should import language pack', () => {
      const importPack = {
        ui: {
          'test.imported': 'Imported Value'
        }
      };

      localization.importLanguagePack('test', importPack);
      expect(localization.getAvailableLanguages()).toContain('test');

      localization.setLanguage('test');
      expect(localization.translate('test.imported')).toBe('Imported Value');
    });

    test('should get complete language pack', () => {
      const pack = localization.getLanguagePack('en');
      expect(pack).toHaveProperty('ui');
      expect(pack.ui['event.title.default']).toBe('Unexpected Event');
    });
  });

  describe('Validation', () => {
    test('should validate correct language pack', () => {
      const validPack = {
        ui: {
          'test.key1': 'Value 1',
          'test.key2': 'Value 2'
        }
      };

      const result = localization.validateLanguagePack(validPack);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid language pack structure', () => {
      const invalidPack = {
        ui: 'not an object'
      };

      const result = localization.validateLanguagePack(invalidPack);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ui property must be an object');
    });

    test('should reject non-string translation values', () => {
      const invalidPack = {
        ui: {
          'test.key': 123 // Should be string
        }
      };

      const result = localization.validateLanguagePack(invalidPack);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    test('should provide localization statistics', () => {
      const stats = localization.getStats();

      expect(stats).toHaveProperty('currentLanguage');
      expect(stats).toHaveProperty('availableLanguages');
      expect(stats).toHaveProperty('totalTranslations');
      expect(stats).toHaveProperty('loadedLanguagePacks');

      expect(stats.currentLanguage).toBe('en');
      expect(Array.isArray(stats.availableLanguages)).toBe(true);
      expect(typeof stats.totalTranslations).toBe('number');
      expect(typeof stats.loadedLanguagePacks).toBe('number');
    });
  });

  describe('Utility Functions', () => {
    test('should format numbers', () => {
      expect(localization.formatNumber(1234.56)).toBe('1,234.56');
    });

    test('should format dates', () => {
      const date = new Date('2024-01-15');
      const formatted = localization.formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' });
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    test('should handle plural rules', () => {
      expect(localization.getPluralRule(0)).toBe('zero');
      expect(localization.getPluralRule(1)).toBe('one');
      expect(localization.getPluralRule(5)).toBe('other');
    });
  });

  describe('Cleanup', () => {
    test('should clear language packs except default', () => {
      localization.loadLanguagePack('fr', { ui: { 'test': 'value' } });
      expect(localization.getAvailableLanguages()).toContain('fr');

      localization.clearLanguagePacks();

      expect(localization.getAvailableLanguages()).toEqual(['en']);
      expect(localization.getCurrentLanguage()).toBe('en');
    });
  });
});