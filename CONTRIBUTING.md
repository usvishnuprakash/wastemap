# Contributing to WasteMap

Thank you for your interest in contributing to WasteMap! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something to help communities, so let's embody that spirit.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/YOUR_USERNAME/wastemap/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Device/browser information

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would benefit users

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Test thoroughly
5. Submit a PR with:
   - Clear description of changes
   - Screenshots for UI changes
   - Reference to related issues

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/wastemap.git
cd wastemap

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

## Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and small

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add photo upload for spots
fix: resolve location timeout on slow networks
docs: update API documentation
refactor: simplify useDropSpots hook
```

## Questions?

Open an issue with the `question` label or start a discussion.

---

Thank you for helping make waste management better for everyone!
