# Frequently Asked Questions

Answers to common questions about Context Weaver.

## 🚀 Getting Started

### What is Context Weaver?

Context Weaver is a **procedural content generation engine** that creates dynamic, context-aware narratives and interactive experiences. Unlike simple random generators, it adapts content based on user state, preferences, and environmental factors.

### How is it different from other content generators?

- **Context-Aware**: Adapts to user profiles, history, and current state
- **Rule-Based**: Intelligent conditional logic for content modification
- **Multi-Domain**: Works for gaming, education, business, and research
- **Structured Output**: Generates complete interactive scenarios, not just text

### Is it free to use?

Yes! Context Weaver is open-source under the MIT license. You can use it commercially without any fees.

## 📦 Installation & Setup

### Which Node.js version do I need?

- **Minimum**: Node.js v14.0.0
- **Recommended**: Node.js v16.0.0 or higher
- **Latest features**: Node.js v18.0.0+

### Can I use it in the browser?

Yes! Context Weaver works in browsers via:
- Direct script inclusion
- CDN: `https://unpkg.com/content-weaver@2.0.2/dist/browser/content-weaver.min.js`
- Build tools like Webpack, Vite, or Rollup

### Does it work with React/Vue/Angular?

Absolutely! Context Weaver is framework-agnostic and works with any JavaScript framework:

```javascript
// React example
import { useState, useEffect } from 'react';
import { ContextWeaver } from 'content-weaver';

function ContentGenerator() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const generator = new ContextWeaver();
    const newContent = generator.generateContent();
    setContent(newContent);
  }, []);

  return (
    <div>
      <h2>{content?.title}</h2>
      <p>{content?.description}</p>
    </div>
  );
}
```

## 🎯 Content Generation

### How does the Markov chain generation work?

Context Weaver uses **n-gram Markov chains** to generate coherent text:

1. **Training Phase**: Analyzes your training data to build probability tables
2. **Generation Phase**: Starts with seed words and predicts subsequent words based on patterns
3. **Context Integration**: Incorporates user state, rules, and environmental factors

### Can I control content quality?

Yes! Multiple quality controls:

```javascript
const generator = new ContextWeaver({
  minQualityScore: 75,        // Minimum quality threshold
  maxComplexity: 8,           // Limit complexity
  enableQualityFiltering: true // Filter low-quality content
});
```

### What's the difference between templates and training data?

- **Training Data**: Raw text used to train the Markov chains (flexible, creative output)
- **Templates**: Structured content frameworks (predictable, consistent output)

Use training data for creative, free-form content. Use templates for structured, repeatable scenarios.

### How much training data do I need?

- **Minimum**: 100-200 sentences for basic results
- **Good**: 500-1000 sentences for coherent output
- **Excellent**: 2000+ sentences for high-quality, domain-specific content

Quality matters more than quantity - diverse, well-written training data produces better results.

## 🧠 Rule Engine

### What are rules and how do they work?

Rules are **conditional logic** that modify content generation:

```javascript
generator.addCustomRule('vip_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'engagement', value: 1000 } }
  ],
  effects: {
    addTags: ['premium_user'],
    modifyChoices: {
      multiply: { rewards: 1.5 },
      add: { reputation: 10 }
    }
  }
});
```

### Can rules conflict with each other?

Yes, rules can conflict. Context Weaver resolves conflicts by:

1. **Priority Order**: Rules processed in addition order
2. **Specificity**: More specific conditions override general ones
3. **Last-Write-Wins**: Later rules can override earlier ones

### How many rules can I have?

No hard limit, but performance considerations:

- **Lightweight**: < 50 rules (negligible performance impact)
- **Moderate**: 50-200 rules (minimal impact)
- **Heavy**: 200+ rules (consider optimization)

## 🌐 Integration & Deployment

### Can I use it with game engines?

Yes! Context Weaver exports to multiple platforms:

```bash
# Unity C# export
npm run export:unity fantasy

# Godot GDScript export
npm run export:godot cyberpunk

# TypeScript interfaces
npm run export:typescript space-opera
```

### Does it support multiple languages?

Yes! Built-in multi-language support:

```javascript
const generator = new ContextWeaver({
  language: 'es',  // Spanish
  // language: 'fr',  // French
  // language: 'de',  // German
  // language: 'ja',  // Japanese
});

const spanishContent = generator.generateContent();
// Generates content in Spanish with cultural adaptation
```

### How do I handle large-scale deployments?

For production deployments:

```javascript
// Pre-warm generators
const generators = {
  business: new ContextWeaver({ theme: 'business' }),
  education: new ContextWeaver({ theme: 'education' }),
  gaming: new ContextWeaver({ theme: 'fantasy' })
};

// Connection pooling for databases
const dbPool = new Pool({ /* config */ });

// Caching layer
const cache = new Redis({ /* config */ });
```

## 🔧 Performance & Scaling

### How fast is content generation?

Typical performance:
- **Simple content**: < 10ms
- **Complex scenarios**: 50-200ms
- **Batch generation**: Scales linearly

Factors affecting speed:
- Training data size
- Rule complexity
- Template count
- Hardware resources

### Can I cache generated content?

Yes! Multiple caching strategies:

```javascript
// Memory caching
const cache = new Map();

function getCachedContent(key, context) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const content = generator.generateContent(context);
  cache.set(key, content);
  return content;
}

// Redis caching for distributed systems
const redis = new Redis();

async function getRedisCachedContent(key, context) {
  const cached = await redis.get(`content:${key}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const content = generator.generateContent(context);
  await redis.set(`content:${key}`, JSON.stringify(content), 'EX', 3600);
  return content;
}
```

### What's the maximum content I can generate?

No hard limits, but practical considerations:

- **Memory**: Large training datasets need adequate RAM
- **Storage**: Cached content requires disk space
- **Time**: Complex rule sets slow generation
- **Network**: Large responses need bandwidth

## 🐛 Troubleshooting

### Content generation returns empty results?

Check:
1. Training data quality and quantity
2. Generator configuration
3. Context object validity

```javascript
// Debug generation
const debugGenerator = new ContextWeaver({
  debug: true,
  minQualityScore: 0  // Don't filter low-quality content
});

const content = debugGenerator.generateContent(context);
console.log('Debug info:', content._debug);
```

### Rules aren't applying?

Common issues:
1. **Condition syntax errors**
2. **Stat name mismatches**
3. **Rule priority conflicts**

```javascript
// Validate rules
const validation = generator.validateCustomRule(rule);
if (!validation.valid) {
  console.error('Rule errors:', validation.errors);
}
```

### Browser console shows "ContextWeaver is not defined"?

Ensure the script loads before your code:

```html
<!-- Load Context Weaver -->
<script src="https://unpkg.com/content-weaver@2.0.2/dist/browser/content-weaver.min.js"></script>

<!-- Your code -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Now ContextWeaver is available
  const generator = new window.ContextWeaver();
});
</script>
```

## 📊 Business & Enterprise

### Do you offer commercial support?

Community support is available through:
- [GitHub Issues](https://github.com/ContextWeaver/context-weaver/issues)
- [Discussions](https://github.com/ContextWeaver/context-weaver/discussions)
- [Discord/Community forums](https://discord.gg/context-weaver)

For enterprise support, custom development, or consulting, contact the maintainers.

### Can I use it in commercial products?

Yes! Context Weaver is MIT licensed, allowing commercial use without restrictions.

### How do I contribute enterprise features?

We welcome enterprise contributions! Please:
1. Open a [GitHub Discussion](https://github.com/ContextWeaver/context-weaver/discussions) to discuss requirements
2. Create an [Issue](https://github.com/ContextWeaver/context-weaver/issues) for tracking
3. Submit a Pull Request with your implementation

## 🔄 Migration & Compatibility

### Migrating from rpg-event-generator?

The API is 100% backward compatible:

```javascript
// Old way (still works)
import { RPGEventGenerator } from 'rpg-event-generator';
const generator = new RPGEventGenerator();

// New way (recommended)
import { ContextWeaver } from 'content-weaver';
const generator = new ContextWeaver();  // Same API!
```

### Will old packages still work?

The old `rpg-event-generator` package will show deprecation warnings but continues to work. All existing code remains functional.

## 🆘 Still Need Help?

- **[Troubleshooting Guide](Troubleshooting.md)** - Step-by-step solutions
- **[GitHub Issues](https://github.com/ContextWeaver/context-weaver/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/ContextWeaver/context-weaver/discussions)** - Community help and ideas

---

**Didn't find your answer?** [Create a new issue](https://github.com/ContextWeaver/context-weaver/issues/new) or [start a discussion](https://github.com/ContextWeaver/context-weaver/discussions/new)! We're here to help. 🤝
