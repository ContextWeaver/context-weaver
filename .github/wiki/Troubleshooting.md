# Troubleshooting Guide

Solutions to common issues and problems with Context Weaver.

## 🚨 Quick Diagnosis

### Run the Diagnostic Script

```javascript
// diagnostic.js
const { ContextWeaver } = require('content-weaver');

console.log('🔍 Context Weaver Diagnostic Tool');
console.log('================================');

try {
  // Test 1: Module loading
  console.log('✅ Module loaded successfully');

  // Test 2: Basic instantiation
  const generator = new ContextWeaver();
  console.log('✅ Generator created');

  // Test 3: Basic generation
  const content = generator.generateContent();
  if (content && content.title) {
    console.log('✅ Basic generation works');
    console.log(`   Sample: "${content.title}"`);
  } else {
    throw new Error('Content generation failed');
  }

  // Test 4: Context-aware generation
  const ctxContent = generator.generateContent({
    experience: 10,
    engagement: 100
  });
  console.log('✅ Context-aware generation works');

  console.log('\n🎉 All systems operational!');

} catch (error) {
  console.error('\n❌ Issue detected:', error.message);
  console.error('\n🔧 Troubleshooting steps:');
  console.error('1. Check Node.js version (requires v14+)');
  console.error('2. Run: npm install content-weaver');
  console.error('3. Clear cache: npm cache clean --force');
  console.error('4. Check for conflicting packages');
}
```

Run with: `node diagnostic.js`

## 📦 Installation Issues

### "Cannot find module 'content-weaver'"

**Symptoms:**
```
Error: Cannot find module 'content-weaver'
```

**Solutions:**

1. **Reinstall package:**
```bash
npm uninstall content-weaver
npm install content-weaver
```

2. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. **Check package.json:**
```json
{
  "dependencies": {
    "content-weaver": "^2.0.0"
  }
}
```

4. **Verify installation:**
```bash
ls node_modules/content-weaver
# Should show: package.json, dist/, src/, etc.
```

### "npm ERR! code E404"

**Symptoms:**
```
npm ERR! 404 Not found - GET https://registry.npmjs.org/content-weaver
```

**Solutions:**
1. **Check package name spelling**
2. **Try scoped installation:**
```bash
npm install @contextweaver/content-weaver
```
3. **Install from GitHub:**
```bash
npm install https://github.com/ContextWeaver/context-weaver.git
```

## 🌐 Browser Issues

### "ContextWeaver is not defined"

**Symptoms:**
```
Uncaught ReferenceError: ContextWeaver is not defined
```

**Solutions:**

1. **Check script loading order:**
```html
<!-- ❌ Wrong: Script after your code -->
<script>
  const generator = new ContextWeaver(); // Error!
</script>
<script src="content-weaver.min.js"></script>

<!-- ✅ Correct: Script before your code -->
<script src="content-weaver.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const generator = new window.ContextWeaver(); // Works!
  });
</script>
```

2. **Use DOM ready event:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.ContextWeaver === 'undefined') {
    console.error('Context Weaver library not loaded');
    return;
  }

  const generator = new window.ContextWeaver();
  const content = generator.generateContent();
});
```

3. **CDN loading issues:**
```html
<!-- Try different CDN -->
<script src="https://cdn.jsdelivr.net/npm/content-weaver@2.0.2/dist/browser/content-weaver.min.js"></script>

<!-- Or unpkg -->
<script src="https://unpkg.com/content-weaver@2.0.2/dist/browser/content-weaver.min.js"></script>
```

### "TypeError: Cannot read property 'generateContent' of undefined"

**Symptoms:**
```javascript
const { ContextWeaver } = require('content-weaver');
const generator = new ContextWeaver(); // Works
const content = generator.generateContent(); // Error!
```

**Solutions:**
1. **Check import syntax:**
```javascript
// ❌ Wrong
import ContextWeaver from 'content-weaver';

// ✅ Correct
import { ContextWeaver } from 'content-weaver';

// Or
const { ContextWeaver } = require('content-weaver');
```

2. **Verify build:**
```bash
npm run build
ls dist/
# Should show: index.js, browser/
```

## 🎯 Content Generation Issues

### Empty or null content

**Symptoms:**
```javascript
const content = generator.generateContent();
// content is null or {}
```

**Solutions:**

1. **Check training data:**
```javascript
const generator = new ContextWeaver({
  trainingData: [
    'Sample training sentence one.',
    'Sample training sentence two.',
    'Sample training sentence three.'
  ]
});
```

2. **Disable quality filtering:**
```javascript
const generator = new ContextWeaver({
  enableQualityFiltering: false,
  minQualityScore: 0
});
```

3. **Check for errors:**
```javascript
try {
  const content = generator.generateContent();
  console.log('Generated:', content);
} catch (error) {
  console.error('Generation error:', error);
}
```

### Poor quality content

**Symptoms:**
- Repetitive text
- Nonsensical output
- Low coherence

**Solutions:**

1. **Improve training data:**
```javascript
// Better training data
const qualityTrainingData = [
  'The strategic decision impacted the entire organization.',
  'Market analysis revealed competitive advantages.',
  'Team collaboration led to innovative solutions.',
  'Customer feedback drove product improvements.'
];
```

2. **Adjust Markov settings:**
```javascript
const generator = new ContextWeaver({
  stateSize: 3,  // Higher = more coherent (but less creative)
  trainingData: qualityTrainingData
});
```

3. **Use templates:**
```javascript
const generator = new ContextWeaver({
  enableTemplates: true,
  templateLibrary: 'business'  // Use predefined templates
});
```

## 🧠 Rule Engine Issues

### Rules not applying

**Symptoms:**
```javascript
generator.addCustomRule('test_rule', {
  conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 5 } }],
  effects: { addTags: ['high_level'] }
});

const content = generator.generateContent({ level: 10 });
// No 'high_level' tag applied
```

**Solutions:**

1. **Validate rule syntax:**
```javascript
const rule = {
  conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 5 } }],
  effects: { addTags: ['high_level'] }
};

const validation = generator.validateCustomRule(rule);
if (!validation.valid) {
  console.error('Rule validation errors:', validation.errors);
}
```

2. **Check stat names:**
```javascript
// Context must match rule conditions
const context = {
  level: 10,  // Must match 'stat: level' in rule
  // NOT: userLevel: 10
};
```

3. **Debug rule evaluation:**
```javascript
const generator = new ContextWeaver({
  debug: true,
  enableRuleEngine: true
});

const content = generator.generateContent(context);
console.log('Applied rules:', content._debug.appliedRules);
console.log('Failed rules:', content._debug.failedRules);
```

### Rule conflicts

**Symptoms:**
- Unexpected content modifications
- Rules overriding each other

**Solutions:**

1. **Check rule priority:**
```javascript
// Rules are processed in addition order
generator.addCustomRule('first_rule', { /* ... */ });  // Processed first
generator.addCustomRule('second_rule', { /* ... */ }); // Processed second (can override)
```

2. **Make conditions more specific:**
```javascript
// Instead of general rule
generator.addCustomRule('general', {
  conditions: [{ type: 'stat_greater_than', params: { stat: 'level', value: 5 } }],
  effects: { modifyChoices: { multiply: { rewards: 1.2 } } }
});

// Use specific conditions
generator.addCustomRule('vip_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'level', value: 5 } },
    { type: 'stat_greater_than', params: { stat: 'engagement', value: 1000 } }
  ],
  effects: { modifyChoices: { multiply: { rewards: 1.5 } } }
});
```

## 📊 Performance Issues

### Slow generation

**Symptoms:**
- Content takes >500ms to generate
- High CPU usage

**Solutions:**

1. **Optimize training data:**
```javascript
// Reduce training data size
const optimizedTrainingData = largeDataset
  .filter(sentence => sentence.length > 10)  // Remove short sentences
  .slice(0, 1000);  // Limit to 1000 sentences
```

2. **Simplify rules:**
```javascript
// Instead of many simple rules
for (let i = 0; i < 100; i++) {
  generator.addCustomRule(`rule_${i}`, { /* simple rule */ });
}

// Use fewer complex rules
generator.addCustomRule('complex_rule', {
  conditions: [
    { type: 'stat_between', params: { stat: 'level', min: 0, max: 100 } }
  ],
  effects: { /* comprehensive effects */ }
});
```

3. **Enable caching:**
```javascript
const cache = new Map();

function cachedGenerate(context) {
  const key = JSON.stringify(context);
  if (cache.has(key)) {
    return cache.get(key);
  }

  const content = generator.generateContent(context);
  cache.set(key, content);
  return content;
}
```

### Memory issues

**Symptoms:**
- Out of memory errors
- Slow performance over time

**Solutions:**

1. **Limit training data:**
```javascript
const generator = new ContextWeaver({
  maxTrainingSentences: 2000,  // Limit training data size
  enableMemoryOptimization: true
});
```

2. **Clear caches periodically:**
```javascript
// Clear internal caches
generator.clearCaches();

// Or recreate generator
const freshGenerator = new ContextWeaver({
  trainingData: generator.getTrainingData()  // Preserve training data
});
```

## 🔧 Build and Development Issues

### "babel command not found"

**Solutions:**
```bash
# Install Babel globally
npm install -g @babel/cli @babel/core

# Or use npx
npx babel src --out-dir dist
```

### Browser build fails

**Solutions:**
```bash
# Clear build artifacts
rm -rf dist/
npm run build

# Check browserify installation
npm list browserify
npm install browserify  # If missing
```

### TypeScript errors

**Solutions:**
```bash
# Check TypeScript installation
npm list typescript

# Regenerate type definitions
npm run build
```

## 🌐 Integration Issues

### Unity/Godot export fails

**Symptoms:**
```bash
Error: Export failed for platform unity
```

**Solutions:**
```bash
# Check template library exists
npm run export:unity fantasy

# Verify output directory
ls templates/unity/

# Check Node.js version for ES modules
node --version  # Should be v14+
```

### API responses are malformed

**Solutions:**
```javascript
// Validate response structure
const content = generator.generateContent();
const requiredFields = ['id', 'title', 'description', 'choices'];

const missingFields = requiredFields.filter(field => !(field in content));
if (missingFields.length > 0) {
  console.error('Missing fields:', missingFields);
  // Regenerate or provide fallback
}
```

## 🆘 Advanced Debugging

### Enable debug mode

```javascript
const generator = new ContextWeaver({
  debug: true,
  logLevel: 'verbose'
});

const content = generator.generateContent(context);
console.log('Debug info:', content._debug);
```

### Log generation process

```javascript
const originalGenerate = generator.generateContent;
generator.generateContent = function(context) {
  console.log('Generating content with context:', context);
  const result = originalGenerate.call(this, context);
  console.log('Generated content:', result);
  return result;
};
```

### Profile performance

```javascript
const startTime = Date.now();
const content = generator.generateContent(context);
const duration = Date.now() - startTime;

console.log(`Generation took ${duration}ms`);
if (duration > 100) {
  console.warn('Slow generation detected');
}
```

## 🚑 Emergency Solutions

### Complete reset
```bash
# Nuclear option - complete reset
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verify installation
npm list content-weaver
node -e "console.log('Context Weaver version:', require('content-weaver').ContextWeaver.name)"
```

### Fallback content generation
```javascript
function safeGenerate(generator, context, fallback) {
  try {
    const content = generator.generateContent(context);
    return content && content.title ? content : fallback;
  } catch (error) {
    console.error('Content generation failed:', error);
    return fallback;
  }
}

// Usage
const fallbackContent = {
  title: 'Default Scenario',
  description: 'A basic interactive scenario.',
  choices: [{ text: 'Continue', effect: {}, consequence: 'continue' }]
};

const content = safeGenerate(generator, userContext, fallbackContent);
```

## 📞 Still Stuck?

If these solutions don't work:

1. **Check GitHub Issues**: Search for similar problems
2. **Create a new issue**: Include your diagnostic output
3. **Provide system info**:
   - Node.js version: `node --version`
   - NPM version: `npm --version`
   - OS and version
   - Context Weaver version: `npm list content-weaver`

**Include this diagnostic info:**
```javascript
console.log('System Info:');
console.log('Node:', process.version);
console.log('Platform:', process.platform);
console.log('Context Weaver version:', require('content-weaver/package.json').version);
```

---

**Need more help?** [Open an issue](https://github.com/ContextWeaver/context-weaver/issues/new) with your diagnostic information! 🐛
