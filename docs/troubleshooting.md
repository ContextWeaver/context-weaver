# Troubleshooting Guide

Common issues and solutions for RPG Event Generator.

## 🚫 Installation Issues

### "Cannot find module 'rpg-event-generator'"
**Symptoms:** `Error: Cannot find module 'rpg-event-generator'`

**Solutions:**
1. **Check installation:**
   ```bash
   npm list rpg-event-generator
   ```

2. **Reinstall package:**
   ```bash
   npm uninstall rpg-event-generator
   npm install rpg-event-generator
   ```

3. **Check package.json:**
   ```json
   {
     "dependencies": {
       "rpg-event-generator": "^2.0.3"
     }
   }
   ```

4. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

### "Unsupported Node.js version"
**Symptoms:** Version compatibility errors

**Requirements:**
- Node.js 14.0.0 or higher
- NPM 6.0.0 or higher

**Check version:**
```bash
node --version
npm --version
```

**Update Node.js:**
- Download latest LTS from [nodejs.org](https://nodejs.org)
- Or use version manager: `nvm install --lts`

## 🐛 Generation Issues

### Empty or Poor Quality Events
**Symptoms:** Events return empty titles, descriptions, or low-quality content

**Causes & Solutions:**

1. **Insufficient Context:**
   ```javascript
   // ❌ Bad - minimal context
   const event = generator.generateEvent({});

   // ✅ Good - rich context
   const event = generator.generateEvent({
     age: 25,
     career: 'merchant',
     location: 'market',
     gold: 500,
     reputation: 45
   });
   ```

2. **Missing Training Data:**
   ```javascript
   // Add domain-specific training data
   generator.addCustomTrainingData([
     'Merchants haggle over exotic spices',
     'City guards patrol bustling marketplaces',
     'Ancient artifacts change hands for gold'
   ]);
   ```

3. **Incorrect Theme/Culture:**
   ```javascript
   // Ensure theme matches your content
   const generator = new RPGEventGenerator({
     theme: 'fantasy',  // Not 'cyberpunk' for medieval setting
     culture: 'medieval'
   });
   ```

### Events Too Repetitive
**Symptoms:** Same events generated repeatedly

**Solutions:**

1. **Increase Creativity:**
   ```javascript
   const generator = new RPGEventGenerator({
     creativity: 0.8,  // Higher = more varied (default: 0.7)
     markovOrder: 2    // Lower = more varied (default: 2)
   });
   ```

2. **Add More Training Data:**
   ```javascript
   generator.addCustomTrainingData([
     'Unique event description 1',
     'Unique event description 2',
     'Unique event description 3'
     // Add 50+ diverse sentences
   ]);
   ```

3. **Use Different Seeds:**
   ```javascript
   // Generate with different seeds for variety
   const event1 = generator.generateEvent(context, 'seed1');
   const event2 = generator.generateEvent(context, 'seed2');
   ```

### Events Don't Match Context
**Symptoms:** Generated events ignore player stats, location, etc.

**Check:**
1. **Context Format:**
   ```javascript
   // ✅ Correct format
   const context = {
     level: 10,           // Number
     career: 'warrior',   // String
     location: 'forest',  // String
     gold: 500,           // Number
     skills: {            // Object
       combat: 75,
       stealth: 60
     }
   };

   // ❌ Wrong format
   const badContext = {
     playerLevel: 10,     // Wrong key name
     class: 'warrior'     // Wrong key name
   };
   ```

2. **Enable Features:**
   ```javascript
   const generator = new RPGEventGenerator({
     enableRuleEngine: true,    // For stat-based events
     enableModifiers: true,     // For environmental events
     enableRelationships: true  // For NPC events
   });
   ```

## 🧠 Rule Engine Issues

### Rules Not Applying
**Symptoms:** Custom rules have no effect on events

**Debug Steps:**

1. **Validate Rule Syntax:**
   ```javascript
   const rule = {
     conditions: [
       { type: 'stat_greater_than', params: { stat: 'gold', value: 1000 } }
     ],
     effects: {
       modifyChoices: { multiply: { rewards: 1.5 } }
     }
   };

   const validation = generator.validateCustomRule(rule);
   console.log('Rule valid:', validation.valid);
   if (!validation.valid) {
     console.log('Errors:', validation.errors);
   }
   ```

2. **Check Rule Conditions:**
   ```javascript
   // Debug condition matching
   const testContext = { gold: 1500, level: 5 };
   const matches = generator.testRuleConditions('your_rule_id', testContext);
   console.log('Rule matches:', matches);
   ```

3. **Enable Rule Engine:**
   ```javascript
   const generator = new RPGEventGenerator({
     enableRuleEngine: true  // Must be enabled!
   });
   ```

### Rule Conflicts
**Symptoms:** Multiple rules interfere with each other

**Solutions:**

1. **Check Rule Priority:**
   ```javascript
   // Rules are applied in registration order
   generator.addCustomRule('high_priority_rule', { /* ... */ });  // Applied first
   generator.addCustomRule('low_priority_rule', { /* ... */ });   // Applied second
   ```

2. **Use Specific Conditions:**
   ```javascript
   // More specific conditions override general ones
   generator.addCustomRule('noble_merchant_bonus', {
     conditions: [
       { type: 'career_equals', params: { career: 'merchant' } },
       { type: 'stat_greater_than', params: { stat: 'reputation', value: 80 } }
     ],
     effects: { /* Specific bonuses */ }
   });
   ```

## 👥 Relationship Issues

### Relationships Not Updating
**Symptoms:** NPC relationships don't change after events

**Check:**

1. **Enable Relationships:**
   ```javascript
   const generator = new RPGEventGenerator({
     enableRelationships: true  // Must be enabled!
   });
   ```

2. **Add NPCs First:**
   ```javascript
   generator.addNPC({
     id: 'king_arthur',
     name: 'King Arthur',
     type: 'noble'
   });
   ```

3. **Use Correct IDs:**
   ```javascript
   // ✅ Correct
   generator.updateRelationship('king_arthur', 'player', 25, 'saved_life');

   // ❌ Wrong ID
   generator.updateRelationship('king_arther', 'hero', 25, 'saved_life');
   ```

### Relationship Events Not Generating
**Symptoms:** No social/relationship events appear

**Solutions:**

1. **Add Relationship Context:**
   ```javascript
   const event = generator.generateEvent({
     relationships: [
       { name: 'King Arthur', type: 'ally', strength: 60 }
     ]
   });
   ```

2. **Check Relationship Strength:**
   ```javascript
   // Low relationships may not trigger events
   const relationship = generator.getRelationship('npc_id', 'player');
   console.log('Relationship strength:', relationship.strength);
   ```

## 🔗 Dependency Issues

### Events Not Unlocking
**Symptoms:** Events remain locked despite meeting requirements

**Debug:**

1. **Check Dependencies:**
   ```javascript
   const gameState = {
     completedEvents: new Set(['quest_1']),
     playerStats: { level: 5 },
     inventory: new Set(['key_item'])
   };

   const canUnlock = generator.checkDependencies('locked_event', gameState);
   console.log('Can unlock:', canUnlock);
   ```

2. **Validate Game State Format:**
   ```javascript
   // Ensure correct property names
   const correctGameState = {
     completedEvents: new Set(['event_id']),  // Set, not array
     playerStats: { level: 10 },             // Object
     inventory: new Set(['item_id'])         // Set, not array
   };
   ```

3. **Enable Dependencies:**
   ```javascript
   const generator = new RPGEventGenerator({
     enableDependencies: true  // Must be enabled!
   });
   ```

## 🌤️ Environmental Modifier Issues

### Modifiers Not Applying
**Symptoms:** Weather/season effects not appearing in events

**Check:**

1. **Enable Modifiers:**
   ```javascript
   const generator = new RPGEventGenerator({
     enableModifiers: true  // Must be enabled!
   });
   ```

2. **Set Environment Context:**
   ```javascript
   generator.setEnvironmentalContext({
     weather: 'storm',
     season: 'winter',
     timeOfDay: 'night'
   });
   ```

3. **Use Enhanced Generation:**
   ```javascript
   // Use generateEnhancedEvent for modifiers
   const event = generator.generateEnhancedEvent({
     environment: { weather: 'storm' },
     player: playerContext
   });
   ```

## 📦 Export Issues

### Unity Export Fails
**Symptoms:** Unity export throws errors

**Check:**

1. **File Permissions:**
   ```bash
   # Ensure output directory exists and is writable
   mkdir -p ./unity-scripts/
   ```

2. **Namespace Format:**
   ```javascript
   await generator.exportForUnity({
     namespace: 'MyGame.Events',  // Valid C# namespace
     outputPath: './unity-scripts/'
   });
   ```

3. **Template Compatibility:**
   ```javascript
   // Ensure templates have required fields
   const template = {
     title: 'Event Title',
     narrative: 'Description...',
     choices: [
       { text: 'Choice', effect: {} }
     ]
   };
   ```

### Godot Export Issues
**Symptoms:** GDScript files have syntax errors

**Solutions:**

1. **Check GDScript Version:**
   ```javascript
   await generator.exportForGodot({
     outputPath: './godot-scripts/',
     godotVersion: '4.0'  // Specify version
   });
   ```

2. **Validate Output Directory:**
   ```bash
   ls -la ./godot-scripts/  # Check permissions
   ```

## 🔧 Performance Issues

### Slow Generation
**Symptoms:** Events take >100ms to generate

**Optimization:**

1. **Reduce Complexity:**
   ```javascript
   const fastGenerator = new RPGEventGenerator({
     markovOrder: 1,        // Faster than 2 or 3
     minQualityScore: 60,   // Lower quality threshold
     maxComplexity: 5       // Fewer choices/effects
   });
   ```

2. **Cache Results:**
   ```javascript
   const eventCache = new Map();

   function getCachedEvent(key, context) {
     if (eventCache.has(key)) return eventCache.get(key);

     const event = generator.generateEvent(context);
     eventCache.set(key, event);
     return event;
   }
   ```

3. **Precompute Common Events:**
   ```javascript
   // Generate common events at startup
   const commonEvents = [];
   for (let i = 0; i < 100; i++) {
     commonEvents.push(generator.generateEvent({}));
   }
   ```

### Memory Issues
**Symptoms:** High memory usage or crashes

**Solutions:**

1. **Limit Cache Size:**
   ```javascript
   const limitedCache = new Map();

   function addToCache(key, value) {
     if (limitedCache.size > 1000) {
       const firstKey = limitedCache.keys().next().value;
       limitedCache.delete(firstKey);
     }
     limitedCache.set(key, value);
   }
   ```

2. **Clean Up Unused Data:**
   ```javascript
   // Clear old cached data periodically
   setInterval(() => {
     generator.clearOldCache(24 * 60 * 60 * 1000); // 24 hours
   }, 60 * 60 * 1000); // Hourly cleanup
   ```

## 🧪 Testing Issues

### Tests Failing
**Symptoms:** `npm test` fails

**Common Fixes:**

1. **Install Dev Dependencies:**
   ```bash
   npm install  # Installs Jest and other dev deps
   ```

2. **Check Node Version:**
   ```bash
   node --version  # Should be 14+
   ```

3. **Run Specific Tests:**
   ```bash
   npm test -- --testNamePattern="specific test name"
   ```

4. **Debug Test Output:**
   ```bash
   npm test -- --verbose
   ```

### Quality Test Failures
**Symptoms:** Events fail quality checks in tests

**Adjust Quality Settings:**
```javascript
const testGenerator = new RPGEventGenerator({
  minQualityScore: 50,  // Lower for tests
  enableQualityFiltering: false  // Disable for debugging
});
```

## 🌐 Browser Compatibility

### Browser Console Errors
**Symptoms:** "RPGEventGenerator is not defined" in browser

**Solutions:**

1. **Include CDN Script:**
   ```html
   <script src="https://cdn.jsdelivr.net/npm/rpg-event-generator@latest/dist/browser/rpg-event-generator.min.js"></script>
   ```

2. **Wait for Script Load:**
   ```javascript
   window.addEventListener('load', function() {
     const generator = new RPGEventGenerator();
     // Your code here
   });
   ```

3. **Check Console for 404 Errors:**
   - Verify CDN URL is accessible
   - Check network connectivity

### CORS Issues
**Symptoms:** Browser blocks cross-origin requests

**Workarounds:**

1. **Use Local Files:**
   ```html
   <script src="./node_modules/rpg-event-generator/dist/browser/rpg-event-generator.min.js"></script>
   ```

2. **Disable CORS in Browser:**
   - Chrome: `--disable-web-security --user-data-dir=/tmp/chrome_dev`
   - Firefox: `about:config` > `security.fileuri.strict_origin_policy` = false

## 📝 Common Error Messages

### "TypeError: Cannot read property 'generateEvent' of undefined"
**Cause:** Generator not properly initialized
**Fix:**
```javascript
const generator = new RPGEventGenerator();  // Add missing initialization
const event = generator.generateEvent(context);
```

### "RangeError: Maximum call stack size exceeded"
**Cause:** Recursive rule dependencies or infinite loops
**Fix:**
- Check for circular rule dependencies
- Simplify complex rule conditions
- Reduce recursion depth

### "SyntaxError: Unexpected token in JSON"
**Cause:** Malformed JSON in templates or saved data
**Fix:**
```javascript
// Validate JSON before parsing
try {
  const data = JSON.parse(jsonString);
} catch (error) {
  console.error('Invalid JSON:', error.message);
  // Use default/fallback data
}
```

### "ReferenceError: window is not defined"
**Cause:** Browser code running in Node.js environment
**Fix:**
```javascript
// Check environment
if (typeof window !== 'undefined') {
  // Browser code
  const generator = new RPGEventGenerator();
} else {
  // Node.js code
  const { RPGEventGenerator } = require('rpg-event-generator');
}
```

## 🔍 Advanced Debugging

### Enable Debug Logging
```javascript
const generator = new RPGEventGenerator({
  debug: true,
  logLevel: 'debug'
});

// Monitor events
generator.on('eventGenerated', (event) => {
  console.log('Generated event:', event.id);
});

generator.on('ruleApplied', (ruleId, event) => {
  console.log('Rule applied:', ruleId, 'to event:', event.id);
});
```

### Performance Profiling
```javascript
// Time event generation
console.time('eventGeneration');
const event = generator.generateEvent(context);
console.timeEnd('eventGeneration');

// Profile memory usage
if (typeof performance !== 'undefined' && performance.memory) {
  console.log('Memory usage:', performance.memory);
}
```

### Inspect Internal State
```javascript
// Access internal state for debugging
console.log('Active rules:', generator.getActiveRules());
console.log('NPC relationships:', generator.getAllRelationships());
console.log('Registered templates:', generator.getRegisteredTemplates());
console.log('Current environment:', generator.getEnvironmentalContext());
```

## 📞 Getting Help

### Quick Self-Check
Run this diagnostic script:
```javascript
const generator = new RPGEventGenerator();
console.log('✓ Generator created');

const event = generator.generateEvent({ level: 1 });
console.log('✓ Event generated:', event.title ? 'SUCCESS' : 'FAILED');

const validation = generator.validateCustomRule({
  conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 1 } }],
  effects: {}
});
console.log('✓ Rule validation:', validation.valid ? 'SUCCESS' : 'FAILED');
```

### Community Support
- **GitHub Issues:** Bug reports and feature requests
- **Discussions:** General questions and community help
- **Documentation:** Check examples and API reference

### Professional Support
For enterprise applications or custom development:
- Contact the maintainers directly
- Custom integration services available
- Priority support options
