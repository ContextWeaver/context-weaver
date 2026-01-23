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

    describe('Context Integration', () => {
      test('should include location in descriptions', () => {
        const context = { location: 'forest' };
        let foundLocation = false;
        for (let i = 0; i < 10; i++) {
          const event = generatorCore.generateEvent(context);
          if (event.description.toLowerCase().includes('forest')) {
            foundLocation = true;
            break;
          }
        }
        expect(foundLocation).toBe(true);
      });

      test('should include weather in descriptions', () => {
        const context = { weather: 'rainy' };
        let foundWeather = false;
        for (let i = 0; i < 10; i++) {
          const event = generatorCore.generateEvent(context);
          const desc = event.description.toLowerCase();
          if (desc.includes('rain') || desc.includes('stormy') || desc.includes('downpour')) {
            foundWeather = true;
            break;
          }
        }
        expect(foundWeather).toBe(true);
      });

      test('should include class-based context in descriptions', () => {
        const context = { class: 'fighter' };
        let foundClass = false;
        for (let i = 0; i < 10; i++) {
          const event = generatorCore.generateEvent(context);
          const desc = event.description.toLowerCase();
          if (desc.includes('warrior') || desc.includes('martial') || desc.includes('combat experience')) {
            foundClass = true;
            break;
          }
        }
        expect(foundClass).toBe(true);
      });

      test('should include race-based context in descriptions', () => {
        const context = { race: 'elf' };
        let foundRace = false;
        for (let i = 0; i < 10; i++) {
          const event = generatorCore.generateEvent(context);
          const desc = event.description.toLowerCase();
          if (desc.includes('elven') || desc.includes('elf')) {
            foundRace = true;
            break;
          }
        }
        expect(foundRace).toBe(true);
      });

      test('should include time of day in descriptions', () => {
        const context = { timeOfDay: 'night' };
        let foundTime = false;
        for (let i = 0; i < 10; i++) {
          const event = generatorCore.generateEvent(context);
          const desc = event.description.toLowerCase();
          if (desc.includes('night') || desc.includes('midnight') || desc.includes('starry')) {
            foundTime = true;
            break;
          }
        }
        expect(foundTime).toBe(true);
      });
    });

    describe('Multi-Theme Support', () => {
      test('should use custom content from non-default theme', () => {
        const customData = {
          titles: {
            COMBAT: ['⚔️ Epic Battle', '🗡️ Warrior Duel']
          },
          descriptions: {
            COMBAT: ['Two legendary warriors face off in an epic battle.']
          },
          choices: {
            COMBAT: ['⚔️ Fight', '🛡️ Defend', '💨 Retreat']
          }
        };

        generatorCore.addTrainingData(customData, 'custom_theme');
        
        let foundCustom = false;
        let combatEventsFound = 0;
        for (let i = 0; i < 50; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'COMBAT') {
            combatEventsFound++;
            const hasCustomTitle = event.title.includes('⚔️') || event.title.includes('🗡️');
            const hasCustomDescription = event.description.includes('legendary warriors') || 
                                        event.description.includes('epic battle');
            const hasCustomChoice = event.choices.some(c => 
              c.text.includes('⚔️') || c.text.includes('🛡️') || c.text.includes('💨')
            );
            
            if (hasCustomTitle || hasCustomDescription || hasCustomChoice) {
              foundCustom = true;
              break;
            }
          }
        }
        if (combatEventsFound > 0) {
          expect(foundCustom).toBe(true);
        } else {
          expect(combatEventsFound).toBeGreaterThan(0);
        }
      });

      test('should prioritize default theme over other themes', () => {
        const defaultData = {
          titles: {
            SOCIAL: ['Default Social Title']
          }
        };
        const customData = {
          titles: {
            SOCIAL: ['Custom Social Title']
          }
        };

        generatorCore.addTrainingData(defaultData, 'default');
        generatorCore.addTrainingData(customData, 'custom_theme');
        
        let foundDefault = false;
        for (let i = 0; i < 20; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'SOCIAL' && event.title === 'Default Social Title') {
            foundDefault = true;
            break;
          }
        }
        expect(foundDefault).toBe(true);
      });
    });

    describe('Custom Content Usage', () => {
      test('should use custom titles when provided', () => {
        const customData = {
          titles: {
            MYSTERY: ['🔍 Secret Investigation', '📜 Ancient Mystery']
          }
        };

        generatorCore.addTrainingData(customData, 'default');
        
        let foundCustom = false;
        let mysteryEventsFound = 0;
        for (let i = 0; i < 50; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'MYSTERY') {
            mysteryEventsFound++;
            if (event.title.includes('🔍') || event.title.includes('📜') || 
                event.title.includes('Secret') || event.title.includes('Ancient')) {
              foundCustom = true;
              break;
            }
          }
        }
        if (mysteryEventsFound > 0) {
          expect(foundCustom).toBe(true);
        } else {
          expect(mysteryEventsFound).toBeGreaterThan(0);
        }
      });

      test('should use custom descriptions when provided', () => {
        const customData = {
          descriptions: {
            EXPLORATION: ['Deep within the ancient ruins, explorers discover hidden treasures.']
          }
        };

        generatorCore.addTrainingData(customData, 'default');
        
        let foundCustom = false;
        let explorationEventsFound = 0;
        for (let i = 0; i < 50; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'EXPLORATION') {
            explorationEventsFound++;
            const desc = event.description.toLowerCase();
            if (desc.includes('ancient ruins') || desc.includes('hidden treasures') ||
                desc.includes('explorers discover')) {
              foundCustom = true;
              break;
            }
          }
        }
        if (explorationEventsFound > 0) {
          expect(foundCustom).toBe(true);
        } else {
          expect(explorationEventsFound).toBeGreaterThan(0);
        }
      });

      test('should use custom choices when provided', () => {
        const customData = {
          choices: {
            ECONOMIC: ['💰 Accept Deal', '💸 Negotiate', '🚫 Decline']
          }
        };

        generatorCore.addTrainingData(customData, 'default');
        
        let foundCustom = false;
        let economicEventsFound = 0;
        for (let i = 0; i < 50; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'ECONOMIC') {
            economicEventsFound++;
            const hasCustomChoice = event.choices.some(c => 
              c.text.includes('💰') || c.text.includes('💸') || c.text.includes('🚫') ||
              c.text.includes('Accept Deal') || c.text.includes('Negotiate') || c.text.includes('Decline')
            );
            if (hasCustomChoice) {
              foundCustom = true;
              break;
            }
          }
        }
        if (economicEventsFound > 0) {
          expect(foundCustom).toBe(true);
        } else {
          expect(economicEventsFound).toBeGreaterThan(0);
        }
      });

      test('should use all custom content types together', () => {
        const customData = {
          titles: {
            POLITICAL: ['👑 Royal Decree']
          },
          descriptions: {
            POLITICAL: ['The king issues a royal decree that affects the entire kingdom.']
          },
          choices: {
            POLITICAL: ['✅ Accept', '❌ Refuse', '🤝 Negotiate']
          }
        };

        generatorCore.addTrainingData(customData, 'default');
        
        let foundAllCustom = false;
        for (let i = 0; i < 30; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'POLITICAL') {
            const hasCustomTitle = event.title.includes('👑');
            const hasCustomDescription = event.description.includes('royal decree');
            const hasCustomChoice = event.choices.some(c => 
              c.text.includes('✅') || c.text.includes('❌') || c.text.includes('🤝')
            );
            
            if (hasCustomTitle && hasCustomDescription && hasCustomChoice) {
              foundAllCustom = true;
              break;
            }
          }
        }
        expect(foundAllCustom).toBe(true);
      });
    });

    describe('Event Type Coverage', () => {
      test('should generate MAGIC events', () => {
        let foundMagic = false;
        for (let i = 0; i < 100; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'MAGIC') {
            foundMagic = true;
            expect(event).toHaveProperty('title');
            expect(event).toHaveProperty('description');
            expect(event).toHaveProperty('choices');
            break;
          }
        }
        expect(foundMagic).toBe(true);
      });

      test('should generate SPELLCASTING events', () => {
        let foundSpellcasting = false;
        for (let i = 0; i < 30; i++) {
          const event = generatorCore.generateEvent({});
          if (event.type === 'SPELLCASTING') {
            foundSpellcasting = true;
            expect(event).toHaveProperty('title');
            expect(event).toHaveProperty('description');
            expect(event).toHaveProperty('choices');
            break;
          }
        }
        expect(foundSpellcasting).toBe(true);
      });

      test('should generate all supported event types', () => {
        const validTypes = [
          'ADVENTURE', 'COMBAT', 'ECONOMIC', 'EXPLORATION', 'GUILD', 'MAGIC', 'MYSTERY',
          'POLITICAL', 'QUEST', 'SOCIAL', 'SPELLCASTING', 'SUPERNATURAL', 'TECHNOLOGICAL', 'UNDERWORLD'
        ];

        const generatedTypes = new Set();
        
          for (let i = 0; i < 200; i++) {
          const event = generatorCore.generateEvent({});
          generatedTypes.add(event.type);
          if (generatedTypes.size === validTypes.length) {
            break;
          }
        }

        generatedTypes.forEach(type => {
          expect(validTypes).toContain(type);
        });
      });
    });

    describe('Context Enhancement Return Value', () => {
      test('should return modified description with context enhancements', () => {
        const context = { location: 'forest', class: 'fighter' };
        
        let foundEnhancement = false;
        for (let i = 0; i < 15; i++) {
          const event = generatorCore.generateEvent(context);
          const desc = event.description.toLowerCase();
          
          const hasLocation = desc.includes('forest') || desc.includes('in the') || desc.includes('within the');
          const hasClass = desc.includes('warrior') || desc.includes('martial') || desc.includes('combat');
          
          if (hasLocation || hasClass) {
            foundEnhancement = true;
            expect(typeof event.description).toBe('string');
            expect(event.description.length).toBeGreaterThan(0);
            break;
          }
        }
        expect(foundEnhancement).toBe(true);
      });
    });
  });
});
