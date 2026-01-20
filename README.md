# RPG Event Generator

[![npm version](https://badge.fury.io/js/rpg-event-generator.svg)](https://badge.fury.io/js/rpg-event-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful procedural content generation system for dynamic, context aware narratives and interactive experiences. Perfect for games, simulations, and creative applications.

## ☕ Support

If RPG Event Generator has been helpful to your project, consider buying me a coffee!

<a href="https://www.buymeacoffee.com/Decept1kon" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;">
</a>

## ✨ Features

- **🧠 Intelligent Generation** - Context aware events that adapt to user state
- **🎯 Advanced Templates** - Conditional templates, composition, inheritance, mixins
- **🌍 World Building** - Automated world generation with factions and history
- **⚡ Performance** - Template caching, parallel generation, batched processing
- **🔌 Pluggable AI** - Optional AI/ML integration with multiple providers
- **💾 Database Support** - Scalable storage with pluggable adapters
- **🎮 Game Engine Export** - Unity C#, Godot GDScript, Unreal Engine C++
- **🌐 Multi Language** - Generate content in different languages
- **⏰ Time Systems** - Seasonal changes and temporal progression
- **🤝 Relationship Networks** - Dynamic character relationships
- **🎲 Markov Chains** - Natural sounding narratives

## 📦 Installation

```bash
npm install rpg-event-generator
```

### Requirements
- Node.js 16+
- TypeScript 4.5+ (for development)

## 🚀 Quick Start

### Basic Usage

```javascript
const { RPGEventGenerator, generateRPGEvent } = require('rpg-event-generator');

// Simple event generation
const event = generateRPGEvent({
  age: 25,
  gold: 500,
  influence: 15,
  career: 'merchant'
});

console.log(event.title);        // "Golden Opportunity"
console.log(event.description);  // Procedurally generated narrative
console.log(event.choices);      // Array of meaningful choices
```

### With Custom Configuration

```javascript
const generator = new RPGEventGenerator({
  theme: 'fantasy'
});

// Generate context aware event
const event = generator.generateEvent({
  level: 15,
  gold: 2500,
  class: 'wizard'
});

console.log(event.title);
console.log(event.description);
console.log(event.choices);
```

## 🎨 Advanced Usage

### World Building
```javascript
// Generate complete game world
const world = await generator.generateWorld();
console.log(`World: ${world.regions.length} regions, ${world.factions.length} factions`);

// Simulate history
await generator.simulateWorldYears(50);
const history = generator.getHistoricalEvents();
```

### Custom Templates
```javascript
// Register conditional template
generator.registerTemplate('merchant', {
  title: "Merchant Encounter",
  conditional_choices: [{
    condition: { player_gold: { gt: 1000 } },
    choice: { text: "Buy rare artifact", effect: { gold: -500 } }
  }]
});
```

### AI Enhancement
```javascript
const aiGenerator = new RPGEventGenerator({
  aiEnhancement: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY
  }
});
```

## 🔧 Configuration

```javascript
const config = {
  theme: 'fantasy',
  enableAI: false,
  enableDatabase: false,
  enableCaching: true,
  maxParallelGeneration: 4,

  aiEnhancement: {
    provider: 'openai',
    apiKey: 'your-key'
  }
};
```

## 📚 API

- `generateEvent(context)` - Generate single event
- `generateEvents(context, count)` - Generate multiple events
- `generateWorld()` - Create game world
- `registerTemplate(id, template)` - Add custom template
- `exportTemplates(format, path)` - Export to game engines

Full API docs: [Documentation](https://ContextWeaver.github.io/context-weaver/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🎯 Use Cases & Examples

### Gaming Applications
```javascript
// RPG Character Interactions
const generator = new RPGEventGenerator({ theme: 'fantasy' });
const playerState = {
  level: 15,
  class: 'wizard',
  gold: 2500,
  reputation: 75
};

const event = generator.generateEvent(playerState);
// Result: "The ancient tome pulses with magical energy..."
```

### Business Simulations
```javascript
// Customer Service Scenarios
const businessGenerator = new RPGEventGenerator({
  trainingData: [
    'Customer reports billing discrepancy',
    'Technical support ticket resolved',
    'Product feedback received and processed'
  ]
});

const scenario = businessGenerator.generateEvent({
  department: 'support',
  priority: 'high',
  customerValue: 85
});
```

### Educational Tools
```javascript
// Interactive Learning Scenarios
const educationGenerator = new RPGEventGenerator({
  theme: 'historical',
  culture: 'educational'
});

const lesson = educationGenerator.generateEvent({
  subject: 'history',
  difficulty: 'intermediate',
  learningObjectives: ['critical_thinking', 'decision_making']
});
```

### Research & Data Simulation
```javascript
// User Behavior Modeling
const researchGenerator = new RPGEventGenerator({
  enableRelationships: true,
  enableModifiers: true
});

const simulation = researchGenerator.generateEvent({
  userType: 'research_subject',
  conditions: ['experimental', 'controlled'],
  variables: ['time_pressure', 'cognitive_load']
});
```

## 🆕 Latest Features (v3.1.0)

### Database Integration
Store and retrieve templates from databases for large-scale applications:

```javascript
const generator = new RPGEventGenerator({ enableDatabase: true });

await generator.storeTemplateInDatabase(customTemplate);
const retrieved = await generator.getTemplateFromDatabase('template_id');
const searchResults = await generator.searchTemplatesInDatabase({ type: 'combat' });
```

### World Building System
Generate entire game worlds with factions, regions, and historical events:

```javascript
const world = await generator.generateWorld();
await generator.simulateWorldYears(50); // Advance world history
const factionPower = generator.getFactionPowerRanking();
```

### Advanced Template Features
Create complex, conditional templates with inheritance and composition:

```javascript
// Conditional templates
const conditionalTemplate = {
  id: 'level_based_event',
  conditions: [{ type: 'stat_requirement', field: 'level', operator: 'gte', value: 10 }],
  conditional_choices: [{
    condition: { type: 'has_item', item: 'magic_sword' },
    choice: { text: 'Use magic sword', effect: { damage: 50 } }
  }]
};

// Template composition
const composedTemplate = {
  id: 'weather_merchant',
  composition: [{
    template_id: 'merchant_base',
    merge_strategy: 'append_narrative'
  }, {
    template_id: 'weather_effects',
    conditions: [{ type: 'random_chance', probability: 0.6 }]
  }]
};
```

### Performance Optimizations
Handle large-scale generation with advanced caching and parallel processing:

```javascript
const generator = new RPGEventGenerator({
  enableTemplateCaching: true,
  enableEventCaching: true
});

// Generate events in parallel
const events = await generator.generateEventsParallel(100, context, 4); // 4 threads
// Generate in batches for memory efficiency
const batchedEvents = generator.generateEventsBatched(1000, context, 50); // 50 events per batch
```

## 🎮 Demo

Run the included demo to explore all features:

```bash
# Using npm script (recommended)
npm run demo

# Direct script call
node demo.js
```

This will demonstrate event generation, chains, time progression, customization, and more.

## 📚 Documentation & Resources

### 📖 Documentation
- **Wiki Available**: Comprehensive guides, tutorials, and examples available on the [GitHub Wiki](https://github.com/ContextWeaver/context-weaver/wiki)
- **API Documentation**: Complete TypeDoc reference available on [GitHub Pages](https://contextweaver.github.io/context-weaver/)

### 🛠️ Development & Testing
- Run `npm run demo` to see all 30+ features in action
- Run `npm run docs` to regenerate API documentation
- Run `npm test` to execute the comprehensive test suite
- Check the `demo.js` file for interactive examples
- Check the `test/` directory for usage examples

### 📂 Key Directories
- `src/` - Modular TypeScript source code
- `docs/` - Complete documentation and guides
- `templates/` - Built-in event templates
- `test/` - Comprehensive test suite
- `scripts/` - Build and export scripts

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, and pull requests.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ContextWeaver/context-weaver.git
cd context-weaver

# Install dependencies
npm install

# Run tests
npm test

# Run demo
npm run demo

# Build for distribution
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Generate infinite possibilities with RPG Event Generator!** 🎲✨
