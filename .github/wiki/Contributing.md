# Contributing to Context Weaver

Thank you for your interest in contributing to Context Weaver! We welcome contributions from developers, writers, designers, and users of all backgrounds.

## Ways to Contribute

### 🐛 Bug Reports
Found a bug? Help us improve by reporting it:

1. **Check existing issues** - Search [GitHub Issues](https://github.com/ContextWeaver/context-weaver/issues) first
2. **Use the bug report template** - Provides all necessary information
3. **Include reproduction steps** - Clear steps to reproduce the issue
4. **Add system information** - Node.js version, OS, browser (if applicable)

### 💡 Feature Requests
Have an idea for a new feature?

1. **Check existing discussions** - Search [GitHub Discussions](https://github.com/ContextWeaver/context-weaver/discussions)
2. **Start a discussion** - Describe your idea and gather feedback
3. **Create an issue** - Use the feature request template
4. **Consider implementation** - Think about how it fits with existing architecture

### 📝 Documentation
Help improve our documentation:

1. **Fix typos and errors** - Small fixes are always welcome
2. **Add examples** - More code examples help users
3. **Write tutorials** - Create guides for specific use cases
4. **Translate content** - Help make Context Weaver accessible globally

### 🛠️ Code Contributions
Ready to write code?

1. **Pick an issue** - Look for [good first issues](https://github.com/ContextWeaver/context-weaver/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
2. **Discuss your approach** - Comment on the issue before starting
3. **Fork and branch** - Create a feature branch for your work
4. **Write tests** - Ensure your changes are well-tested
5. **Submit a PR** - Follow our pull request guidelines

### 🎨 Templates & Content
Contribute content templates:

1. **Create templates** - Design new content structures
2. **Test thoroughly** - Ensure templates work across different contexts
3. **Document usage** - Explain when and how to use your templates
4. **Share training data** - Contribute domain-specific text corpora

## Development Setup

### Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Git**: Latest version

### Local Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/context-weaver.git
cd context-weaver

# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Start development
npm run demo
```

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Write tests for your changes
# Run tests
npm test

# Commit your changes
git add .
git commit -m "feat: Add your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## Code Style Guidelines

### JavaScript/TypeScript

- **ES6+ features** - Use modern JavaScript
- **Async/await** - Prefer over promises for readability
- **Descriptive names** - Use clear, descriptive variable/function names
- **Comments** - Document complex logic and public APIs
- **Error handling** - Use try/catch and proper error messages

```javascript
// ✅ Good
async function generateContent(context) {
  try {
    validateContext(context);
    const content = await processGeneration(context);
    return formatOutput(content);
  } catch (error) {
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

// ❌ Avoid
function gen(ctx) {
  return proc(ctx); // Unclear, no error handling
}
```

### Testing

- **Unit tests** for all functions
- **Integration tests** for key workflows
- **Edge cases** and error conditions
- **Mock external dependencies**

```javascript
// Example test structure
describe('Content Generation', () => {
  test('generates valid content structure', () => {
    const generator = new ContextWeaver();
    const content = generator.generateContent();

    expect(content).toHaveProperty('title');
    expect(content).toHaveProperty('description');
    expect(Array.isArray(content.choices)).toBe(true);
  });

  test('respects context parameters', () => {
    const context = { experience: 50, profile: 'expert' };
    const content = generator.generateContent(context);

    expect(content.difficulty).not.toBe('easy'); // Expert shouldn't get easy content
  });
});
```

### Commit Messages

Follow conventional commit format:

```bash
# Features
feat: Add new template system

# Bug fixes
fix: Resolve memory leak in rule engine

# Documentation
docs: Update API reference

# Tests
test: Add integration tests for templates

# Refactoring
refactor: Simplify Markov chain implementation

# Breaking changes
feat!: Rewrite rule engine API (breaks compatibility)
```

## Pull Request Guidelines

### Before Submitting

1. **Update documentation** - Ensure README and docs reflect your changes
2. **Add tests** - Cover new functionality and edge cases
3. **Run full test suite** - `npm test` passes
4. **Check code style** - Follow established patterns
5. **Test manually** - Verify functionality works as expected

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional context or concerns
```

### Review Process

1. **Automated checks** - Tests and linting run automatically
2. **Code review** - At least one maintainer reviews your code
3. **Feedback** - Address any requested changes
4. **Approval** - PR is approved and merged
5. **Release** - Changes included in next release

## Template Contribution Guidelines

### Template Quality Standards

- **Clear objectives** - Each template serves a specific purpose
- **Balanced choices** - Meaningful consequences for each option
- **Appropriate difficulty** - Matches intended user level
- **Cultural sensitivity** - Avoid problematic stereotypes or content
- **Variable flexibility** - Use variables for customization

### Template Submission Process

1. **Create the template** - Follow the template structure guidelines
2. **Test thoroughly** - Generate content in different contexts
3. **Add documentation** - Explain usage and customization options
4. **Submit via PR** - Include the template file and documentation

### Training Data Contributions

- **High quality** - Well-written, coherent text
- **Domain specific** - Appropriate for intended use case
- **Diverse** - Multiple writing styles and perspectives
- **Licensed appropriately** - Ensure you have rights to share

## Community Guidelines

### Code of Conduct

We follow a simple code of conduct:

- **Be respectful** - Treat everyone with kindness and respect
- **Be constructive** - Focus on improving the project
- **Be patient** - Remember contributors have different backgrounds
- **Be collaborative** - Work together toward common goals

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Discord** - For real-time chat (if available)

## Recognition

Contributors are recognized in several ways:

- **Contributors file** - Listed in CONTRIBUTORS.md
- **Changelog** - Major contributions mentioned in releases
- **GitHub recognition** - As a contributor to the repository
- **Community thanks** - Public appreciation in discussions

## License

By contributing to Context Weaver, you agree that your contributions will be licensed under the same MIT license as the project.

---

**Ready to contribute?** Start with a [good first issue](https://github.com/ContextWeaver/context-weaver/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or check out our [Development Setup](Development-Setup.md) guide!

Thank you for helping make Context Weaver better! 🎉
