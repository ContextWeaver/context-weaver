# RPG Event Generator

A powerful procedural event generation system for creating dynamic, context-aware narratives and interactive experiences. Perfect for games, business applications, educational tools, research projects, and creative writing.

## 🌟 Why RPG Event Generator?

RPG Event Generator goes beyond simple random generation by creating **intelligent, context-aware content** that adapts to user state, preferences, and environmental factors. Whether you're building RPGs, business simulations, educational experiences, research tools, or interactive storytelling, RPG Event Generator provides the foundation for dynamic, engaging content generation.

## 🚀 Applications Beyond Gaming

RPG Event Generator excels in diverse applications:

- **🎮 Game Development**: Dynamic RPG events, quest generation, NPC interactions
- **💼 Business Simulations**: Market scenarios, customer interactions, decision trees
- **📚 Education**: Interactive learning experiences, scenario-based training
- **🔬 Research**: Data simulation, user behavior modeling, A/B testing scenarios
- **✍️ Creative Writing**: Story generation, character development, plot creation
- **📊 Training Tools**: Compliance scenarios, safety simulations, skill assessment

## ⚡ Core Features

### Intelligent Content Generation
- **Context-Aware Events**: Adapts to user profiles, history, preferences, and environmental factors
- **Markov Chain Technology**: Creates coherent, natural-sounding narratives from training data
- **Dynamic Adaptation**: Events evolve based on user state and previous interactions
- **Multi-Domain Support**: Works seamlessly across gaming, business, education, and research

### Flexible Content Creation
- **Custom Training Data**: Train the system with your own text for domain-specific content
- **Template System**: Generate and manage your own custom event templates
- **Rule Engine**: Create conditional logic to modify content generation dynamically
- **Pure Markov Mode**: Generate content using only your custom text data

### Advanced Capabilities
- **Event Chains**: Multi-part sequences with escalating complexity and consequences
- **Time-Based Systems**: Seasonal changes, evolving scenarios, and temporal progression
- **Relationship Networks**: Dynamic character/entity relationships and social dynamics
- **Multi-Language Support**: Generate content in different languages with cultural adaptation
- **Cross-Platform Export**: JSON, TypeScript, Unity C#, and Godot GDScript support

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

## Installation

```bash
npm install rpg-event-generator
```

## Quick Start

```javascript
import { RPGEventGenerator, generateRPGEvent } from 'rpg-event-generator';

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

## Demo

Run the included demo to explore all features:

```bash
# Using npm script (recommended)
npm run demo

# Direct script call
node demo.js
```

This will demonstrate event generation, chains, time progression, customization, and more.

## 🔧 Getting Started

### Basic Usage

```javascript
const generator = new RPGEventGenerator();

// Generate a random event
const event = generator.generateEvent();

// Generate with context
const contextualEvent = generator.generateEvent({
  age: 30,
  career: 'merchant',
  location: 'market'
});
```

## 📚 Documentation & Resources

**Explore the Full Capabilities:**
- Run `npm run demo` to see all features in action
- Check the `demo.js` file for comprehensive examples
- Check the source code for template format examples

**Key Files:**
- `src/index.js` - Main generator code
- `scripts/` - CLI tools and utilities
- Check source code for template format examples
- `test/` - Comprehensive test suite

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, and pull requests.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ContextWeaver/context-weaver.git
cd rpg-event-generator

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