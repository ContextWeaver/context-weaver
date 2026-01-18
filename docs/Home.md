# RPG Event Generator Documentation

Comprehensive documentation for RPG Event Generator - a powerful procedural content generation system.

## ☕ Support the Project

If you find RPG Event Generator helpful, consider buying me a coffee! Your support helps maintain and improve this open-source project.

<a href="https://www.buymeacoffee.com/YOUR_USERNAME" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;">
</a>

## 📚 Documentation Index

### Getting Started
- **[Installation & Setup](getting-started.md)** - Complete setup guide, requirements, and first steps
- **[Quick Reference](quick-reference.md)** - Fast-track API reference and common patterns

### Usage Guides
- **[Basic Usage Examples](basic-usage.md)** - Practical examples for games, business, education, and research
- **[Advanced Features](advanced-features.md)** - Rules engine, relationships, dependencies, and modifiers
- **[Customization Guide](customization.md)** - Training data, templates, themes, and performance optimization

### Technical Reference
- **[API Reference](api-reference.md)** - Complete method documentation and data structures
- **[Troubleshooting](troubleshooting.md)** - Common issues, debugging, and solutions

## 🎯 Quick Start

```bash
# Install
npm install rpg-event-generator

# Generate your first event
npm run demo
```

```javascript
import { RPGEventGenerator } from 'rpg-event-generator';

const generator = new RPGEventGenerator();
const event = generator.generateEvent({
  level: 10,
  career: 'warrior',
  location: 'forest'
});

console.log(event.title);     // "Ambush in the Woods"
console.log(event.choices);   // Array of player options
```

## 🌟 Key Features

- **Intelligent Content Generation** - Context-aware events that adapt to player state
- **Markov Chain Technology** - Natural-sounding narratives from training data
- **Rule Engine** - Conditional logic for dynamic event modification
- **Relationship Networks** - Dynamic NPC interactions and social consequences
- **Event Dependencies** - Complex prerequisite systems for story progression
- **Environmental Modifiers** - Weather, season, and location-based effects
- **Cross-Platform Export** - Unity, Godot, and TypeScript support
- **Extensible Architecture** - Custom templates, themes, and training data

## 🎮 Applications

RPG Event Generator works across multiple domains:

- **🎮 Gaming** - RPG events, quest generation, NPC interactions
- **💼 Business** - Customer scenarios, market simulations, decision trees
- **📚 Education** - Interactive learning, scenario-based training
- **🔬 Research** - User behavior modeling, A/B testing scenarios
- **✍️ Creative Writing** - Story generation, character development

## 📖 Learning Path

1. **[Getting Started](getting-started.md)** - Installation and basic usage
2. **[Basic Usage Examples](basic-usage.md)** - Practical applications and patterns
3. **[Quick Reference](quick-reference.md)** - API overview and common tasks
4. **[Advanced Features](advanced-features.md)** - Power features and customization
5. **[API Reference](api-reference.md)** - Complete technical documentation
6. **[Troubleshooting](troubleshooting.md)** - Debug and optimize your implementation

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](getting-started.md#development-setup) for setup instructions.

## 📄 License

MIT License - see main [LICENSE](../LICENSE) file for details.

## 📞 Support

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive guides and examples
- **Community** - Share your implementations and templates

---

**Ready to generate infinite possibilities?** 🎲✨

*Documentation last updated: January 2026*
