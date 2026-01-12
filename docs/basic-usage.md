# Basic Usage Examples

This guide covers common usage patterns and practical examples for RPG Event Generator.

## 🎮 Game Integration Examples

### RPG Character System
```javascript
const generator = new RPGEventGenerator({ theme: 'fantasy' });

// Player character data
const playerCharacter = {
  name: "Elara",
  level: 12,
  class: "Ranger",
  gold: 1250,
  reputation: 45,
  skills: {
    archery: 85,
    stealth: 70,
    survival: 60
  }
};

// Generate a personalized event
const event = generator.generateEvent(playerCharacter);

console.log(`📜 ${event.title}`);
console.log(`📖 ${event.description}`);
console.log(`🎯 Difficulty: ${event.difficulty}`);

// Handle player choice
function handleChoice(choiceIndex) {
  const choice = event.choices[choiceIndex];
  console.log(`You chose: ${choice.text}`);

  // Apply effects to player character
  if (choice.effect) {
    Object.assign(playerCharacter, choice.effect);
  }

  console.log(`New gold: ${playerCharacter.gold}`);
  console.log(`New reputation: ${playerCharacter.reputation}`);
}
```

### Turn-Based Strategy Game
```javascript
const strategyGenerator = new RPGEventGenerator({
  theme: 'historical',
  culture: 'medieval'
});

// Game state
const gameState = {
  turn: 15,
  kingdom: "Aldoria",
  ruler: "Queen Isabella",
  treasury: 5000,
  military: 1200,
  diplomacy: 75
};

// Generate kingdom event
const kingdomEvent = strategyGenerator.generateEvent({
  ...gameState,
  context: 'kingdom_management'
});

console.log(`👑 Kingdom Event: ${kingdomEvent.title}`);
console.log(`📜 ${kingdomEvent.description}`);

// Choices affect multiple game systems
kingdomEvent.choices.forEach((choice, index) => {
  console.log(`${index + 1}. ${choice.text}`);
  if (choice.effect) {
    console.log(`   Effects: ${JSON.stringify(choice.effect)}`);
  }
});
```

## 💼 Business Applications

### Customer Service Scenarios
```javascript
const businessGenerator = new RPGEventGenerator({
  trainingData: [
    'Customer reports billing discrepancy of $47.32',
    'Technical support ticket resolved in under 2 hours',
    'Product feedback received and processed successfully',
    'Customer satisfaction survey completed with 5-star rating',
    'Loyalty program member upgraded to premium status'
  ]
});

// Customer service training scenario
const scenario = businessGenerator.generateEvent({
  department: 'customer_service',
  priority: 'high',
  customer_value: 'premium',
  issue_type: 'billing'
});

console.log(`🎧 Customer Service Scenario:`);
console.log(`Title: ${scenario.title}`);
console.log(`Issue: ${scenario.description}`);
console.log(`Priority: ${scenario.difficulty}`);
```

### Market Simulation
```javascript
const marketGenerator = new RPGEventGenerator({
  theme: 'business',
  trainingData: [
    'Stock market experiences sudden volatility',
    'Competitor launches disruptive new product',
    'Economic indicators show unexpected growth',
    'Supply chain disruption affects multiple sectors',
    'Regulatory changes impact industry standards'
  ]
});

// Market event for business simulation
const marketEvent = marketGenerator.generateEvent({
  company_size: 'enterprise',
  industry: 'technology',
  market_position: 'market_leader',
  risk_tolerance: 'moderate'
});
```

## 📚 Educational Applications

### Interactive Learning Scenarios
```javascript
const educationGenerator = new RPGEventGenerator({
  theme: 'historical',
  culture: 'educational'
});

// History lesson scenario
const historyLesson = educationGenerator.generateEvent({
  subject: 'history',
  period: 'medieval',
  difficulty: 'intermediate',
  learning_objectives: ['critical_thinking', 'decision_making']
});

console.log(`📖 Educational Scenario:`);
console.log(`Subject: ${historyLesson.title}`);
console.log(`Context: ${historyLesson.description}`);
console.log(`Learning Goals: ${historyLesson.context?.objectives?.join(', ')}`);
```

### Language Learning
```javascript
const languageGenerator = new RPGEventGenerator({
  language: 'es',  // Spanish
  trainingData: [
    'El cliente pregunta por el precio del producto',
    'La reunión de equipo comienza a las 3 PM',
    'Necesitamos más información sobre el proyecto',
    'El informe está listo para su revisión',
    '¿Puede enviarme la documentación por email?'
  ]
});

// Business Spanish scenario
const spanishScenario = languageGenerator.generateEvent({
  context: 'business_meeting',
  proficiency_level: 'intermediate',
  business_domain: 'project_management'
});
```

## 🔬 Research Applications

### User Behavior Simulation
```javascript
const researchGenerator = new RPGEventGenerator({
  enableRelationships: true,
  enableModifiers: true
});

// Simulate user decision-making
const userScenario = researchGenerator.generateEvent({
  user_type: 'research_subject',
  conditions: ['experimental', 'controlled'],
  variables: ['time_pressure', 'cognitive_load'],
  demographics: {
    age_group: '25-34',
    tech_savvity: 'high'
  }
});
```

## 🎯 Event Types and Categories

### Common Event Types
- **ENCOUNTER**: Random meetings and discoveries
- **QUEST**: Story-driven objectives
- **COMBAT**: Conflict and confrontation
- **SOCIAL**: Relationship and diplomacy events
- **ECONOMIC**: Trade, commerce, and financial events
- **MYSTICAL**: Magic, supernatural, and mysterious events
- **PERSONAL**: Character development and introspection

### Difficulty Levels
- **easy**: Straightforward choices, minimal risk
- **normal**: Balanced challenge and reward
- **hard**: Significant consequences, strategic decisions
- **legendary**: High-stakes, transformative events

## 🔄 Event Chains

### Basic Chain Usage
```javascript
const generator = new RPGEventGenerator();

// Start a story chain
const firstEvent = generator.startChain('MYSTERY_INVESTIGATION');

console.log(`Chain started: ${firstEvent.title}`);
console.log(`Chain ID: ${firstEvent.chainId}`);

// Continue the chain based on player choice
const nextEvent = generator.advanceChain(firstEvent.chainId, 'investigate');

console.log(`Next event: ${nextEvent.title}`);

// Check active chains
const activeChains = generator.getActiveChains();
console.log(`Active storylines: ${activeChains.length}`);
```

## 💾 Save/Load Functionality

### Game State Persistence
```javascript
const generator = new RPGEventGenerator();

// Save complete game state
function saveGame(playerData, gameWorld) {
  const gameState = {
    player: playerData,
    world: gameWorld,
    events: generator.getGameState(),
    timestamp: Date.now()
  };

  localStorage.setItem('rpgSave', JSON.stringify(gameState));
  console.log('💾 Game saved successfully');
}

// Load saved game
function loadGame() {
  const savedData = localStorage.getItem('rpgSave');
  if (!savedData) return null;

  const gameState = JSON.parse(savedData);

  // Restore generator state
  generator.loadGameState(gameState.events);

  console.log('📂 Game loaded successfully');
  return {
    player: gameState.player,
    world: gameState.world
  };
}
```

## 🎨 Theme and Culture Variants

### Available Themes
```javascript
// Fantasy themes
const fantasyGen = new RPGEventGenerator({ theme: 'fantasy' });
const norseGen = new RPGEventGenerator({
  theme: 'fantasy',
  culture: 'norse'
});

// Sci-fi themes
const scifiGen = new RPGEventGenerator({ theme: 'sci-fi' });
const cyberpunkGen = new RPGEventGenerator({
  theme: 'sci-fi',
  culture: 'cyberpunk'
});

// Historical themes
const medievalGen = new RPGEventGenerator({
  theme: 'historical',
  culture: 'medieval'
});
```

## 🔧 Best Practices

### Player Context
```javascript
// Rich context = better events
const detailedPlayer = {
  // Basic info
  name: "Alex",
  age: 28,
  career: "detective",

  // Stats and skills
  intelligence: 85,
  charisma: 70,
  strength: 45,

  // Current situation
  location: "downtown_precinct",
  time_of_day: "night",
  weather: "rainy",

  // Relationships
  relationships: [
    { name: "Captain Harris", type: "superior", strength: 60 },
    { name: "Sarah", type: "partner", strength: 80 }
  ],

  // Inventory/resources
  gold: 250,
  reputation: 65,
  equipment: ["badge", "revolver", "notebook"]
};

const contextualEvent = generator.generateEvent(detailedPlayer);
// Results in much more relevant and engaging events
```

### Error Handling
```javascript
try {
  const event = generator.generateEvent(playerContext);

  if (!event || !event.title) {
    console.warn('Generated event appears incomplete');
    // Fallback to basic event
    const fallbackEvent = generator.generateEvent({});
    return fallbackEvent;
  }

  return event;
} catch (error) {
  console.error('Event generation failed:', error);
  // Return a safe default event
  return {
    title: "Unexpected Occurrence",
    description: "Something unexpected happened.",
    choices: [{ text: "Continue", effect: {} }]
  };
}
```

### Performance Optimization
```javascript
// Pre-warm generators for better performance
const generators = {
  fantasy: new RPGEventGenerator({ theme: 'fantasy' }),
  scifi: new RPGEventGenerator({ theme: 'sci-fi' }),
  business: new RPGEventGenerator({
    trainingData: businessTerms,
    theme: 'business'
  })
};

// Cache frequently used events
const eventCache = new Map();

function getCachedEvent(key, context) {
  if (eventCache.has(key)) {
    return eventCache.get(key);
  }

  const event = generators.fantasy.generateEvent(context);
  eventCache.set(key, event);
  return event;
}
```
