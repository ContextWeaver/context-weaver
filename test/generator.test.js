const { RPGEventGenerator, generateRPGEvent } = require('../src/index.js');

describe('RPG Event Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new RPGEventGenerator();
  });

  describe('Basic Generation', () => {
    test('should generate a valid event object', () => {
      const event = generator.generateEvent();

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('choices');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('context');
    });

    test('should generate unique event IDs', () => {
      const event1 = generator.generateEvent();
      const event2 = generator.generateEvent();

      expect(event1.id).not.toBe(event2.id);
    });

    test('should generate events with valid choices', () => {
      const event = generator.generateEvent();

      expect(Array.isArray(event.choices)).toBe(true);
      expect(event.choices.length).toBeGreaterThan(0);

      event.choices.forEach(choice => {
        expect(choice).toHaveProperty('text');
        expect(choice).toHaveProperty('effect');
        expect(typeof choice.effect).toBe('object');
      });
    });

    test('should use valid event types', () => {
      const validTypes = ['COURT_SCANDAL', 'NOBLE_DUEL', 'THIEVES_GUILD', 'BLACKMAIL_OPPORTUNITY',
                         'ANCIENT_CURSE', 'GHOSTLY_VISITATION', 'FORBIDDEN_LOVE', 'FAMILY_SECRET',
                         'LOST_CIVILIZATION', 'BANDIT_KING', 'MARKET_CRASH', 'TRADE_WAR',
                         'DESERTION_TEMPTATION', 'MERCENARY_CONTRACT',
                         'BLOOMING_ROMANCE', 'SPRING_FESTIVAL', 'SUMMER_TOURNAMENT',
                         'HARVEST_FESTIVAL', 'WINTER_SOLSTICE',
                         'BANDIT_AMBUSH', 'BANDIT_ARMY', 'ASSASSINATION_PLOT', 'ROYAL_PURGE',
                         'TRADE_OPPORTUNITY', 'FINAL_RECKONING', 'RUMORS_OF_DISSENT', 'MARKET_UNREST'];
      const event = generator.generateEvent();

      expect(validTypes).toContain(event.type);
    });
  });

  describe('Context-Aware Generation', () => {
    test('should adapt to wealthy players', () => {
      const wealthyContext = {
        age: 30,
        gold: 5000,
        influence: 50
      };

      const event = generator.generateEvent(wealthyContext);

      expect(event.context.wealth).toBe(5000);
    });

    test('should adapt to skilled players', () => {
      const skilledContext = {
        age: 25,
        skills: { combat: 80, diplomacy: 60 }
      };

      const event = generator.generateEvent(skilledContext);

      expect(event.context.skills.combat).toBe(80);
    });

    test('should handle empty context', () => {
      const event = generator.generateEvent({});

      expect(event.context.age).toBe(16);
      expect(event.context.wealth).toBe(0);
    });
  });

  describe('Effect Resolution', () => {
    test('should resolve range effects to numbers', () => {
      const event = generator.generateEvent();
      const firstChoice = event.choices[0];

      Object.values(firstChoice.effect).forEach(value => {
        if (typeof value === 'number') {
          expect(Number.isInteger(value) || Number.isFinite(value)).toBe(true);
        }
      });
    });

    test('should apply wealth multipliers', () => {
      const wealthyContext = { gold: 2000 };
      const poorContext = { gold: 100 };

      const wealthyEvent = generator.generateEvent(wealthyContext);
      const poorEvent = generator.generateEvent(poorContext);

      expect(wealthyEvent.context.wealth).toBe(2000);
      expect(poorEvent.context.wealth).toBe(100);
    });
  });

  describe('Convenience Functions', () => {
    test('generateRPGEvent should work', () => {
      const event = generateRPGEvent();

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
    });

    test('should generate multiple events', () => {
      const events = generator.generateEvents({}, 3);

      expect(Array.isArray(events)).toBe(true);
      expect(events).toHaveLength(3);

      events.forEach(event => {
        expect(event).toHaveProperty('id');
      });
    });
  });

  describe('Training Data', () => {
    test('should accept custom training data', () => {
      const customData = ['A dragon appears', 'You find a sword'];
      const customGenerator = new RPGEventGenerator({
        trainingData: customData
      });

      const event = customGenerator.generateEvent();
      expect(event).toHaveProperty('description');
    });

    test('should handle Markov generation failures gracefully', () => {
      const failingGenerator = new RPGEventGenerator({
        trainingData: []
      });

      const event = failingGenerator.generateEvent();

      expect(event).toHaveProperty('description');
      expect(typeof event.description).toBe('string');
      expect(event.description.length).toBeGreaterThan(0);
    });
  });

  describe('Event Types Distribution', () => {
    test('should generate different event types', () => {
      const types = new Set();

      for (let i = 0; i < 50; i++) {
        const event = generator.generateEvent();
        types.add(event.type);
      }

      expect(types.size).toBeGreaterThan(1);
    });

    test('should generate contextually appropriate events', () => {
      const wealthyContext = { gold: 2000, influence: 30 };
      let economicEvents = 0;

      for (let i = 0; i < 50; i++) {
        const event = generator.generateEvent(wealthyContext);
        if (['MARKET_CRASH', 'TRADE_WAR', 'BLACKMAIL_OPPORTUNITY'].includes(event.type)) {
          economicEvents++;
        }
      }

      expect(economicEvents).toBeGreaterThan(1);
    });
  });

  describe('Thematic Training Sets', () => {
    test('should support different themes', () => {
      const fantasyGen = new RPGEventGenerator({ theme: 'fantasy' });
      const sciFiGen = new RPGEventGenerator({ theme: 'sci-fi' });
      const historicalGen = new RPGEventGenerator({ theme: 'historical' });

      const fantasyEvent = fantasyGen.generateEvent();
      const sciFiEvent = sciFiGen.generateEvent();
      const historicalEvent = historicalGen.generateEvent();

      expect(fantasyEvent).toHaveProperty('description');
      expect(sciFiEvent).toHaveProperty('description');
      expect(historicalEvent).toHaveProperty('description');
    });

    test('should default to fantasy theme', () => {
      const defaultGen = new RPGEventGenerator();
      const event = defaultGen.generateEvent();

      expect(defaultGen.theme).toBe('fantasy');
      expect(event).toHaveProperty('description');
    });

    test('should support cultural variants', () => {
      const norseGen = new RPGEventGenerator({ theme: 'fantasy', culture: 'norse' });
      const cyberpunkGen = new RPGEventGenerator({ theme: 'sci-fi', culture: 'cyberpunk' });
      const victorianGen = new RPGEventGenerator({ theme: 'historical', culture: 'victorian' });

      expect(norseGen.culture).toBe('norse');
      expect(cyberpunkGen.culture).toBe('cyberpunk');
      expect(victorianGen.culture).toBe('victorian');

      const norseEvent = norseGen.generateEvent();
      const cyberpunkEvent = cyberpunkGen.generateEvent();
      const victorianEvent = victorianGen.generateEvent();

      expect(norseEvent).toHaveProperty('description');
      expect(cyberpunkEvent).toHaveProperty('description');
      expect(victorianEvent).toHaveProperty('description');
    });
  });

  describe('Event Chains', () => {
    test('should start event chains', () => {
      const event = generator.startChain('BANDIT_RISING');

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event.type).toBe('BANDIT_AMBUSH');
    });

    test('should advance event chains', () => {
      const firstEvent = generator.startChain('BANDIT_RISING');
      expect(firstEvent).toHaveProperty('chainId');
      expect(firstEvent.type).toBe('BANDIT_AMBUSH');

      const secondEvent = generator.advanceChain(firstEvent.chainId, 'bandit');
      expect(secondEvent).toHaveProperty('title');
      expect(secondEvent.type).toBe('BANDIT_KING');
      expect(secondEvent.chainId).toBe(firstEvent.chainId);
    });

    test('should handle invalid chain advancement', () => {
      const result = generator.advanceChain('nonexistent', 'choice');
      expect(result).toBeNull();
    });

    test('should track active chains', () => {
      const initialChains = generator.getActiveChains();
      generator.startChain('BANDIT_RISING');

      const activeChains = generator.getActiveChains();
      expect(activeChains.length).toBe(initialChains.length + 1);
    });

    test('should end chains', () => {
      const event = generator.startChain('BANDIT_RISING');
      const initialCount = generator.getActiveChains().length;

      generator.endChain(event.chainId);
      const finalCount = generator.getActiveChains().length;

      expect(finalCount).toBe(initialCount - 1);
    });
  });

  describe('Dynamic Difficulty Scaling', () => {
    test('should scale difficulty based on player power', () => {
      const weakPlayer = { gold: 50, influence: 10 };
      const strongPlayer = { gold: 50000, influence: 500, skills: { combat: 100 } };
      const godlikePlayer = { gold: 200000, influence: 1000, skills: { combat: 200 } };

      const weakEvent = generator.generateEvent(weakPlayer);
      const strongEvent = generator.generateEvent(strongPlayer);
      const godlikeEvent = generator.generateEvent(godlikePlayer);

      expect(['easy', 'normal']).toContain(weakEvent.difficulty);
      expect(['normal', 'hard']).toContain(strongEvent.difficulty);
      expect(['hard', 'legendary']).toContain(godlikeEvent.difficulty);
    });

    test('should scale effect values based on difficulty', () => {
      const testChoices = [
        { text: 'Test', effect: { gold: [100, 200], health: [-10, -5] } }
      ];

      const weakContext = { power_level: 25 };
      const strongContext = { power_level: 200 };

      const weakScaled = generator.scaleEffectsForDifficulty(testChoices, weakContext);
      const strongScaled = generator.scaleEffectsForDifficulty(testChoices, strongContext);

      expect(weakScaled[0].effect.gold[0]).toBe(150);
      expect(weakScaled[0].effect.gold[1]).toBe(300);

      expect(strongScaled[0].effect.gold[0]).toBe(80);
      expect(strongScaled[0].effect.gold[1]).toBe(160);

      expect(strongScaled[0].effect.health[0]).toBe(-13);
      expect(strongScaled[0].effect.health[1]).toBe(-6);
    });

    test('should calculate appropriate difficulty tiers', () => {
      expect(generator.calculateDifficultyTier(25)).toBe('easy');
      expect(generator.calculateDifficultyTier(100)).toBe('normal');
      expect(generator.calculateDifficultyTier(200)).toBe('hard');
      expect(generator.calculateDifficultyTier(500)).toBe('legendary');
    });
  });

  describe('Time-Based Events', () => {
    test('should advance game time', () => {
      const initialTime = generator.getCurrentTime();

      generator.advanceGameDay();

      const newTime = generator.getCurrentTime();
      expect(newTime.day).toBe(initialTime.day + 1);
    });

    test('should change seasons appropriately', () => {
      expect(generator.getCurrentTime().season).toBe('spring');

      for (let i = 0; i < 90; i++) {
        generator.advanceGameDay();
      }

      expect(generator.getCurrentTime().season).toBe('summer');
    });

    test('should start time-based chains', () => {
      const result = generator.startTimeBasedChain('POLITICAL_UPRISING');
      expect(result).toBe(true);

      const activeChains = generator.getActiveTimeChains();
      expect(activeChains.length).toBeGreaterThan(0);
      expect(activeChains[0].name).toBe('Political Uprising');
    });

    test('should trigger time-based chain events', () => {
      generator.startTimeBasedChain('POLITICAL_UPRISING');

      const events = generator.advanceGameDay();
      expect(events.length).toBeGreaterThan(0);

      const chainEvent = events.find(e => e.type === 'time_based_chain');
      expect(chainEvent).toBeDefined();
      expect(chainEvent.template).toHaveProperty('title');
    });

    test('should save and load game state', () => {
      const initialTime = generator.getCurrentTime();
      generator.startTimeBasedChain('POLITICAL_UPRISING');

      const gameState = generator.getGameState();
      expect(gameState).toHaveProperty('timeSystem');
      expect(gameState).toHaveProperty('activeChains');

      const newGenerator = new RPGEventGenerator();
      const loadResult = newGenerator.loadGameState(gameState);

      expect(loadResult).toBe(true);
      expect(newGenerator.getCurrentTime().day).toBe(initialTime.day);
      expect(newGenerator.getActiveTimeChains().length).toBe(1);
    });

    test('should generate time-aware events', () => {
      const timeEvent = generator.generateTimeAwareEvent();
      expect(timeEvent).toHaveProperty('timeInfo');
      expect(timeEvent.timeInfo).toHaveProperty('season');
      expect(timeEvent.timeInfo).toHaveProperty('day');
    });
  });

  describe('Modular Event System', () => {
    test('should register custom event templates', () => {
      const customTemplate = {
        title: 'Custom Quest',
        narrative: 'A mysterious figure offers you a quest.',
        choices: [
          { text: 'Accept', effect: { reputation: 10 } },
          { text: 'Decline', effect: {} }
        ]
      };

      const result = generator.registerEventTemplate('CUSTOM_QUEST', customTemplate);
      expect(result).toBe(true);

      const customTemplates = generator.getCustomTemplates();
      expect(customTemplates).toContain('CUSTOM_QUEST');
    });

    test('should reject invalid templates', () => {
      const invalidTemplate = { title: 'Test' };
      const result = generator.registerEventTemplate('INVALID', invalidTemplate);
      expect(result).toBe(false);
    });

    test('should prevent duplicate template registration', () => {
      const template = {
        title: 'Test',
        narrative: 'Test narrative',
        choices: [{ text: 'OK', effect: {} }]
      };

      generator.registerEventTemplate('TEST_DUPLICATE', template);
      const duplicateResult = generator.registerEventTemplate('TEST_DUPLICATE', template);
      expect(duplicateResult).toBe(false);
    });

    test('should allow template override', () => {
      const template1 = {
        title: 'Original',
        narrative: 'Original narrative',
        choices: [{ text: 'OK', effect: {} }]
      };

      const template2 = {
        title: 'Override',
        narrative: 'Override narrative',
        choices: [{ text: 'Accept', effect: { gold: 100 } }]
      };

      generator.registerEventTemplate('OVERRIDE_TEST', template1);
      const overrideResult = generator.registerEventTemplate('OVERRIDE_TEST', template2, true);
      expect(overrideResult).toBe(true);
    });

    test('should unregister custom templates', () => {
      generator.registerEventTemplate('TO_REMOVE', {
        title: 'To Remove',
        narrative: 'Will be removed',
        choices: [{ text: 'OK', effect: {} }]
      });

      const initialCount = generator.getCustomTemplates().length;
      const removeResult = generator.unregisterEventTemplate('TO_REMOVE');
      const finalCount = generator.getCustomTemplates().length;

      expect(removeResult).toBe(true);
      expect(finalCount).toBe(initialCount - 1);
    });

    test('should add custom training data', () => {
      const initialTemplates = generator.getCustomTemplates().length;
      const addResult = generator.addCustomTrainingData(
        ['A mystical portal opens', 'Ancient magic surges through the air'],
        'mystical'
      );

      expect(addResult).toBe(true);
      expect(generator.getCustomTemplates().length).toBe(initialTemplates);
    });

    test('should register custom event chains', () => {
      const customChain = {
        name: 'Custom Adventure',
        description: 'A user-created storyline',
        stages: [
          { day: 1, template: 'COURT_SCANDAL' },
          { day: 3, template: 'BANDIT_KING' }
        ]
      };

      const result = generator.registerEventChain('CUSTOM_ADVENTURE', customChain);
      expect(result).toBe(true);

      const customChains = generator.getCustomChains();
      expect(customChains).toContain('CUSTOM_ADVENTURE');
    });

    test('should reject invalid chains', () => {
      const invalidChain = { name: 'Test' };
      const result = generator.registerEventChain('INVALID_CHAIN', invalidChain);
      expect(result).toBe(false);
    });

    test('should export and import custom content', () => {
      generator.registerEventTemplate('EXPORT_TEST', {
        title: 'Export Test',
        narrative: 'Testing export functionality',
        choices: [{ text: 'OK', effect: {} }]
      });

      generator.addCustomTrainingData(['Export test data'], 'export');

      generator.registerEventChain('EXPORT_CHAIN', {
        name: 'Export Chain',
        description: 'Testing chain export',
        stages: [{ day: 1, template: 'EXPORT_TEST' }]
      });

      const exported = generator.exportCustomContent();
      expect(exported.templates).toHaveProperty('EXPORT_TEST');
      expect(exported.trainingData).toHaveProperty('export');
      expect(exported.chains).toHaveProperty('EXPORT_CHAIN');

      const newGenerator = new RPGEventGenerator();
      const importResults = newGenerator.importCustomContent(exported);

      expect(importResults.templates.success).toBe(1);
      expect(importResults.trainingData.success).toBe(1);
      expect(importResults.chains.success).toBe(1);

      expect(newGenerator.getCustomTemplates()).toContain('EXPORT_TEST');
      expect(newGenerator.getCustomChains()).toContain('EXPORT_CHAIN');
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid context gracefully', () => {
      const event = generator.generateEvent(null);
      expect(event).toHaveProperty('id');
    });

    test('should handle extreme values', () => {
      const extremeContext = {
        age: 1000,
        gold: -999999,
        influence: 999999
      };

      const event = generator.generateEvent(extremeContext);
      expect(event).toHaveProperty('description');
    });

    test('should handle invalid theme gracefully', () => {
      const invalidThemeGen = new RPGEventGenerator({ theme: 'invalid' });
      const event = invalidThemeGen.generateEvent();

      expect(event).toHaveProperty('description');
      expect(invalidThemeGen.theme).toBe('invalid');
    });

    test('should handle invalid culture gracefully', () => {
      const invalidCultureGen = new RPGEventGenerator({
        theme: 'fantasy',
        culture: 'invalid'
      });
      const event = invalidCultureGen.generateEvent();

      expect(event).toHaveProperty('description');
    });
  });

  describe('Enhanced Features (v1.2.0)', () => {
    describe('Multi-Language Support', () => {
      test('should initialize with English by default', () => {
        const generator = new RPGEventGenerator();
        expect(generator.language).toBe('en');
        expect(generator.locales.has('en')).toBe(true);
      });

      test('should load and switch languages', () => {
        const generator = new RPGEventGenerator();

        const spanishPack = {
          ui: {
            'choice.fight': 'Luchar',
            'choice.flee': 'Huir'
          }
        };

        generator.loadLanguagePack('es', spanishPack);
        expect(generator.locales.has('es')).toBe(true);

        generator.setLanguage('es');
        expect(generator.language).toBe('es');

        expect(generator.translate('choice.fight')).toBe('Luchar');
        expect(generator.translate('choice.flee')).toBe('Huir');
      });

      test('should fallback to English for missing translations', () => {
        const generator = new RPGEventGenerator();
        generator.setLanguage('es');
        expect(generator.translate('event.title.default')).toBe('Unexpected Event');
      });

      test('should handle variable substitution in translations', () => {
        const generator = new RPGEventGenerator();
        generator.loadLanguagePack('test', {
          ui: {
            'greeting': 'Hello {{name}}, welcome to {{place}}!'
          }
        });
        generator.setLanguage('test');

        const result = generator.translate('greeting', { name: 'Hero', place: 'the tavern' });
        expect(result).toBe('Hello Hero, welcome to the tavern!');
      });
    });

    describe('Environmental Modifiers', () => {
      test('should initialize built-in modifiers', () => {
        const generator = new RPGEventGenerator({ enableModifiers: true });
        expect(generator.modifiers.has('rain')).toBe(true);
        expect(generator.modifiers.has('storm')).toBe(true);
        expect(generator.modifiers.has('winter')).toBe(true);
        expect(generator.modifiers.has('summer')).toBe(true);
      });

      test('should apply weather modifiers to events', () => {
        const generator = new RPGEventGenerator({ enableModifiers: true });

        const baseEvent = {
          title: 'A Journey',
          description: 'You travel through the land.',
          choices: [{
            text: 'Continue',
            effect: { health: 0 }
          }]
        };

        generator.setEnvironmentalContext({ weather: 'rain' });
        const modifiedEvent = generator.applyModifiers(baseEvent);

        expect(modifiedEvent.description).toContain('gloomy');
        expect(modifiedEvent.choices[0].effect.health).toBe(-2);
      });

      test('should apply seasonal modifiers', () => {
        const generator = new RPGEventGenerator({ enableModifiers: true });

        const baseEvent = {
          title: 'Winter Journey',
          description: 'You travel in winter.',
          choices: [{
            text: 'Continue',
            effect: { health: 10 }
          }]
        };

        generator.setEnvironmentalContext({ season: 'winter' });
        const modifiedEvent = generator.applyModifiers(baseEvent);

        expect(modifiedEvent.description).toContain('bleak');
        expect(modifiedEvent.choices[0].effect.health).toBe(15);
      });

      test('should combine multiple modifiers', () => {
        const generator = new RPGEventGenerator({ enableModifiers: true });

        const baseEvent = {
          title: 'Storm in Winter',
          description: 'A terrible storm rages in winter.',
          choices: [{
            text: 'Continue',
            effect: { health: 10 }
          }]
        };

        generator.setEnvironmentalContext({ weather: 'storm', season: 'winter' });
        const modifiedEvent = generator.applyModifiers(baseEvent);

        expect(modifiedEvent.description).toContain('chaos');
        expect(modifiedEvent.description).toContain('bleak');
        expect(modifiedEvent.choices[0].effect.health).toBe(7);
      });

      test('should not apply modifiers when disabled', () => {
        const generator = new RPGEventGenerator({ enableModifiers: false });

        const baseEvent = {
          title: 'A Journey',
          description: 'You travel through the land.',
          choices: [{ text: 'Continue', effect: { health: 0 } }]
        };

        generator.setEnvironmentalContext({ weather: 'rain' });
        const modifiedEvent = generator.applyModifiers(baseEvent);

        expect(modifiedEvent).toEqual(baseEvent);
      });
    });

    describe('Event Dependencies', () => {
      test('should register and check event completion dependencies', () => {
        const generator = new RPGEventGenerator({ enableDependencies: true });

        generator.registerEventDependency('ROYAL_BALL', {
          type: 'event_completed',
          eventId: 'COURT_INTRODUCTION'
        });

        const gameState = { completedEvents: new Set(['COURT_INTRODUCTION']) };
        expect(generator.checkEventDependencies('ROYAL_BALL', gameState)).toBe(true);

        const emptyGameState = { completedEvents: new Set() };
        expect(generator.checkEventDependencies('ROYAL_BALL', emptyGameState)).toBe(false);
      });

      test('should handle stat requirement dependencies', () => {
        const generator = new RPGEventGenerator({ enableDependencies: true });

        generator.registerEventDependency('ADVANCED_QUEST', {
          type: 'stat_requirement',
          stat: 'level',
          min: 10
        });

        const highLevelState = { player: { level: 15 } };
        expect(generator.checkEventDependencies('ADVANCED_QUEST', highLevelState)).toBe(true);

        const lowLevelState = { player: { level: 5 } };
        expect(generator.checkEventDependencies('ADVANCED_QUEST', lowLevelState)).toBe(false);
      });

      test('should handle complex AND conditions', () => {
        const generator = new RPGEventGenerator({ enableDependencies: true });

        generator.registerEventDependency('ELITE_MISSION', {
          operator: 'AND',
          conditions: [
            { type: 'stat_requirement', stat: 'level', min: 20 },
            { type: 'event_completed', eventId: 'BASIC_TRAINING' }
          ]
        });

        const completeState = {
          player: { level: 25 },
          completedEvents: new Set(['BASIC_TRAINING'])
        };
        expect(generator.checkEventDependencies('ELITE_MISSION', completeState)).toBe(true);

        const incompleteState = {
          player: { level: 25 },
          completedEvents: new Set()
        };
        expect(generator.checkEventDependencies('ELITE_MISSION', incompleteState)).toBe(false);
      });

      test('should handle OR conditions', () => {
        const generator = new RPGEventGenerator({ enableDependencies: true });

        generator.registerEventDependency('SOCIAL_EVENT', {
          operator: 'OR',
          conditions: [
            { type: 'stat_requirement', stat: 'reputation', min: 75 },
            { type: 'stat_requirement', stat: 'gold', min: 1000 }
          ]
        });

        const highRepState = { player: { reputation: 80 } };
        expect(generator.checkEventDependencies('SOCIAL_EVENT', highRepState)).toBe(true);

        const wealthyState = { player: { gold: 1500 } };
        expect(generator.checkEventDependencies('SOCIAL_EVENT', wealthyState)).toBe(true);

        const poorState = { player: { reputation: 30, gold: 100 } };
        expect(generator.checkEventDependencies('SOCIAL_EVENT', poorState)).toBe(false);
      });

      test('should not check dependencies when disabled', () => {
        const generator = new RPGEventGenerator({ enableDependencies: false });
        generator.registerEventDependency('TEST_EVENT', { type: 'event_completed', eventId: 'TEST' });
        expect(generator.checkEventDependencies('TEST_EVENT', {})).toBe(true);
      });
    });

    describe('NPC Relationships', () => {
      test('should add and track NPCs', () => {
        const generator = new RPGEventGenerator({ enableRelationships: true });

        generator.addNPC({
          id: 'merchant_john',
          name: 'Merchant John',
          type: 'merchant'
        });

        expect(generator.relationships.has('merchant_john')).toBe(true);
        const npc = generator.relationships.get('merchant_john');
        expect(npc.name).toBe('Merchant John');
        expect(npc.type).toBe('merchant');
      });

      test('should update relationship strength', () => {
        const generator = new RPGEventGenerator({ enableRelationships: true });

        generator.addNPC({ id: 'guard_captain', name: 'Captain Valeria' });

        generator.updateRelationship('guard_captain', 'player', 25, 'helped in battle');
        const relationship = generator.getRelationship('guard_captain', 'player');
        expect(relationship.strength).toBe(25);
        expect(relationship.type).toBe('acquaintance');
      });

      test('should apply relationship evolution rules', () => {
        const generator = new RPGEventGenerator({ enableRelationships: true });

        generator.addNPC({ id: 'villager_sue', name: 'Sue the Villager' });

        generator.applyRelationshipRule('villager_sue', 'player', 'save_life');
        const relationship = generator.getRelationship('villager_sue', 'player');
        expect(relationship.strength).toBe(25);
      });

      test('should handle relationship history', () => {
        const generator = new RPGEventGenerator({ enableRelationships: true });

        generator.addNPC({ id: 'nobleman', name: 'Lord Harrington' });

        generator.updateRelationship('nobleman', 'player', 10, 'small favor');
        generator.updateRelationship('nobleman', 'player', -5, 'minor insult');

        const npc = generator.relationships.get('nobleman');
        expect(npc.history).toHaveLength(2);
        expect(npc.history[0].change).toBe(10);
        expect(npc.history[1].change).toBe(-5);
      });

      test('should clamp relationship strength to valid range', () => {
        const generator = new RPGEventGenerator({ enableRelationships: true });

        generator.addNPC({ id: 'test_npc', name: 'Test NPC' });

        generator.updateRelationship('test_npc', 'player', 200, 'amazing deed');
        let relationship = generator.getRelationship('test_npc', 'player');
        expect(relationship.strength).toBe(100);

        generator.updateRelationship('test_npc', 'player', -300, 'terrible betrayal');
        relationship = generator.getRelationship('test_npc', 'player');
        expect(relationship.strength).toBe(-100);
      });

      test('should not process relationships when disabled', () => {
        const generator = new RPGEventGenerator({ enableRelationships: false });

        generator.addNPC({ id: 'test', name: 'Test' });
        generator.updateRelationship('test', 'player', 10, 'test');

        expect(generator.relationships.size).toBe(0);
      });
    });

    describe('Enhanced Event Generation', () => {
      test('should generate enhanced events with all features enabled', () => {
        const generator = new RPGEventGenerator({
          enableModifiers: true,
          enableRelationships: true,
          enableDependencies: true
        });

        const context = {
          player: { id: 'player', level: 10 },
          environment: { weather: 'clear', season: 'spring' },
          gameState: { completedEvents: new Set(['TUTORIAL']) }
        };

        const event = generator.generateEnhancedEvent(context);

        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('choices');
      });

      test('should apply modifiers in enhanced generation', () => {
        const generator = new RPGEventGenerator({ enableModifiers: true });

        const context = {
          environment: { weather: 'rain' }
        };

        const event = generator.generateEnhancedEvent(context);

        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
      });

      test('should include relationship context when available', () => {
        const generator = new RPGEventGenerator({ enableRelationships: true });

        generator.addNPC({ id: 'king', name: 'King Arthur' });
        generator.updateRelationship('king', 'player', 80, 'loyal service');

        const context = {
          player: { id: 'player' }
        };

        const event = generator.generateEnhancedEvent(context);

        expect(event).toHaveProperty('description');
      });

      test('should maintain backward compatibility', () => {
        const enhancedGenerator = new RPGEventGenerator({
          enableModifiers: true,
          enableRelationships: true,
          enableDependencies: true
        });

        const legacyGenerator = new RPGEventGenerator();

        // Both should generate valid events
        const enhancedEvent = enhancedGenerator.generateEvent();
        const legacyEvent = legacyGenerator.generateEvent();

        expect(enhancedEvent).toHaveProperty('title');
        expect(legacyEvent).toHaveProperty('title');
        expect(enhancedEvent.choices).toHaveLength(legacyEvent.choices.length);
      });
    });
  });

  describe('Event Templates Library (v1.3.0)', () => {
    describe('Template Loading', () => {
      test('should initialize template system without errors', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });

        expect(generator.enableTemplates).toBe(true);
        expect(generator.templateLibrary).toBe('fantasy');
      });

      test('should load templates from valid genres', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });

        const templates = generator.getAvailableTemplates();
        expect(templates).toHaveProperty('fantasy');
        expect(Array.isArray(templates.fantasy)).toBe(true);
        expect(templates.fantasy.length).toBeGreaterThan(0);
      });

      test('should handle invalid template genres gracefully', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'nonexistent_genre'
        });

        const templates = generator.getAvailableTemplates();
        expect(Object.keys(templates)).toHaveLength(0);
      });
    });

    describe('Template Generation', () => {
      let templateGenerator;

      beforeEach(() => {
        templateGenerator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });
      });

      test('should generate event from specific template', () => {
        const event = templateGenerator.generateFromTemplate('dragon_lair');

        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('choices');
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('difficulty');
        expect(event.title).toContain('Ancient Dragon');
        expect(event.type).toBe('TREASURE_HUNT');
      });

      test('should generate random event from genre', () => {
        const event = templateGenerator.generateFromGenre('fantasy');

        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('choices');
        expect(Array.isArray(event.choices)).toBe(true);
        expect(event.choices.length).toBeGreaterThan(0);
      });

      test('should throw error for non-existent template', () => {
        expect(() => {
          templateGenerator.generateFromTemplate('nonexistent_template');
        }).toThrow('Template \'fantasy:nonexistent_template\' not found');
      });

      test('should throw error for non-existent genre', () => {
        expect(() => {
          templateGenerator.generateFromGenre('nonexistent_genre');
        }).toThrow('No templates found for genre \'nonexistent_genre\'');
      });

      test('should include context enhancements when provided', () => {
        const context = {
          player: { level: 10 },
          environment: { weather: 'stormy' }
        };

        const event = templateGenerator.generateFromTemplate('dragon_lair', context);

        expect(event).toHaveProperty('playerContext');
        expect(event).toHaveProperty('environment');
        expect(event.playerContext.level).toBe(10);
        expect(event.environment.weather).toBe('stormy');
      });
    });

    describe('Template Structure Validation', () => {
      test('should generate events with valid choice structure', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });

        const event = generator.generateFromTemplate('dragon_lair');

        event.choices.forEach(choice => {
          expect(choice).toHaveProperty('text');
          expect(choice).toHaveProperty('effect');
          expect(choice).toHaveProperty('consequence');
          expect(typeof choice.text).toBe('string');
          expect(typeof choice.effect).toBe('object');
        });
      });

      test('should generate events with valid difficulty levels', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });

        const event = generator.generateFromTemplate('dragon_lair');

        expect(['easy', 'medium', 'hard', 'legendary']).toContain(event.difficulty);
      });

      test('should generate events with proper metadata', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });

        const event = generator.generateFromTemplate('dragon_lair');

        expect(event).toHaveProperty('tags');
        expect(Array.isArray(event.tags)).toBe(true);
        expect(event.tags.length).toBeGreaterThan(0);
      });
    });

    describe('Cross-Genre Compatibility', () => {
      test('should support multiple genres', () => {
        const sciFiGenerator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'sci-fi'
        });

        const horrorGenerator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'horror'
        });

        const historicalGenerator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'historical'
        });

        const sciFiTemplates = sciFiGenerator.getAvailableTemplates();
        const horrorTemplates = horrorGenerator.getAvailableTemplates();
        const historicalTemplates = historicalGenerator.getAvailableTemplates();

        expect(Object.keys(sciFiTemplates)).toContain('sci-fi');
        expect(Object.keys(horrorTemplates)).toContain('horror');
        expect(Object.keys(historicalTemplates)).toContain('historical');
      });

      test('should maintain genre-specific event characteristics', () => {
        const horrorGenerator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'horror'
        });

        const event = horrorGenerator.generateFromGenre('horror');

        // Check that horror events have appropriate tags
        expect(Array.isArray(event.tags)).toBe(true);
        expect(event.tags.length).toBeGreaterThan(0);
        // At least one tag should be horror-related
        const horrorTags = ['supernatural', 'fear', 'horror', 'terror', 'ghosts', 'haunted', 'cursed'];
        const hasHorrorTag = event.tags.some(tag => horrorTags.includes(tag));
        expect(hasHorrorTag).toBe(true);
      });
    });
  });

  describe('v2.0.0 Features', () => {
    describe('Rule Engine', () => {
      test('should initialize with rule engine enabled', () => {
        const ruleGenerator = new RPGEventGenerator({ enableRuleEngine: true });
        expect(ruleGenerator.enableRuleEngine).toBe(true);
        expect(ruleGenerator.customRules).toEqual({});
      });

      test('should add and validate custom rules', () => {
        const generator = new RPGEventGenerator({ enableRuleEngine: true });

        const validRule = {
          conditions: [
            { type: 'stat_greater_than', params: { stat: 'wealth', value: 1000 } }
          ],
          effects: {
            addTags: ['wealthy']
          }
        };

        const validation = generator.validateCustomRule(validRule);
        expect(validation.valid).toBe(true);

        generator.addCustomRule('wealthy_rule', validRule);
        expect(generator.getCustomRules()).toHaveProperty('wealthy_rule');
      });

      test('should reject invalid rules', () => {
        const generator = new RPGEventGenerator({ enableRuleEngine: true });

        const invalidRule = {
          conditions: 'not an array',
          effects: 'not an object'
        };

        const validation = generator.validateCustomRule(invalidRule);
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });

      test('should apply rules based on conditions', () => {
        const generator = new RPGEventGenerator({
          enableRuleEngine: true,
          enableTemplates: true
        });

        const wealthyRule = {
          conditions: [
            { type: 'stat_greater_than', params: { stat: 'wealth', value: 500 } }
          ],
          effects: {
            addTags: ['wealthy_player']
          }
        };

        generator.addCustomRule('wealth_test', wealthyRule);

        const wealthyEvent = generator.generateEvent({ gold: 1000 });
        const poorEvent = generator.generateEvent({ gold: 100 });

        expect(wealthyEvent.tags).toContain('wealthy_player');
        expect(poorEvent.tags).not.toContain('wealthy_player');
      });

      test('should handle complex rule conditions', () => {
        const generator = new RPGEventGenerator({ enableRuleEngine: true });

        const complexRule = {
          conditions: [
            { type: 'and', params: {
              conditions: [
                { type: 'stat_greater_than', params: { stat: 'wealth', value: 500 } },
                { type: 'career_is', params: { career: 'noble' } }
              ]
            }}
          ],
          effects: {
            modifyTitle: { append: ' (Noble Privilege)' }
          }
        };

        generator.addCustomRule('noble_wealth', complexRule);

        const nobleEvent = generator.generateEvent({ gold: 1000, career: 'noble' });
        const commonerEvent = generator.generateEvent({ gold: 1000, career: 'merchant' });

        expect(nobleEvent.title).toContain('(Noble Privilege)');
        expect(commonerEvent.title).not.toContain('(Noble Privilege)');
      });

      test('should manage rule lifecycle', () => {
        const generator = new RPGEventGenerator({ enableRuleEngine: true });

        generator.addCustomRule('test_rule', { conditions: [], effects: {} });
        expect(Object.keys(generator.getCustomRules())).toHaveLength(1);

        generator.removeCustomRule('test_rule');
        expect(Object.keys(generator.getCustomRules())).toHaveLength(0);

        generator.addCustomRule('rule1', { conditions: [], effects: {} });
        generator.addCustomRule('rule2', { conditions: [], effects: {} });
        expect(Object.keys(generator.getCustomRules())).toHaveLength(2);

        generator.clearCustomRules();
        expect(Object.keys(generator.getCustomRules())).toHaveLength(0);
      });
    });

    describe('Pure Markov Mode', () => {
      test('should initialize in pure Markov mode', () => {
        const generator = new RPGEventGenerator({
          pureMarkovMode: true,
          trainingData: ['Test sentence one.', 'Test sentence two.']
        });

        expect(generator.pureMarkovMode).toBe(true);
        expect(generator.enableTemplates).toBe(false);
      });

      test('should generate events purely from Markov chains', () => {
        const customData = ['The hero fights bravely', 'The dragon breathes fire', 'The knight charges forward'];
        const generator = new RPGEventGenerator({
          pureMarkovMode: true,
          trainingData: customData
        });

        const event = generator.generateEvent();

        expect(event.type).toBe('MARKOV_GENERATED');
        expect(event.title).toBeTruthy();
        expect(event.description).toBeTruthy();
        expect(Array.isArray(event.choices)).toBe(true);
        expect(event.choices.length).toBeGreaterThan(0);
      });

      test('should use custom training data in generation', () => {
        const uniqueData = ['Xylophone wizard magic', 'Quantum cheese paradox', 'Banana spaceship captain'];
        const generator = new RPGEventGenerator({
          pureMarkovMode: true,
          trainingData: uniqueData
        });

        const event = generator.generateEvent();

        // Check that the generated content contains words from our training data
        const allText = event.title + ' ' + event.description;
        const hasTrainingWords = uniqueData.some(sentence =>
          sentence.split(' ').some(word =>
            allText.toLowerCase().includes(word.toLowerCase())
          )
        );

        expect(hasTrainingWords).toBe(true);
      });

      test('should generate different events each time', () => {
        const generator = new RPGEventGenerator({
          pureMarkovMode: true,
          trainingData: ['The quick brown fox', 'Jumps over the lazy dog']
        });

        const event1 = generator.generateEvent();
        const event2 = generator.generateEvent();

        // Events should be different (though there's a small chance they're the same)
        const eventsDifferent = event1.title !== event2.title || event1.description !== event2.description;
        expect(eventsDifferent).toBe(true);
      });
    });

    describe('Theme Creation', () => {
      test('should create generator with custom theme', () => {
        const customTraining = ['Space cowboys ride starships', 'Laser guns fire in the void', 'Alien saloons serve cosmic beer'];
        const generator = new RPGEventGenerator({
          trainingData: customTraining,
          theme: 'sci-fi',
          culture: 'western'
        });

        expect(generator.theme).toBe('sci-fi');
        expect(generator.culture).toBe('western');
      });

      test('should handle null theme for pure custom generation', () => {
        const generator = new RPGEventGenerator({
          theme: null,
          trainingData: ['Custom story elements here']
        });

        expect(generator.theme).toBe(null);
      });

      test('should integrate theme creation with rule engine', () => {
        const trainingData = ['Medieval knights duel', 'Castles dot the landscape', 'Dragons guard ancient hoards'];
        const generator = new RPGEventGenerator({
          trainingData: trainingData,
          enableRuleEngine: true,
          pureMarkovMode: false // Use template enhancement
        });

        // Add a rule
        generator.addCustomRule('knight_bonus', {
          conditions: [{ type: 'career_is', params: { career: 'knight' } }],
          effects: { addTags: ['knight_special'] }
        });

        const knightEvent = generator.generateEvent({ career: 'knight' });
        const merchantEvent = generator.generateEvent({ career: 'merchant' });

        expect(knightEvent.tags).toContain('knight_special');
        expect(merchantEvent.tags).not.toContain('knight_special');
      });
    });

    describe('Cross-Platform Export Integration', () => {
      test('should maintain functionality after export preparation', () => {
        const generator = new RPGEventGenerator({
          enableRuleEngine: true,
          enableTemplates: true
        });

        // Add a rule to test rule export compatibility
        generator.addCustomRule('export_test', {
          conditions: [{ type: 'stat_greater_than', params: { stat: 'wealth', value: 100 } }],
          effects: { addTags: ['export_compatible'] }
        });

        const event = generator.generateEvent({ gold: 200 });
        expect(event.tags).toContain('export_compatible');
      });

      test('should handle template loading for export', () => {
        const generator = new RPGEventGenerator({
          enableTemplates: true,
          templateLibrary: 'fantasy'
        });

        expect(generator.enableTemplates).toBe(true);
        expect(generator.templateLibrary).toBe('fantasy');

        const event = generator.generateEvent();
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('title');
      });
    });

    describe('Backward Compatibility', () => {
      test('should maintain v1.x functionality', () => {
        // Test that all existing functionality still works
        const generator = new RPGEventGenerator();

        const event = generator.generateEvent();
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('choices');
        expect(Array.isArray(event.choices)).toBe(true);

        const multipleEvents = generator.generateEvents({}, 3);
        expect(multipleEvents).toHaveLength(3);
      });

      test('should work without new features enabled', () => {
        const generator = new RPGEventGenerator({
          enableRuleEngine: false,
          enableModifiers: false,
          enableRelationships: false
        });

        expect(generator.enableRuleEngine).toBe(false);

        const event = generator.generateEvent();
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
      });
    });
  });
});
