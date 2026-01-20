const fs = require('fs');
const path = require('path');
const {
  validateTitle,
  validateDescription,
  validateChoices,
  validatePlayerContext,
  validateTemplate,
  validateId,
  validateFilePath,
  validateGeneratorOptions
} = require('../src/utils/validation');
const {
  ensureDirectory,
  readJsonFile,
  writeJsonFile,
  readTextFile,
  writeTextFile,
  fileExists,
  listFiles,
  getFileExtension,
  backupFile,
  cleanOldBackups
} = require('../src/utils/file');
const {
  capitalize,
  camelCase,
  chunk,
  clamp
} = require('../src/utils');

describe('Utility Functions', () => {
  describe('Validation', () => {
    test('validateTitle should validate title correctly', () => {
      const valid = validateTitle('A Valid Title');
      expect(valid.isValid).toBe(true);
      expect(valid.errors.length).toBe(0);
    });

    test('validateTitle should reject empty title', () => {
      const invalid = validateTitle('');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);
    });

    test('validateTitle should reject non-string', () => {
      const invalid = validateTitle(null);
      expect(invalid.isValid).toBe(false);
    });

    test('validateDescription should validate description', () => {
      const valid = validateDescription('A valid description that is long enough');
      expect(valid.isValid).toBe(true);
    });

    test('validateDescription should reject empty description', () => {
      const invalid = validateDescription('');
      expect(invalid.isValid).toBe(false);
    });

    test('validateChoices should validate choices array', () => {
      const validChoices = [
        { text: 'Choice 1', effect: { gold: 10 } },
        { text: 'Choice 2', effect: { gold: -5 } }
      ];
      const result = validateChoices(validChoices);
      expect(result.isValid).toBe(true);
    });

    test('validateChoices should reject invalid choices', () => {
      const invalidChoices = [
        { text: 'Choice 1' },
        { effect: { gold: 10 } }
      ];
      const result = validateChoices(invalidChoices);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validatePlayerContext should validate context', () => {
      const validContext = {
        age: 25,
        gold: 500,
        level: 5
      };
      const result = validatePlayerContext(validContext);
      expect(result.isValid).toBe(true);
    });

    test('validateTemplate should validate template structure', () => {
      const validTemplate = {
        title: 'Test Template',
        narrative: 'A test narrative that is long enough',
        choices: [
          { text: 'Choice 1', effect: { gold: 10 } },
          { text: 'Choice 2', effect: { gold: -5 } }
        ]
      };
      const result = validateTemplate(validTemplate);
      expect(result.isValid).toBe(true);
    });

    test('validateTemplate should reject invalid template', () => {
      const invalidTemplate = {
        title: 'Test',
      };
      const result = validateTemplate(invalidTemplate);
      expect(result.isValid).toBe(false);
    });

    test('validateId should validate IDs', () => {
      const valid = validateId('valid_id_123');
      expect(valid.isValid).toBe(true);
    });

    test('validateId should reject invalid IDs', () => {
      const invalid = validateId('invalid id with spaces');
      expect(invalid.isValid).toBe(false);
    });
  });

  describe('File Operations', () => {
    const testDir = path.join(__dirname, 'temp-test-files');

    beforeEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      fs.mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    test('ensureDirectory should create directory', () => {
      const newDir = path.join(testDir, 'new-dir');
      ensureDirectory(newDir);
      expect(fs.existsSync(newDir)).toBe(true);
    });

    test('writeJsonFile and readJsonFile should work', () => {
      const filePath = path.join(testDir, 'test.json');
      const data = { test: 'data', number: 123 };

      const written = writeJsonFile(filePath, data);
      expect(written).toBe(true);

      const read = readJsonFile(filePath);
      expect(read).toEqual(data);
    });

    test('readJsonFile should return null for non-existent file', () => {
      const result = readJsonFile(path.join(testDir, 'non-existent.json'));
      expect(result).toBeNull();
    });

    test('writeTextFile and readTextFile should work', () => {
      const filePath = path.join(testDir, 'test.txt');
      const content = 'Test content';

      const written = writeTextFile(filePath, content);
      expect(written).toBe(true);

      const read = readTextFile(filePath);
      expect(read).toBe(content);
    });

    test('fileExists should check file existence', () => {
      const filePath = path.join(testDir, 'exists.txt');
      fs.writeFileSync(filePath, 'test');

      expect(fileExists(filePath)).toBe(true);
      expect(fileExists(path.join(testDir, 'not-exists.txt'))).toBe(false);
    });

    test('listFiles should list files in directory', () => {
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'test');
      fs.writeFileSync(path.join(testDir, 'file2.json'), '{}');

      const files = listFiles(testDir);
      expect(files.length).toBeGreaterThanOrEqual(2);
    });

    test('getFileExtension should extract extension', () => {
      expect(getFileExtension('test.json')).toBe('.json');
      expect(getFileExtension('test.txt')).toBe('.txt');
      expect(getFileExtension('noextension')).toBe('');
    });

    test('listFiles should filter files by extension', () => {
      fs.writeFileSync(path.join(testDir, 'file1.json'), '{}');
      fs.writeFileSync(path.join(testDir, 'file2.txt'), 'test');
      fs.writeFileSync(path.join(testDir, 'file3.json'), '{}');

      const jsonFiles = listFiles(testDir, '.json');
      expect(jsonFiles.length).toBe(2);
      expect(jsonFiles.every(f => f.endsWith('.json'))).toBe(true);
    });

    test('backupFile should create backup', () => {
      const filePath = path.join(testDir, 'original.txt');
      fs.writeFileSync(filePath, 'original content');

      const backupPath = backupFile(filePath);
      expect(backupPath).toBeTruthy();
      expect(fs.existsSync(backupPath)).toBe(true);
    });

    test('fileExists should check file existence', () => {
      const filePath = path.join(testDir, 'exists-check.txt');
      fs.writeFileSync(filePath, 'test');
      
      expect(fileExists(filePath)).toBe(true);
      
      fs.unlinkSync(filePath);
      expect(fileExists(filePath)).toBe(false);
    });
  });

  describe('Text Utilities', () => {
    const {
      capitalize,
      titleCase,
      camelCase,
      pascalCase,
      kebabCase,
      snakeCase,
      truncate,
      normalizeWhitespace,
      wordCount,
      extractSentences,
      removePunctuation,
      isAlphanumeric,
      sanitizeFilename,
      slugify,
      pluralize,
      ordinal,
      interpolate
    } = require('../src/utils/text');

    test('capitalize should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('')).toBe('');
    });

    test('titleCase should capitalize each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });

    test('camelCase should convert to camelCase', () => {
      expect(camelCase('hello-world')).toBe('helloWorld');
      expect(camelCase('hello_world')).toBe('helloWorld');
      const result = camelCase('hello world');
      expect(result).toBe('helloWorld');
    });

    test('pascalCase should convert to PascalCase', () => {
      expect(pascalCase('hello-world')).toBe('HelloWorld');
      expect(pascalCase('hello_world')).toBe('HelloWorld');
      const result = pascalCase('hello world');
      expect(result).toBe('HelloWorld');
    });

    test('kebabCase should convert to kebab-case', () => {
      expect(kebabCase('Hello World')).toBe('hello-world');
    });

    test('snakeCase should convert to snake_case', () => {
      expect(snakeCase('Hello World')).toBe('hello_world');
    });

    test('truncate should truncate strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    test('normalizeWhitespace should normalize spaces', () => {
      expect(normalizeWhitespace('hello   world')).toBe('hello world');
      expect(normalizeWhitespace('  hello  world  ')).toBe('hello world');
    });

    test('wordCount should count words', () => {
      expect(wordCount('hello world')).toBe(2);
      expect(wordCount('hello')).toBe(1);
      expect(wordCount('')).toBe(0);
    });

    test('extractSentences should extract sentences', () => {
      const sentences = extractSentences('First sentence. Second sentence! Third sentence?');
      expect(sentences.length).toBe(3);
    });

    test('removePunctuation should remove punctuation', () => {
      expect(removePunctuation('Hello, World!')).toBe('Hello World');
    });

    test('isAlphanumeric should check alphanumeric', () => {
      expect(isAlphanumeric('Hello123')).toBe(true);
      expect(isAlphanumeric('Hello 123')).toBe(false);
    });

    test('sanitizeFilename should sanitize filenames', () => {
      expect(sanitizeFilename('test/file.txt')).toBe('test_file.txt');
    });

    test('slugify should create URL-friendly slugs', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
    });

    test('pluralize should pluralize words', () => {
      expect(pluralize('cat', 1)).toBe('cat');
      expect(pluralize('cat', 2)).toBe('cats');
      expect(pluralize('city', 2)).toBe('cities');
    });

    test('ordinal should format ordinals', () => {
      expect(ordinal(1)).toBe('1st');
      expect(ordinal(2)).toBe('2nd');
      expect(ordinal(3)).toBe('3rd');
      expect(ordinal(4)).toBe('4th');
    });

    test('interpolate should interpolate variables', () => {
      expect(interpolate('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
    });
  });

  describe('Array Utilities', () => {
    const {
      unique,
      uniqueBy,
      groupBy,
      chunk,
      flatten,
      sample,
      partition,
      intersection,
      union,
      difference
    } = require('../src/utils/array');

    test('unique should remove duplicates', () => {
      expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    });

    test('uniqueBy should remove duplicates by key', () => {
      const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 1, name: 'C' }];
      const unique = uniqueBy(items, item => item.id);
      expect(unique.length).toBe(2);
    });

    test('groupBy should group items', () => {
      const items = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 }
      ];
      const grouped = groupBy(items, item => item.type);
      expect(grouped.A.length).toBe(2);
      expect(grouped.B.length).toBe(1);
    });

    test('chunk should split array into chunks', () => {
      const array = [1, 2, 3, 4, 5, 6];
      const chunks = chunk(array, 2);
      expect(chunks).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    test('chunk should handle remainder', () => {
      const array = [1, 2, 3, 4, 5];
      const chunks = chunk(array, 2);
      expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('flatten should flatten arrays', () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });

    test('sample should get random sample', () => {
      const array = [1, 2, 3, 4, 5];
      const sampleResult = sample(array, 3);
      expect(sampleResult.length).toBe(3);
      expect(sampleResult.every(item => array.includes(item))).toBe(true);
    });

    test('partition should partition array', () => {
      const [evens, odds] = partition([1, 2, 3, 4, 5], n => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3, 5]);
    });

    test('intersection should find common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    });

    test('union should combine arrays', () => {
      expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
    });

    test('difference should find differences', () => {
      expect(difference([1, 2, 3], [2, 3])).toEqual([1]);
    });
  });

  describe('Random Utilities', () => {
    const {
      randomInt,
      randomFloat,
      randomChoice,
      randomChoices,
      randomBool,
      clamp
    } = require('../src/utils/random');

    test('randomInt should generate integers in range', () => {
      for (let i = 0; i < 10; i++) {
        const value = randomInt(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    test('randomFloat should generate floats in range', () => {
      for (let i = 0; i < 10; i++) {
        const value = randomFloat(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThan(10);
      }
    });

    test('randomChoice should pick from array', () => {
      const array = [1, 2, 3, 4, 5];
      const choice = randomChoice(array);
      expect(array).toContain(choice);
    });

    test('randomChoices should pick multiple items', () => {
      const array = [1, 2, 3, 4, 5];
      const choices = randomChoices(array, 3);
      expect(choices.length).toBe(3);
      expect(choices.every(item => array.includes(item))).toBe(true);
    });

    test('randomBool should generate booleans', () => {
      const value = randomBool(0.5);
      expect(typeof value).toBe('boolean');
    });

    test('clamp should clamp values', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
