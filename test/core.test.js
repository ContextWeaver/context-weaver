const { MarkovEngine, ContextAnalyzer, DifficultyScaler, GeneratorCore } = require('../src/core');

describe('Core Systems', () => {
  describe('MarkovEngine', () => {
    let markovEngine;

    beforeEach(() => {
      markovEngine = new MarkovEngine({ stateSize: 2 });
    });

    test('should initialize with default state size', () => {
      const engine = new MarkovEngine();
      expect(engine).toBeDefined();
    });

    test('should add training data', () => {
      const trainingData = [
        'The ancient dragon roars in the dark cave',
        'A brave warrior enters the mysterious forest',
        'Magic flows through the enchanted sword'
      ];

      markovEngine.addData(trainingData);
      const stats = markovEngine.getStats();
      expect(stats.stateCount).toBeGreaterThan(0);
    });

    test('should generate text from training data', () => {
      const trainingData = [
        'The ancient dragon roars',
        'A brave warrior enters',
        'Magic flows through'
      ];

      markovEngine.addData(trainingData);
      const result = markovEngine.generate({ minLength: 3, maxLength: 20 });
      
      expect(result).toHaveProperty('string');
      expect(typeof result.string).toBe('string');
      expect(result.string.length).toBeGreaterThan(0);
    });

    test('should handle theme-based generation', () => {
      const fantasyData = ['Dragon roars', 'Wizard casts spell'];
      const sciFiData = ['Spaceship flies', 'Robot activates'];

      markovEngine.addData(fantasyData, 'fantasy');
      markovEngine.addData(sciFiData, 'sci-fi');

      const stats = markovEngine.getStats();
      expect(stats.stateCount).toBeGreaterThan(0);
      expect(stats.totalTransitions).toBeGreaterThan(0);
    });

    test('should respect min and max length options', () => {
      const trainingData = ['Short', 'Medium length text', 'This is a much longer training text'];
      markovEngine.addData(trainingData);

      const result = markovEngine.generate({ minLength: 5, maxLength: 10 });
      expect(result.string.length).toBeGreaterThanOrEqual(5);
    });

    test('should clear data', () => {
      markovEngine.addData(['Test data']);
      markovEngine.clear();
      
      const stats = markovEngine.getStats();
      expect(stats.stateCount).toBe(0);
    });

    test('should handle empty training data gracefully', () => {
      markovEngine.addData([]);
      const result = markovEngine.generate();
      expect(result).toHaveProperty('string');
    });
  });

  describe('ContextAnalyzer', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new ContextAnalyzer();
    });

    test('should analyze basic context', () => {
      const context = {
        age: 25,
        gold: 500,
        influence: 15,
        level: 5
      };

      const analyzed = analyzer.analyzeContext(context);

      expect(analyzed).toHaveProperty('powerLevel');
      expect(analyzed).toHaveProperty('wealthTier');
      expect(analyzed).toHaveProperty('influenceTier');
      expect(analyzed).toHaveProperty('skillProfile');
      expect(analyzed).toHaveProperty('lifeStage');
    });

    test('should determine wealth tier correctly', () => {
      const poor = analyzer.analyzeContext({ gold: 50 });
      expect(poor.wealthTier).toBe('poor');

      const moderate = analyzer.analyzeContext({ gold: 500 });
      expect(moderate.wealthTier).toBe('moderate');

      const wealthy = analyzer.analyzeContext({ gold: 5000 });
      expect(wealthy.wealthTier).toBe('wealthy');

      const rich = analyzer.analyzeContext({ gold: 50000 });
      expect(rich.wealthTier).toBe('rich');
    });

    test('should determine influence tier correctly', () => {
      const low = analyzer.analyzeContext({ influence: 5 });
      expect(low.influenceTier).toBe('low');

      const medium = analyzer.analyzeContext({ influence: 30 });
      expect(medium.influenceTier).toBe('medium');

      const high = analyzer.analyzeContext({ influence: 75 });
      expect(high.influenceTier).toBe('high');

      const elite = analyzer.analyzeContext({ influence: 100 });
      expect(elite.influenceTier).toBe('elite');
    });

    test('should analyze skill profile', () => {
      const context = {
        skills: {
          combat: 80,
          social: 60,
          magic: 40,
          technical: 20
        }
      };

      const analyzed = analyzer.analyzeContext(context);
      expect(analyzed.skillProfile.combat).toBe(80);
      expect(analyzed.skillProfile.social).toBe(60);
      expect(analyzed.skillProfile.magic).toBe(40);
      expect(analyzed.skillProfile.technical).toBe(20);
    });

    test('should determine life stage from age', () => {
      const youth = analyzer.analyzeContext({ age: 17 });
      expect(youth.lifeStage).toBe('youth');

      const adult = analyzer.analyzeContext({ age: 30 });
      expect(adult.lifeStage).toBe('adult');

      const experienced = analyzer.analyzeContext({ age: 50 });
      expect(experienced.lifeStage).toBe('experienced');

      const elder = analyzer.analyzeContext({ age: 70 });
      expect(elder.lifeStage).toBe('elder');
    });

    test('should handle empty context', () => {
      const analyzed = analyzer.analyzeContext({});
      expect(analyzed).toHaveProperty('powerLevel');
      expect(analyzed).toHaveProperty('wealthTier');
    });

    test('should calculate power level correctly', () => {
      const lowPower = analyzer.analyzeContext({ level: 1, gold: 10, influence: 5 });
      const highPower = analyzer.analyzeContext({ level: 20, gold: 10000, influence: 100 });

      expect(highPower.powerLevel).toBeGreaterThan(lowPower.powerLevel);
    });
  });

  describe('DifficultyScaler', () => {
    let scaler;

    beforeEach(() => {
      scaler = new DifficultyScaler();
    });

    test('should calculate power level', () => {
      const context = { level: 10, gold: 1000, influence: 50, health: 100 };
      const powerLevel = scaler.calculatePowerLevel(context);
      
      expect(typeof powerLevel).toBe('number');
      expect(powerLevel).toBeGreaterThan(0);
    });

    test('should determine difficulty tier', () => {
      const easyContext = { level: 1, gold: 10 };
      const normalContext = { level: 15, gold: 2000, influence: 30 };
      const hardContext = { level: 25, gold: 1000000, influence: 100 };
      const legendaryContext = { level: 35, gold: 100000, influence: 100 };

      const easyTier = scaler.calculateDifficultyTier(scaler.calculatePowerLevel(easyContext));
      const normalTier = scaler.calculateDifficultyTier(scaler.calculatePowerLevel(normalContext));
      const hardTier = scaler.calculateDifficultyTier(scaler.calculatePowerLevel(hardContext));
      const legendaryTier = scaler.calculateDifficultyTier(scaler.calculatePowerLevel(legendaryContext));

      expect(easyTier.name).toBe('easy');
      expect(['normal', 'hard']).toContain(normalTier.name);
      expect(['hard', 'legendary']).toContain(hardTier.name);
      expect(legendaryTier.name).toBe('legendary');
    });

    test('should scale effects for difficulty', () => {
      const context = { level: 15, gold: 2000 };
      const choices = [
        { text: 'Fight', effect: { gold: 100, health: -20 } },
        { text: 'Flee', effect: { gold: -50 } }
      ];

      const scaled = scaler.scaleEffectsForDifficulty(choices, context);
      
      expect(scaled).toHaveLength(2);
      expect(scaled[0]).toHaveProperty('effect');
    });

    test('should analyze difficulty', () => {
      const context = { level: 10, gold: 1000, influence: 50 };
      const analysis = scaler.analyzeDifficulty(context);

      expect(analysis).toHaveProperty('playerPowerLevel');
      expect(analysis).toHaveProperty('recommendedTier');
      expect(analysis).toHaveProperty('scalingFactors');
      expect(analysis).toHaveProperty('adaptiveSuggestions');
    });

    test('should handle edge cases', () => {
      const emptyContext = {};
      const powerLevel = scaler.calculatePowerLevel(emptyContext);
      expect(typeof powerLevel).toBe('number');
    });
  });

  describe('GeneratorCore', () => {
    let generatorCore;

    beforeEach(() => {
      generatorCore = new GeneratorCore();
    });

    test('should generate a single event', () => {
      const context = { level: 5, gold: 100 };
      const event = generatorCore.generateEvent(context);

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('choices');
      expect(event).toHaveProperty('type');
    });

    test('should generate multiple events', () => {
      const context = { level: 5 };
      const events = generatorCore.generateEvents(context, 3);

      expect(events).toHaveLength(3);
      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
      });
    });

    test('should add training data', () => {
      const trainingData = ['Custom event text', 'Another custom text'];
      generatorCore.addTrainingData(trainingData);
      
      const event = generatorCore.generateEvent({});
      expect(event).toHaveProperty('title');
    });

    test('should handle theme-based training data', () => {
      const fantasyData = ['Dragon appears', 'Wizard casts spell'];
      generatorCore.addTrainingData(fantasyData, 'fantasy');
      
      const event = generatorCore.generateEvent({});
      expect(event).toHaveProperty('title');
    });

    test('should handle empty context', () => {
      const event = generatorCore.generateEvent({});
      expect(event).toHaveProperty('id');
    });
  });
});
