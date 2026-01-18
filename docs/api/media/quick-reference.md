# Quick Reference Guide

Fast-track reference for RPG Event Generator features and API.

## 🚀 Quick Start

```javascript
import { RPGEventGenerator, generateRPGEvent } from 'rpg-event-generator';

// One-liner
const event = generateRPGEvent({ level: 10, career: 'warrior' });

// Full generator
const generator = new RPGEventGenerator();
const event = generator.generateEvent({
  level: 10,
  career: 'warrior',
  location: 'forest'
});
```

## ⚙️ Configuration Options

```javascript
const generator = new RPGEventGenerator({
  // Core
  theme: 'fantasy',           // 'fantasy', 'sci-fi', 'historical'
  culture: 'medieval',        // Cultural variant
  language: 'en',             // 'en', 'es', 'fr'

  // Features
  enableRuleEngine: true,     // Conditional rules
  enableRelationships: true,  // NPC relationships
  enableDependencies: true,   // Event prerequisites
  enableModifiers: true,      // Environmental effects

  // Quality
  minQualityScore: 75,        // 0-100 quality threshold
  maxComplexity: 8,           // Max event choices/effects

  // Generation
  markovOrder: 2,             // Text coherence (1-4)
  creativity: 0.8             // Randomness factor (0-1)
});
```

## 📝 Event Structure

```javascript
{
  id: "event_1704567890123_xyz",    // Unique identifier
  title: "Event Title",            // Headline
  description: "Full narrative...", // Story text
  type: "ENCOUNTER",               // Category
  difficulty: "normal",            // 'easy', 'normal', 'hard', 'legendary'
  choices: [                       // Player options
    {
      text: "Choice description",
      effect: { gold: 100, health: -10 },
      requirements: { level: 5 },
      consequence: "brave"
    }
  ],
  tags: ["adventure", "combat"],   // Content tags
  quality: 85                      // Quality score
}
```

## 🎯 Player Context Format

```javascript
const playerContext = {
  // Identity
  name: "Character Name",
  age: 25,
  career: "merchant",          // 'warrior', 'mage', 'rogue', etc.

  // Statistics
  level: 10,
  gold: 500,
  reputation: 45,
  health: 100,

  // Skills (0-100)
  skills: {
    combat: 75,
    diplomacy: 60,
    stealth: 40,
    magic: 20
  },

  // Current Situation
  location: "forest_clearing",   // Environment
  time_of_day: "afternoon",       // 'morning', 'afternoon', 'evening', 'night'
  weather: "sunny",               // 'sunny', 'rainy', 'stormy', 'snowy'
  season: "spring",               // 'spring', 'summer', 'autumn', 'winter'

  // Social
  relationships: [
    { name: "Guild Master", type: "mentor", strength: 70 }
  ],

  // Inventory
  inventory: ["sword", "healing_potion"],
  completed_quests: ["village_help"],
  active_quests: ["dragon_slayer"]
};
```

## 🧠 Rule Engine

### Basic Rule
```javascript
generator.addCustomRule('wealth_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'gold', value: 1000 } }
  ],
  effects: {
    modifyChoices: {
      multiply: { rewards: 1.5 }  // 50% more rewards
    }
  }
});
```

### Condition Types
- `stat_greater_than` - Player stat above value
- `stat_less_than` - Player stat below value
- `career_equals` - Specific career match
- `location_contains` - Location contains substring
- `skill_greater_than` - Specific skill above value
- `time_range` - Time within range
- `season_equals` - Specific season match

### Effect Types
- `addTags: ['tag1', 'tag2']` - Add content tags
- `modifyChoices: { multiply: { gold: 1.5 } }` - Multiply effects
- `modifyChoices: { add: { experience: 100 } }` - Add flat bonuses
- `modifyEvent: { difficulty: 'hard' }` - Change event properties

## 👥 Relationships

```javascript
// Add NPC
generator.addNPC({
  id: 'king_arthur',
  name: 'King Arthur',
  type: 'noble',
  faction: 'royalty'
});

// Update relationship
generator.updateRelationship('king_arthur', 'player', 25, 'saved_life');

// Check relationship
const relationship = generator.getRelationship('king_arthur', 'player');
console.log(`Strength: ${relationship.strength}`); // 25
```

## 🔗 Dependencies

```javascript
// Register prerequisite
generator.registerEventDependency('ROYAL_AUDIENCE', {
  type: 'event_completed',
  eventId: 'COURT_INTRODUCTION'
});

// Complex requirements
generator.registerEventDependency('MASTER_QUEST', {
  operator: 'AND',
  conditions: [
    { type: 'stat_requirement', stat: 'level', min: 20 },
    { type: 'event_completed', eventId: 'APPRENTICE_QUEST' },
    {
      operator: 'OR',
      conditions: [
        { type: 'item_requirement', item: 'magic_key' },
        { type: 'relationship_requirement', npc: 'mentor', min: 80 }
      ]
    }
  ]
});

// Check if available
const canTrigger = generator.checkDependencies('MASTER_QUEST', gameState);
```

## 🌤️ Environmental Modifiers

```javascript
// Set environment
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter',
  timeOfDay: 'night',
  location: 'mountain'
});

// Generate with modifiers
const event = generator.generateEnhancedEvent({
  environment: { weather: 'storm', season: 'winter' },
  player: playerContext
});
```

## 📚 Templates

```javascript
// Register custom template
generator.registerEventTemplate('MYSTICAL_VISION', {
  title: "Mystical Vision",
  narrative: "You experience a vivid prophetic dream...",
  choices: [
    {
      text: "Seek out the prophecy",
      effect: { wisdom: 15 },
      consequence: "visionary"
    }
  ],
  tags: ['mystical', 'prophecy']
});

// Generate from template
const event = generator.generateFromTemplate('MYSTICAL_VISION');
```

## 💾 Save/Load

```javascript
// Save game state
const saveData = generator.getGameState();
localStorage.setItem('gameSave', JSON.stringify(saveData));

// Load game state
const saveData = JSON.parse(localStorage.getItem('gameSave'));
generator.loadGameState(saveData);
```

## 🎲 Training Data

```javascript
// Add custom training sentences
generator.addCustomTrainingData([
  'The ancient castle looms over the misty valley',
  'Elven archers patrol the enchanted forest borders',
  'Dwarven forges echo through mountain halls'
]);

// Category-specific training
generator.addCustomTrainingData([
  'Sunlight filters through dense forest canopy',
  'Wild animals observe from hidden thickets'
], 'forest_environment');
```

## 🔄 Event Chains

```javascript
// Start a chain
const firstEvent = generator.startChain('MYSTERY_INVESTIGATION');

// Continue chain
const nextEvent = generator.advanceChain(firstEvent.chainId, 'investigate');

// Check active chains
const activeChains = generator.getActiveChains();
```

## ⏰ Time Management

```javascript
// Advance game time
const dueEvents = generator.advanceGameDay();

// Start time-based chain
generator.startTimeBasedChain('POLITICAL_UPRISING');

// Check current time
const time = generator.getCurrentTime();
// { day: 15, season: 'spring', year: 1 }
```

## 📊 Quality Analysis

```javascript
// Analyze event quality
const analysis = generator.analyzeEventQuality(event);
console.log(`Quality: ${analysis.score}/100`);

// Quality factors:
// - Narrative coherence
// - Context relevance
// - Choice balance
// - Consequence clarity
```

## 🌐 Export Options

### Unity C#
```javascript
await generator.exportForUnity({
  namespace: 'MyGame.Events',
  outputPath: './unity-scripts/'
});
```

### Godot GDScript
```javascript
await generator.exportForGodot({
  outputPath: './godot-scripts/',
  includeResources: true
});
```

### TypeScript
```javascript
await generator.exportForTypeScript({
  outputPath: './types/',
  generateInterfaces: true
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="Event Generation"
```

## 🚨 Common Issues

### No Events Generating
```javascript
// Check: Provide sufficient context
const event = generator.generateEvent({
  level: 1, career: 'warrior'  // At minimum
});
```

### Rules Not Working
```javascript
// Check: Rule engine enabled
const generator = new RPGEventGenerator({
  enableRuleEngine: true  // Required!
});
```

### Poor Quality Events
```javascript
// Solution: Add training data
generator.addCustomTrainingData([
  'Diverse training sentence 1',
  'Diverse training sentence 2',
  // Add 50+ varied sentences
]);
```

## 📋 Checklist

### Basic Setup ✓
- [ ] Install package: `npm install rpg-event-generator`
- [ ] Import correctly
- [ ] Generate first event

### Advanced Features ✓
- [ ] Add custom training data
- [ ] Create custom rules
- [ ] Set up relationships
- [ ] Configure dependencies

### Quality Assurance ✓
- [ ] Test with various contexts
- [ ] Check event quality scores
- [ ] Validate rule conditions
- [ ] Test save/load functionality

### Production Ready ✓
- [ ] Enable appropriate features
- [ ] Set quality thresholds
- [ ] Implement error handling
- [ ] Add performance optimizations

## 📞 Support

- **Documentation:** [Full API Reference](api-reference.md)
- **Examples:** [Basic Usage](basic-usage.md), [Advanced Features](advanced-features.md)
- **Troubleshooting:** [Common Issues](troubleshooting.md)
- **GitHub:** Issues and feature requests

---

**Happy generating!** 🎲✨
