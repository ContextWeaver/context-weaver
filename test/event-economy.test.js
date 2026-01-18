const EventEconomy = require('../dist/scripts/event-economy');
const fs = require('fs');
const path = require('path');

// Use a temporary directory for tests
const testDir = path.join(__dirname, 'temp-economy-test');

describe('EventEconomy', () => {
  let economy;

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    economy = new EventEconomy(testDir);
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Initialization', () => {
    test('should create required directories', () => {
      expect(fs.existsSync(path.join(testDir, 'themes'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'rules'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'packs'))).toBe(true);
    });

    test('should accept custom storage path', () => {
      const customPath = path.join(__dirname, 'custom-storage');
      const customEconomy = new EventEconomy(customPath);

      expect(fs.existsSync(path.join(customPath, 'themes'))).toBe(true);
      expect(fs.existsSync(path.join(customPath, 'rules'))).toBe(true);
      expect(fs.existsSync(path.join(customPath, 'packs'))).toBe(true);

      // Cleanup
      fs.rmSync(customPath, { recursive: true, force: true });
    });
  });

  describe('Theme Management', () => {
    const sampleThemeData = {
      author: 'TestAuthor',
      description: 'A test theme',
      tags: ['test', 'sample'],
      theme: 'fantasy',
      culture: 'medieval',
      language: 'en',
      enableRuleEngine: true,
      enableTemplates: true,
      pureMarkovMode: false,
      trainingData: [
        'Knights ride noble steeds across the kingdom',
        'Magic flows through ancient forests',
        'Dragons guard treasures in mountain lairs'
      ],
      customRules: []
    };

    test('should save theme successfully', () => {
      const filepath = economy.saveTheme('TestTheme', sampleThemeData);

      expect(fs.existsSync(filepath)).toBe(true);

      const savedData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      expect(savedData.name).toBe('TestTheme');
      expect(savedData.author).toBe('TestAuthor');
      expect(savedData.description).toBe('A test theme');
      expect(savedData.tags).toEqual(['test', 'sample']);
      expect(savedData.settings.theme).toBe('fantasy');
      expect(savedData.trainingData).toHaveLength(3);
    });

    test('should load theme successfully', () => {
      economy.saveTheme('TestTheme', sampleThemeData);
      const loadedTheme = economy.loadTheme('TestTheme');

      expect(loadedTheme.name).toBe('TestTheme');
      expect(loadedTheme.author).toBe('TestAuthor');
      expect(loadedTheme.settings.theme).toBe('fantasy');
      expect(loadedTheme.trainingData).toHaveLength(3);
    });

    test('should throw error when loading non-existent theme', () => {
      expect(() => economy.loadTheme('NonExistentTheme')).toThrow('Theme "NonExistentTheme" not found');
    });

    test('should list themes correctly', () => {
      economy.saveTheme('Theme1', { ...sampleThemeData, author: 'Author1' });
      economy.saveTheme('Theme2', { ...sampleThemeData, author: 'Author2' });

      const themes = economy.listThemes();
      expect(themes).toHaveLength(2);
      expect(themes[0].name).toBe('Theme1');
      expect(themes[0].author).toBe('Author1');
      expect(themes[1].name).toBe('Theme2');
      expect(themes[1].author).toBe('Author2');
    });

    test('should delete theme successfully', () => {
      economy.saveTheme('TestTheme', sampleThemeData);
      expect(economy.deleteTheme('TestTheme')).toBe(true);

      const themes = economy.listThemes();
      expect(themes).toHaveLength(0);
    });

    test('should return false when deleting non-existent theme', () => {
      expect(economy.deleteTheme('NonExistentTheme')).toBe(false);
    });
  });

  describe('Rule Pack Management', () => {
    const sampleRuleData = {
      author: 'RuleCreator',
      description: 'Combat-focused rules',
      tags: ['combat', 'difficulty'],
      rules: [
        {
          name: 'weak_enemy_bonus',
          conditions: [
            { type: 'stat_less_than', stat: 'level', value: 5 }
          ],
          effects: [
            { type: 'modify_difficulty', value: -1 }
          ]
        }
      ]
    };

    test('should save rule pack successfully', () => {
      const filepath = economy.saveRulePack('CombatRules', sampleRuleData);

      expect(fs.existsSync(filepath)).toBe(true);

      const savedData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      expect(savedData.name).toBe('CombatRules');
      expect(savedData.author).toBe('RuleCreator');
      expect(savedData.rules).toHaveLength(1);
      expect(savedData.statistics.totalRules).toBe(1);
    });

    test('should load rule pack successfully', () => {
      economy.saveRulePack('CombatRules', sampleRuleData);
      const loadedPack = economy.loadRulePack('CombatRules');

      expect(loadedPack.name).toBe('CombatRules');
      expect(loadedPack.rules).toHaveLength(1);
      expect(loadedPack.rules[0].name).toBe('weak_enemy_bonus');
    });

    test('should throw error when loading non-existent rule pack', () => {
      expect(() => economy.loadRulePack('NonExistentPack')).toThrow('Rule pack "NonExistentPack" not found');
    });
  });

  describe('Content Pack Creation', () => {
    const samplePackData = {
      author: 'PackCreator',
      description: 'Complete adventure pack',
      theme: {
        name: 'AdventureTheme',
        settings: { theme: 'fantasy' },
        trainingData: ['Adventure awaits!']
      },
      rulePacks: ['CombatRules']
    };

    test('should create content pack successfully', () => {
      const filepath = economy.createContentPack('AdventurePack', samplePackData);

      expect(fs.existsSync(filepath)).toBe(true);

      const savedData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      expect(savedData.name).toBe('AdventurePack');
      expect(savedData.author).toBe('PackCreator');
      expect(savedData.theme.name).toBe('AdventureTheme');
      expect(savedData.rulePacks).toEqual(['CombatRules']);
    });
  });

  describe('Import/Export', () => {
    const sampleThemeData = {
      author: 'Exporter',
      theme: 'fantasy',
      trainingData: ['Exported theme data']
    };

    test('should export theme successfully', () => {
      economy.saveTheme('ExportTheme', sampleThemeData);
      const exportPath = path.join(testDir, 'exported-theme.json');

      const resultPath = economy.exportTheme('ExportTheme', exportPath);
      expect(fs.existsSync(resultPath)).toBe(true);

      const exportedData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      expect(exportedData.name).toBe('ExportTheme');
      expect(exportedData.author).toBe('Exporter');
    });

    test('should import theme successfully', () => {
      // Create a theme file to import (in the format that saveTheme outputs)
      const importData = {
        name: 'ImportedTheme',
        version: '1.0.0',
        author: 'Importer',
        settings: {
          theme: 'sci-fi',
          culture: 'cyberpunk',
          language: 'en',
          enableRuleEngine: false,
          enableTemplates: true,
          pureMarkovMode: false
        },
        trainingData: ['Imported theme data'],
        customRules: []
      };

      const importPath = path.join(testDir, 'theme-to-import.json');
      fs.writeFileSync(importPath, JSON.stringify(importData, null, 2));

      economy.importTheme(importPath);

      const importedTheme = economy.loadTheme('ImportedTheme_imported');
      expect(importedTheme.name).toBe('ImportedTheme_imported');
      expect(importedTheme.author).toBe('Importer');
      expect(importedTheme.settings.theme).toBe('sci-fi');
    });

    test('should throw error when importing non-existent file', () => {
      expect(() => economy.importTheme('/non/existent/file.json')).toThrow('Import file not found');
    });
  });

  describe('Statistics', () => {
    test('should return correct statistics', () => {
      // Add some test data
      economy.saveTheme('Theme1', {
        author: 'Author1',
        theme: 'fantasy',
        trainingData: ['sentence1', 'sentence2']
      });

      economy.saveTheme('Theme2', {
        author: 'Author2',
        theme: 'sci-fi',
        trainingData: ['sentence1', 'sentence2', 'sentence3']
      });

      economy.saveRulePack('Rules1', {
        author: 'RuleAuthor',
        rules: [{ name: 'rule1' }]
      });

      const stats = economy.getStatistics();

      expect(stats.totalThemes).toBe(2);
      expect(stats.totalRulePacks).toBe(1);
      expect(stats.totalContentPacks).toBe(0);
      expect(stats.averageThemeQuality).toBeGreaterThan(0);
    });
  });

  describe('Utility Functions', () => {
    test('should sanitize filenames correctly', () => {
      expect(economy.sanitizeFilename('My Theme!@#$')).toBe('my_theme____');
      expect(economy.sanitizeFilename('theme-name_123')).toBe('theme-name_123');
    });

    test('should calculate theme quality', () => {
      const highQualityTheme = {
        description: 'A comprehensive theme with detailed training data and custom rules for enhanced gameplay',
        tags: ['high-quality', 'detailed', 'rules'],
        trainingData: [
          'This is a very long and detailed sentence with lots of interesting content.',
          'Another complex sentence with multiple clauses and descriptive elements.',
          'A third sentence that adds variety and depth to the training data.'
        ],
        customRules: [
          { name: 'rule1', conditions: [{ type: 'stat_greater_than' }] }
        ]
      };

      const quality = economy.calculateThemeQuality(highQualityTheme);
      expect(quality).toBeGreaterThan(30); // Should be reasonably high
    });
  });

  describe('CLI Functionality', () => {
    test('should have CLI interface', () => {
      // Test that the main function exists (can't easily test CLI without mocking process.argv)
      expect(typeof economy.getStatistics).toBe('function');
      expect(typeof economy.listThemes).toBe('function');
    });
  });
});
