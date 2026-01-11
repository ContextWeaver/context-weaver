# Context Weaver v3.0.0

**Intelligent procedural content generation for dynamic narratives and adaptive experiences.**

Originally designed for gaming, Context Weaver's adaptive algorithms excel across domains including business, education, interactive media, and research applications.

> ⚠️ **Migration Notice**: Previously `rpg-event-generator`. API updated: `RPGEventGenerator` → `ContextWeaver`, `generateRPGEvent` → `generateContent`. See [Migration Guide](https://github.com/ContextWeaver/context-weaver/wiki/Migration).

## Installation

```bash
npm install content-weaver
```

## Quick Start

```javascript
import { ContextWeaver, generateContent } from 'content-weaver';

// Generate adaptive content
const content = generateContent({
  experience: 25,
  engagement: 500,
  profile: 'professional'
});

console.log(content.title);
console.log(content.description);
console.log(content.choices);
```

## Advanced Usage

```javascript
// Rule-based content modification
const generator = new ContextWeaver({ enableRuleEngine: true });

generator.addCustomRule('vip_bonus', {
  conditions: [{ type: 'stat_greater_than', params: { stat: 'engagement', value: 1000 } }],
  effects: { modifyChoices: { multiply: { rewards: 1.5 } } }
});

// Template-based generation
const customTemplate = {
  title: 'Business Challenge',
  narrative: 'A strategic decision requires careful consideration.',
  choices: [
    { text: 'Take calculated risk', effect: { reputation: 20 } },
    { text: 'Play it safe', effect: { stability: 15 } }
  ]
};

generator.registerEventTemplate('business_decision', customTemplate);
const event = generator.generateFromTemplate('business_decision');
```

## Demo

**Local Demo:**
```bash
npm run demo
```

**Live Demo:** [https://contextweaver.github.io/context-weaver/](https://contextweaver.github.io/context-weaver/)

## Key Features

- 🎯 **Adaptive Generation** - Context-aware content creation
- 🧠 **Rule Engine** - Conditional logic for dynamic content
- 📚 **Template System** - Customizable content structures
- 🌐 **Multi-Platform** - Unity, Godot, and web support
- 🎲 **Markov Chains** - Advanced probabilistic text generation
- ⏰ **Time Systems** - Seasonal and temporal content

## 📚 Documentation

- **[Installation Guide](https://github.com/ContextWeaver/context-weaver/wiki/Installation)**
- **[Basic Usage](https://github.com/ContextWeaver/context-weaver/wiki/Basic-Usage)**
- **[API Reference](https://github.com/ContextWeaver/context-weaver/wiki/API-Methods)**
- **[FAQ](https://github.com/ContextWeaver/context-weaver/wiki/FAQ)**
- **[Migration Guide](https://github.com/ContextWeaver/context-weaver/wiki/Migration)**

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](https://github.com/ContextWeaver/context-weaver/wiki/Contributing).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chance.js](https://chancejs.com/) for random number generation
- Custom Markov chain implementation for procedural text generation

---

**Weave infinite narratives with Context Weaver!** 🧵📚✨