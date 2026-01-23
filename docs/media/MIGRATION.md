# Migration Guide: v3.x to v4.0.0

This guide helps you migrate from RPG Event Generator v3.x to v4.0.0.

## Overview

v4.0.0 represents a **complete rebuild** of the core generation system (`GeneratorCore`). The new architecture replaces Markov chain generation with a direct content mapping system for more reliable, coherent output.

### Key Changes

- **Architecture**: Direct content mapping instead of Markov chains (default)
- **Content Library**: Expanded from ~17 to 1,870+ narrative elements
- **Context Integration**: Enhanced rates (location 70%, weather 60%, time 50%, class/race 40%)
- **Thematic Consistency**: Perfect alignment between titles, descriptions, and choices
- **Multi-Theme Support**: Custom content from any theme is automatically discovered

## Breaking Changes

### 1. Raw Training Text Support

**v3.x:**
```javascript
generator.addTrainingData([
  'A merchant approaches you in the market',
  'You encounter a mysterious stranger',
  'A battle breaks out in the forest'
]);
```

**v4.0.0:**
```javascript
// Raw text arrays are no longer processed
// Use structured content instead:
generator.addTrainingData({
  titles: {
    ECONOMIC: ['Market Encounter', 'Trade Opportunity'],
    SOCIAL: ['Mysterious Meeting', 'Stranger\'s Approach'],
    COMBAT: ['Forest Battle', 'Unexpected Conflict']
  },
  descriptions: {
    ECONOMIC: ['A merchant approaches you in the bustling market, wares gleaming in the sunlight.'],
    // ...
  },
  choices: {
    ECONOMIC: ['Negotiate a deal', 'Browse the wares', 'Decline politely'],
    // ...
  }
});
```

**Migration:**
- Convert raw text arrays to structured format (titles, descriptions, choices)
- If you were using raw texts for Markov training, consider using the `pureMarkovMode` option (see below)

### 2. Markov Chain Generation (Default)

**v3.x:**
- Default generation used Markov chains
- Text was generated probabilistically from training data

**v4.0.0:**
- Default generation uses direct content mapping
- More reliable, coherent output
- Markov chains still available via `pureMarkovMode` option

**Migration:**
- **No code changes needed** - the API is the same
- If you prefer Markov chain generation, enable `pureMarkovMode`:
  ```javascript
  const generator = new RPGEventGenerator({
    pureMarkovMode: true
  });
  ```

### 3. Event Type Selection

**v3.x:**
- 12 event types

**v4.0.0:**
- 14 event types (added `MAGIC` and `SPELLCASTING`)

**Migration:**
- Update any code that validates event types to include the new types
- Test files may need `validTypes` arrays updated

## Non-Breaking Changes

### Enhanced Context Integration

Context integration rates have been increased:
- Location: 30% → 70%
- Weather: 25% → 60%
- Time of Day: 20% → 50%
- Class/Race: 15% → 40%

**Migration:**
- No code changes needed
- Events will automatically include more contextual details

### Multi-Theme Support

Custom content from any theme is now automatically discovered:

**v3.x:**
```javascript
// Only checked 'default' theme
generator.addTrainingData({ titles: { COMBAT: ['Custom Title'] } }, 'default');
```

**v4.0.0:**
```javascript
// Checks all themes, prioritizing 'default'
generator.addTrainingData({ titles: { COMBAT: ['Custom Title'] } }, 'custom_theme');
// Will be found and used automatically
```

**Migration:**
- No code changes needed
- You can now use multiple themes without manual theme selection

## API Compatibility

### Maintained APIs

All public APIs remain compatible:

```javascript
// Still works exactly the same
const event = generator.generateEvent(context);
const events = generator.generateEvents(context, 10);
generator.addTrainingData(data, theme);
```

### New Options

```javascript
// New: pureMarkovMode for traditional Markov chain generation
const generator = new RPGEventGenerator({
  pureMarkovMode: true  // Use Markov chains instead of content library
});
```

## Testing Updates

### Event Type Validation

Update test files that validate event types:

```javascript
// Before
const validTypes = ['ADVENTURE', 'COMBAT', 'ECONOMIC', /* ... */];

// After
const validTypes = ['ADVENTURE', 'COMBAT', 'ECONOMIC', 'MAGIC', 'SPELLCASTING', /* ... */];
```

### Probabilistic Tests

Tests that rely on probabilistic behavior (e.g., "try 50 times to get a specific event type") may need adjustment:

```javascript
// Consider increasing iterations or using deterministic mocks
for (let i = 0; i < 100; i++) {  // Increased from 50
  const event = generator.generateEvent(context);
  if (event.type === 'MAGIC') {
    // test assertions
    break;
  }
}
```

## Performance Considerations

### Content Library Size

The new content library is significantly larger (1,870+ elements vs ~17). This means:
- **Initial load**: Slightly slower (content is inlined in GeneratorCore.ts)
- **Generation speed**: Faster (no Markov chain building)
- **Memory**: Slightly higher (but still minimal)

### Future Optimization

Consider extracting content to JSON files for:
- Faster initial load
- Easier content management
- Lazy loading capabilities

This is a future enhancement and not required for migration.

## Debugging

Enable debug mode to see warnings about deprecated features:

```javascript
const generator = new RPGEventGenerator({
  debug: true
});

// Will warn if raw training texts are provided:
generator.addTrainingData(['raw text']);  // Warning logged
```

## Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG.md](CHANGELOG.md) for detailed changes
2. Review the [README.md](README.md) for updated examples
3. Enable `debug: true` to see detailed logging
4. Open an issue on GitHub with your migration questions

## Summary Checklist

- [ ] Update raw training text usage to structured format
- [ ] Update event type validation arrays (add MAGIC, SPELLCASTING)
- [ ] Review probabilistic tests (may need more iterations)
- [ ] Test context integration (should see more contextual details)
- [ ] Consider enabling `pureMarkovMode` if you prefer Markov chains
- [ ] Enable `debug: true` to catch any deprecation warnings

---

**Note**: The migration should be straightforward for most users. The API remains compatible, and the main change is improved output quality and reliability.
