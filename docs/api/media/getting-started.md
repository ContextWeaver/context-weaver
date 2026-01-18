# Getting Started with RPG Event Generator

Welcome to RPG Event Generator! This guide will help you get up and running with procedural event generation for your games, applications, and projects.

## 🚀 Quick Installation

### NPM Installation
```bash
npm install rpg-event-generator
```

### CDN (Browser)
```html
<script src="https://cdn.jsdelivr.net/npm/rpg-event-generator@latest/dist/browser/rpg-event-generator.min.js"></script>
```

### Requirements
- **Node.js**: v14.0.0 or higher
- **Browser**: Modern browsers with ES6 support

## 🎯 Your First Event

### Basic Usage
```javascript
import { RPGEventGenerator, generateRPGEvent } from 'rpg-event-generator';

// Method 1: Quick generation
const event = generateRPGEvent({
  age: 25,
  gold: 500,
  career: 'merchant'
});

console.log(event.title);        // "Golden Opportunity"
console.log(event.description);  // Generated narrative
console.log(event.choices);      // Available choices

// Method 2: Advanced generator
const generator = new RPGEventGenerator();
const customEvent = generator.generateEvent({
  level: 15,
  class: 'wizard',
  location: 'magic_tower'
});
```

### Browser Usage
```html
<!DOCTYPE html>
<html>
<body>
  <div id="event-display"></div>

  <script src="https://cdn.jsdelivr.net/npm/rpg-event-generator@latest/dist/browser/rpg-event-generator.min.js"></script>
  <script>
    const generator = new RPGEventGenerator();
    const event = generator.generateEvent();

    document.getElementById('event-display').innerHTML = `
      <h2>${event.title}</h2>
      <p>${event.description}</p>
      <ul>
        ${event.choices.map(choice => `<li>${choice.text}</li>`).join('')}
      </ul>
    `;
  </script>
</body>
</html>
```

## 📖 Understanding Events

Events in RPG Event Generator have a consistent structure:

```javascript
{
  id: "event_1704567890123_xyz789",    // Unique identifier
  title: "Mysterious Encounter",       // Event headline
  description: "You encounter...",     // Detailed narrative
  type: "ENCOUNTER",                   // Event category
  difficulty: "normal",                // Difficulty level
  choices: [                           // Available actions
    {
      text: "Investigate",
      effect: { reputation: 10 },
      consequence: "curious"
    }
  ],
  context: { /* Generation context */ }
}
```

## 🎮 Basic Configuration

### Simple Setup
```javascript
const generator = new RPGEventGenerator();
```

### Themed Generator
```javascript
const fantasyGenerator = new RPGEventGenerator({
  theme: 'fantasy',      // 'fantasy', 'sci-fi', 'historical'
  culture: 'medieval'    // Cultural variant
});
```

### Advanced Configuration
```javascript
const generator = new RPGEventGenerator({
  // Core settings
  theme: 'fantasy',
  culture: 'norse',

  // Feature toggles
  enableRelationships: true,
  enableModifiers: true,
  enableDependencies: true,

  // Quality settings
  minQualityScore: 75,
  maxComplexity: 8
});
```

## 🧪 Testing Your Setup

Run the included demo to verify everything works:

```bash
# Install dependencies
npm install

# Run the comprehensive demo
npm run demo
```

Expected output includes 21 different feature demonstrations covering all capabilities.

## 🆘 Having Issues?

### Common Problems

**"Cannot find module 'rpg-event-generator'"**
- Ensure you've run `npm install rpg-event-generator`
- Check your import statement syntax

**"ReferenceError: RPGEventGenerator is not defined" (Browser)**
- Include the CDN script before your code
- Check the script URL is correct

**Empty or poor quality events**
- Provide more detailed player context
- Try different themes or cultures
- Add custom training data

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the API reference and examples
- **Demo Output**: Run `npm run demo` to see working examples

## 🚀 What's Next?

Now that you have the basics, explore:

- [Basic Usage Examples](basic-usage.md) - Common patterns and use cases
- [Advanced Features](advanced-features.md) - Relationships, dependencies, and modifiers
- [API Reference](api-reference.md) - Complete method documentation
- [Customization Guide](customization.md) - Training data and templates
