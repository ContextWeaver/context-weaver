const { RPGEventGenerator } = require('../src/RPGEventGenerator');

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
      const validTypes = ['ADVENTURE', 'COMBAT', 'ECONOMIC', 'EXPLORATION', 'GUILD', 'MAGIC', 'MYSTERY',
                         'POLITICAL', 'QUEST', 'SOCIAL', 'SPELLCASTING', 'SUPERNATURAL', 'TECHNOLOGICAL', 'UNDERWORLD'];

      for (let i = 0; i < 20; i++) {
        const event = generator.generateEvent();
        expect(validTypes).toContain(event.type);
      }
    });
  });

  describe('Context-Aware Generation', () => {
    test('should adapt to wealthy players', () => {
      const wealthyContext = { gold: 2000, influence: 30 };
      const event = generator.generateEvent(wealthyContext);

      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('context');
      expect(event.context.gold).toBe(2000);
      expect(event.context.influence).toBe(30);
    });

    test('should adapt to skilled players', () => {
      const skilledContext = { level: 15, skills: { combat: 80, social: 60 } };
      const event = generator.generateEvent(skilledContext);

      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event.context.level).toBe(15);
    });

    test('should handle empty context', () => {
      const event = generator.generateEvent({});
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
    });
  });

  describe('Effect Resolution', () => {
    test('should handle effect objects', () => {
      const event = generator.generateEvent();
      event.choices.forEach(choice => {
        expect(choice).toHaveProperty('effect');
        expect(typeof choice.effect).toBe('object');
      });
    });
  });

  describe('Convenience Functions', () => {
    test('generateRPGEvent should work', () => {
      const { generateRPGEvent } = require('../src/index');
      const event = generateRPGEvent({
        age: 25,
        gold: 500,
        influence: 15,
        career: 'merchant'
      });

      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('choices');
    });

    test('should generate multiple events', () => {
      const events = generator.generateEvents({}, 3);
      expect(events).toHaveLength(3);
      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
      });
    });
  });

  describe('Training Data', () => {
    test('should handle training data', () => {
      const genWithData = new RPGEventGenerator({
        trainingData: ['Custom training data']
      });
      expect(genWithData).toBeTruthy();
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
        gold: 1000000,
        influence: 1000
      };
      const event = generator.generateEvent(extremeContext);
      expect(event).toHaveProperty('title');
    });
  });
});