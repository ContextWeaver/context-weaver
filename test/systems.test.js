const { ChainSystem } = require('../src/chains');
const { RuleEngine } = require('../src/rules');
const { EnvironmentalSystem } = require('../src/environment');
const { TimeSystem } = require('../src/time');
const { RelationshipSystem } = require('../src/relationships');

describe('Feature Systems', () => {
  describe('ChainSystem', () => {
    let chainSystem;

    beforeEach(() => {
      chainSystem = new ChainSystem();
    });

    test('should initialize with built-in chains', () => {
      const chains = chainSystem.getAvailableChains();
      expect(Object.keys(chains).length).toBeGreaterThan(0);
    });

    test('should register a new chain', () => {
      const chainDef = {
        name: 'Test Chain',
        description: 'A test chain',
        stages: [
          { day: 1, template: 'TEST_EVENT_1' },
          { day: 3, template: 'TEST_EVENT_2' }
        ]
      };

      const result = chainSystem.registerChain('test_chain', chainDef);
      expect(result).toBe(true);

      const chains = chainSystem.getAvailableChains();
      expect(chains).toHaveProperty('test_chain');
    });

    test('should start a chain', () => {
      const context = { level: 5 };
      const event = chainSystem.startChain('BANDIT_RISING', context);

      expect(event).toBeDefined();
      expect(event).toHaveProperty('chainId');
      expect(typeof event.chainId).toBe('string');
    });

    test('should advance a chain', () => {
      const context = { level: 5 };
      const startEvent = chainSystem.startChain('BANDIT_RISING', context);
      expect(startEvent).toBeDefined();
      
      const activeChains = chainSystem.getActiveChains();
      expect(activeChains.length).toBeGreaterThan(0);
      const chainId = activeChains[0].id;
      
      const progression = chainSystem.advanceChain(chainId, 'continue');
      expect(progression).toBeDefined();
    });

    test('should get active chains', () => {
      const context = { level: 5 };
      chainSystem.startChain('BANDIT_RISING', context);
      
      const activeChains = chainSystem.getActiveChains();
      expect(activeChains.length).toBeGreaterThan(0);
    });

    test('should end a chain', () => {
      const context = { level: 5 };
      chainSystem.startChain('BANDIT_RISING', context);
      chainSystem.endChain('BANDIT_RISING');
      
      const activeChains = chainSystem.getActiveChains();
      expect(activeChains.find(c => c.id === 'BANDIT_RISING')).toBeUndefined();
    });

    test('should handle non-existent chain', () => {
      const event = chainSystem.startChain('NON_EXISTENT', {});
      expect(event).toBeNull();
    });
  });

  describe('RuleEngine', () => {
    let ruleEngine;

    beforeEach(() => {
      ruleEngine = new RuleEngine();
    });

    test('should add a rule', () => {
      const rule = {
        conditions: [
          { type: 'stat_greater_than', params: { stat: 'level', value: 10 } }
        ],
        effects: {
          addTags: ['high_level']
        }
      };

      ruleEngine.addRule('high_level_rule', rule);
      const rules = ruleEngine.getRules();
      expect(rules).toHaveProperty('high_level_rule');
    });

    test('should remove a rule', () => {
      const rule = {
        conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 5 } }],
        effects: { addTags: ['test'] }
      };

      ruleEngine.addRule('test_rule', rule);
      const removed = ruleEngine.removeRule('test_rule');
      expect(removed).toBe(true);

      const rules = ruleEngine.getRules();
      expect(rules).not.toHaveProperty('test_rule');
    });

    test('should validate a rule', () => {
      const validRule = {
        conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 10 } }],
        effects: { addTags: ['test'] }
      };

      const result = ruleEngine.validateRule(validRule);
      expect(result.valid).toBe(true);
    });

    test('should process event with rules', () => {
      const rule = {
        conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 5 } }],
        effects: { addTags: ['experienced'] }
      };

      ruleEngine.addRule('experience_rule', rule);

      const event = {
        id: 'test',
        title: 'Test Event',
        description: 'Test',
        choices: [],
        type: 'TEST',
        context: { level: 10 }
      };

      const context = { level: 10 };
      const processed = ruleEngine.processEvent(event, context);

      expect(processed).toHaveProperty('tags');
      expect(processed.tags).toContain('experienced');
    });

    test('should handle invalid rule', () => {
      const invalidRule = {
        conditions: [],
        effects: {}
      };

      const result = ruleEngine.validateRule(invalidRule);
      const trulyInvalid = {
        conditions: null,
        effects: null
      };
      const invalidResult = ruleEngine.validateRule(trulyInvalid);
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('EnvironmentalSystem', () => {
    let envSystem;

    beforeEach(() => {
      envSystem = new EnvironmentalSystem();
    });

    test('should set environmental context', () => {
      const context = {
        weather: 'rain',
        season: 'winter',
        timeOfDay: 'night'
      };

      envSystem.setEnvironmentalContext(context);
      const active = envSystem.getActiveModifiers();
      expect(active.length).toBeGreaterThan(0);
    });

    test('should apply modifiers to event', () => {
      envSystem.setEnvironmentalContext({ weather: 'rain' });

      const event = {
        id: 'test',
        title: 'Test Event',
        description: 'A test event',
        choices: [
          { text: 'Continue', effect: { health: 10, movement: 100 } }
        ],
        type: 'TEST',
        context: {}
      };

      const modified = envSystem.applyModifiers(event);
      expect(modified).toHaveProperty('environmentalEffects');
      expect(modified.environmentalEffects.appliedModifiers.length).toBeGreaterThan(0);
    });

    test('should register custom modifier', () => {
      const modifier = {
        type: 'weather',
        effects: {
          health_drain: 1,
          movement_penalty: 0.1
        },
        text_modifiers: {
          atmosphere: 'mysterious'
        }
      };

      envSystem.registerModifier('fog', modifier);
      const modifiers = envSystem.getModifiers();
      expect(modifiers).toHaveProperty('fog');
    });

    test('should unregister modifier', () => {
      const modifier = {
        type: 'weather',
        effects: {},
        text_modifiers: {}
      };

      envSystem.registerModifier('test_mod', modifier);
      const removed = envSystem.unregisterModifier('test_mod');
      expect(removed).toBe(true);
    });

    test('should get stats', () => {
      const stats = envSystem.getStats();
      expect(stats).toHaveProperty('totalModifiers');
      expect(stats).toHaveProperty('activeModifiers');
      expect(stats).toHaveProperty('modifierTypes');
    });

    test('should check if modifier is active', () => {
      envSystem.setEnvironmentalContext({ weather: 'rain' });
      expect(envSystem.isModifierActive('rain')).toBe(true);
      expect(envSystem.isModifierActive('storm')).toBe(false);
    });
  });

  describe('TimeSystem', () => {
    let timeSystem;

    beforeEach(() => {
      timeSystem = new TimeSystem();
    });

    test('should initialize with default state', () => {
      const state = timeSystem.getState();
      expect(state).toHaveProperty('currentDay');
      expect(state).toHaveProperty('currentSeason');
      expect(state).toHaveProperty('gameYear');
    });

    test('should advance time', () => {
      const initialState = timeSystem.getState();
      timeSystem.advanceDays(5);
      const newState = timeSystem.getState();

      expect(newState.currentDay).toBe(initialState.currentDay + 5);
    });

    test('should get current time info', () => {
      const timeInfo = timeSystem.getCurrentTime();
      expect(timeInfo).toHaveProperty('day');
      expect(timeInfo).toHaveProperty('season');
      expect(timeInfo).toHaveProperty('year');
      expect(['spring', 'summer', 'autumn', 'winter']).toContain(timeInfo.season);
    });

    test('should handle seasonal changes', () => {
      const initialState = timeSystem.getState();
      timeSystem.advanceDays(100);
      const newState = timeSystem.getState();

      expect(newState).toHaveProperty('currentSeason');
      expect(['spring', 'summer', 'autumn', 'winter']).toContain(newState.currentSeason);
    });

    test('should get seasonal data', () => {
      const springData = timeSystem.getSeasonalData('spring');
      expect(springData).toBeDefined();
      expect(springData).toHaveProperty('templates');
      expect(springData).toHaveProperty('modifiers');
    });

    test('should get stats', () => {
      const stats = timeSystem.getStats();
      expect(stats).toHaveProperty('currentDay');
      expect(stats).toHaveProperty('currentSeason');
    });
  });

  describe('RelationshipSystem', () => {
    let relationshipSystem;

    beforeEach(() => {
      relationshipSystem = new RelationshipSystem();
    });

    test('should add an NPC', () => {
      const npc = {
        id: 'test_npc',
        name: 'Test NPC',
        type: 'merchant'
      };

      relationshipSystem.addNPC(npc);
      const npcs = relationshipSystem.getAllNPCs();
      expect(npcs.find(n => n.id === 'test_npc')).toBeDefined();
    });

    test('should update relationship', () => {
      const npc = {
        id: 'test_npc',
        name: 'Test NPC',
        type: 'merchant'
      };

      relationshipSystem.addNPC(npc);
      relationshipSystem.updateRelationship('test_npc', 'player', 10, 'helped');

      const relationship = relationshipSystem.getRelationship('test_npc', 'player');
      expect(relationship).toBeDefined();
      expect(relationship.strength).toBeGreaterThan(0);
    });

    test('should get relationship', () => {
      const npc = {
        id: 'test_npc',
        name: 'Test NPC',
        type: 'merchant'
      };

      relationshipSystem.addNPC(npc);
      relationshipSystem.updateRelationship('test_npc', 'player', 20, 'saved');

      const relationship = relationshipSystem.getRelationship('test_npc', 'player');
      expect(relationship).not.toBeNull();
      expect(relationship.strength).toBe(20);
    });

    test('should get relationship summary', () => {
      const npc = {
        id: 'test_npc',
        name: 'Test NPC',
        type: 'merchant'
      };

      relationshipSystem.addNPC(npc);
      relationshipSystem.updateRelationship('test_npc', 'player', 50, 'helped');

      const summary = relationshipSystem.getRelationshipSummary('test_npc');
      expect(summary).toHaveProperty('totalRelationships');
      expect(summary).toHaveProperty('averageStrength');
    });

    test('should remove NPC', () => {
      const npc = {
        id: 'test_npc',
        name: 'Test NPC',
        type: 'merchant'
      };

      relationshipSystem.addNPC(npc);
      const removed = relationshipSystem.removeNPC('test_npc');
      expect(removed).toBe(true);

      const npcs = relationshipSystem.getAllNPCs();
      expect(npcs.find(n => n.id === 'test_npc')).toBeUndefined();
    });

    test('should get stats', () => {
      const npc = {
        id: 'test_npc',
        name: 'Test NPC',
        type: 'merchant'
      };

      relationshipSystem.addNPC(npc);
      const stats = relationshipSystem.getStats();

      expect(stats).toHaveProperty('totalNPCs');
      expect(stats).toHaveProperty('totalRelationships');
      expect(stats).toHaveProperty('averageRelationshipsPerNPC');
    });
  });
});
