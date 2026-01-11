# Migration Guide

This guide helps you migrate from `rpg-event-generator` to `context-weaver`.

## Quick Migration

### Step 1: Update Package
```bash
# Remove old package
npm uninstall rpg-event-generator

# Install new package
npm install content-weaver
```

### Step 2: Update Imports
```javascript
// Before
import { RPGEventGenerator } from 'rpg-event-generator';

// After
import { ContextWeaver } from 'content-weaver';
```

### Step 3: Update Instantiation
```javascript
// Before
const generator = new RPGEventGenerator();

// After (API is identical)
const generator = new ContextWeaver();
```

## API Compatibility

**✅ 100% Backward Compatible** - All existing code continues to work unchanged.

The only changes required are:
- Package name in dependencies
- Import statements
- Optional: Update class names for clarity

## Detailed Changes

### Package Name
- **Old**: `rpg-event-generator`
- **New**: `content-weaver`

### Branding
- **Old**: RPG-focused naming
- **New**: Broad applicability across domains

### Homepage
- **Old**: Netlify deployment
- **New**: GitHub Pages deployment

## Troubleshooting Migration

### "Cannot find module 'rpg-event-generator'"
```bash
# Install the new package
npm install content-weaver

# Update your imports
import { ContextWeaver } from 'content-weaver';
```

### Deprecation Warnings
If you still have the old package installed, you'll see:
```
npm WARN deprecated rpg-event-generator@x.x.x: Please use 'content-weaver' instead
```

This is normal - just migrate to the new package.

## Benefits of Migration

- **Broader ecosystem** - Works for gaming, business, education, and more
- **Active development** - Continued feature development and support
- **Better documentation** - Comprehensive guides and examples
- **Community support** - Growing community of contributors

## Need Help?

- [Installation Guide](Installation.md) - Detailed setup instructions
- [FAQ](FAQ.md) - Common questions and answers
- [GitHub Issues](https://github.com/ContextWeaver/context-weaver/issues) - Report migration issues
