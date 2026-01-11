# Installation Guide

This guide covers installing and setting up Context Weaver for your project.

## 📦 NPM Installation

### Latest Stable Version
```bash
npm install content-weaver
```

### Development Version (from GitHub)
```bash
npm install https://github.com/ContextWeaver/context-weaver.git
```

## 🔧 System Requirements

### Minimum Requirements
- **Node.js**: v14.0.0 or higher
- **Memory**: 128MB RAM
- **Storage**: 50MB free space

### Recommended Requirements
- **Node.js**: v16.0.0 or higher
- **Memory**: 256MB RAM
- **Storage**: 100MB free space

### Browser Support (for web demos)
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🚀 Quick Setup

### 1. Install the Package
```bash
npm install content-weaver
```

### 2. Basic Import
```javascript
// ES6 Import
import { ContextWeaver, generateContent } from 'content-weaver';

// CommonJS Require
const { ContextWeaver, generateContent } = require('content-weaver');
```

### 3. Create Your First Generator
```javascript
const generator = new ContextWeaver();

// Generate content
const content = generator.generateContent({
  userLevel: 25,
  engagement: 500,
  influence: 15,
  profile: 'professional'
});

console.log(content.title);
console.log(content.description);
console.log(content.choices);
```

## 🛠️ Advanced Installation Options

### Installing Specific Versions
```bash
# Install exact version
npm install content-weaver@2.0.2

# Install latest 2.x
npm install content-weaver@^2.0.0

# Install beta versions
npm install content-weaver@beta
```

### Installing with Peer Dependencies
```bash
# If you're using additional libraries
npm install content-weaver chance@^1.1.13
```

### Development Installation
```bash
# Clone the repository
git clone https://github.com/ContextWeaver/context-weaver.git
cd context-weaver

# Install dependencies
npm install

# Build for development
npm run build
```

## 🌐 Web Browser Usage

### CDN Installation
```html
<!-- Load Context Weaver from CDN -->
<script src="https://unpkg.com/content-weaver@2.0.2/dist/browser/context-weaver.min.js"></script>

<script>
  // Use globally available ContextWeaver
  const generator = new window.ContextWeaver();
  const content = generator.generateContent();
  console.log(content);
</script>
```

### Local Browser Demo
```bash
# Clone and run the demo
git clone https://github.com/ContextWeaver/context-weaver.git
cd context-weaver/demo-web

# Install demo dependencies
npm install

# Start local server
npm start

# Open http://localhost:3000 in your browser
```

## 🔧 Build Tools Integration

### Webpack
```javascript
// webpack.config.js
module.exports = {
  // ... other config
  resolve: {
    alias: {
      'content-weaver': path.resolve(__dirname, 'node_modules/content-weaver/dist/index.js')
    }
  }
};
```

### Vite
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // ... other config
  optimizeDeps: {
    include: ['content-weaver']
  }
});
```

### TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["node"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 🐳 Docker Installation

### Using Docker Image
```dockerfile
FROM node:18-alpine

# Install Context Weaver
RUN npm install -g content-weaver

# Your application code
COPY . /app
WORKDIR /app

CMD ["node", "your-app.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  context-weaver-app:
    image: node:18-alpine
    volumes:
      - .:/app
    working_dir: /app
    command: sh -c "npm install && npm start"
```

## 🧪 Testing Your Installation

### Basic Functionality Test
```javascript
const { ContextWeaver } = require('content-weaver');

try {
  const generator = new ContextWeaver();
  const content = generator.generateContent();

  if (content && content.title) {
    console.log('✅ Context Weaver installed successfully!');
    console.log('Sample content:', content.title);
  } else {
    console.log('❌ Installation may have issues');
  }
} catch (error) {
  console.error('❌ Installation failed:', error.message);
}
```

### Comprehensive Test
```bash
# Run the test suite
npm test

# Check if browser version loads
node -e "
const fs = require('fs');
const path = './node_modules/content-weaver/dist/browser/context-weaver.min.js';
if (fs.existsSync(path)) {
  console.log('✅ Browser version available');
} else {
  console.log('❌ Browser version missing');
}
"
```

## 🆘 Troubleshooting

### Common Installation Issues

**Issue**: `Cannot find module 'content-weaver'`
```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: `TypeError: Cannot read property 'generateContent' of undefined`
```javascript
// Wrong import
import ContextWeaver from 'content-weaver'; // ❌

// Correct import
import { ContextWeaver } from 'content-weaver'; // ✅
```

**Issue**: Browser console shows "ContextWeaver is not defined"
```html
<!-- Make sure script loads before your code -->
<script src="https://unpkg.com/content-weaver@2.0.2/dist/browser/context-weaver.min.js"></script>
<script>
  // Wait for script to load
  document.addEventListener('DOMContentLoaded', function() {
    const generator = new window.ContextWeaver();
  });
</script>
```

## 📦 Package Information

- **Package Name**: `content-weaver`
- **Version**: 2.0.2
- **License**: MIT
- **Repository**: [GitHub](https://github.com/ContextWeaver/context-weaver)
- **Homepage**: [Live Demo](https://contextweaver.github.io/context-weaver/)
- **Issues**: [GitHub Issues](https://github.com/ContextWeaver/context-weaver/issues)

## 🔄 Migration from rpg-event-generator

If you're migrating from the deprecated `rpg-event-generator` package:

```bash
# Remove old package
npm uninstall rpg-event-generator

# Install new package
npm install content-weaver
```

**API Compatibility**: All existing APIs remain compatible. The only change is the package name and some internal branding.

---

**Next Steps**: Ready to get started? Check out the [Basic Usage Guide](Basic-Usage.md) or explore the [Live Demo](https://contextweaver.github.io/context-weaver/). 🚀
