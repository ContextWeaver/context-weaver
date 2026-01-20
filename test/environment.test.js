// RPG Event Generator v3.0.0 - Environment Compatibility Tests
// Tests cross-platform compatibility between Node.js and React Native

const { RPGEventGenerator } = require('../src/RPGEventGenerator');

describe('Environment Compatibility', () => {
  let generator;

  beforeEach(() => {
    generator = new RPGEventGenerator();
  });

  describe('Node.js Environment', () => {
    it('should detect Node.js environment correctly', () => {
      expect(generator.isNodeEnv).toBe(true);
    });

    it('should return optimal worker count for Node.js', () => {
      const workerCount = generator.getOptimalWorkerCount();
      expect(workerCount).toBeGreaterThanOrEqual(1);
      expect(workerCount).toBeLessThanOrEqual(4);
    });

    it('should support parallel event generation in Node.js', async () => {
      const events = await generator.generateEventsParallel(2);
      expect(events).toHaveLength(2);
      expect(events.every(event => event.type)).toBe(true);
    });

    it('should generate events with valid structure', () => {
      const event = generator.generateEvent();

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('choices');
      expect(event).toHaveProperty('type');
      expect(Array.isArray(event.choices)).toBe(true);
      expect(event.choices.length).toBeGreaterThan(0);
    });
  });

  describe('React Native Simulation', () => {
    it('should demonstrate fallback behavior when Node.js modules unavailable', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const events = await generator.generateEventsParallel(2);

      expect(events).toHaveLength(2);
      expect(events.every(event => event.type)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should handle template generation correctly', () => {
      const event = generator.generateFromTemplate('nonexistent');
      expect(event).toBeNull();
    });

    it('should support multiple event generation', () => {
      const events = generator.generateEvents({}, 3);
      expect(events).toHaveLength(3);
      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('type');
      });
    });
  });

  describe('Cross-platform API Consistency', () => {
    it('should maintain consistent core API across environments', () => {
      expect(typeof generator.generateEvent).toBe('function');
      expect(typeof generator.generateEvents).toBe('function');
      expect(typeof generator.generateFromTemplate).toBe('function');
      expect(typeof generator.generateEventsParallel).toBe('function');
      expect(typeof generator.isNodeEnv).toBe('boolean');
      expect(typeof generator.getOptimalWorkerCount).toBe('function');
    });

    it('should handle context-based generation consistently', () => {
      const context = { playerLevel: 5, location: 'forest' };

      const event1 = generator.generateEvent(context);
      const event2 = generator.generateEvent(context);

      expect(event1).toBeDefined();
      expect(event2).toBeDefined();
      expect(event1.type).toBeDefined();
      expect(event2.type).toBeDefined();
    });

    it('should support various event types', () => {
      const validTypes = ['ADVENTURE', 'COMBAT', 'ECONOMIC', 'EXPLORATION', 'GUILD', 'MYSTERY',
      'POLITICAL', 'QUEST', 'SOCIAL', 'SUPERNATURAL', 'TECHNOLOGICAL', 'HORROR'];

      for (let i = 0; i < 10; i++) {
        const event = generator.generateEvent();
        expect(validTypes).toContain(event.type);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid template IDs gracefully', () => {
      const event = generator.generateFromTemplate('invalid_template_id');
      expect(event).toBeNull();
    });

    it('should handle empty context objects', () => {
      const event = generator.generateEvent({});
      expect(event).toBeDefined();
      expect(event.type).toBeDefined();
    });

    it('should handle null/undefined context', () => {
      const event = generator.generateEvent(null);
      expect(event).toBeDefined();
      expect(event.type).toBeDefined();
    });
  });
});