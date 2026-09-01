# Contributing to Swaasa Midha Dhyasa

Thank you for your interest in contributing to **Swaasa Midha Dhyasa**! We welcome bug fixes, feature enhancements, sound design improvements, and UI refinements.

---

## How to Contribute

### 1. Reporting Bugs
Before creating a bug report, please check existing issues to avoid duplicates. When filing an issue, please include:
- A clear, descriptive title.
- Steps to reproduce the behavior.
- Your OS, browser, and device specifications.
- Expected vs. actual behavior.

### 2. Requesting Features
We welcome ideas for new breathing patterns, space themes, or audio features. Please open a Feature Request issue detailing:
- The problem your feature solves or the experience it enhances.
- Suggested implementation details or UI/UX mockups.

### 3. Submitting Pull Requests
1. **Fork the repository** and create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our code style guidelines:
   - Use ES6+ modules.
   - Maintain clean variable naming and concise comments.
   - Ensure `npm run build` compiles with zero errors.
3. **Commit your changes**:
   Use clear, conventional commit messages (e.g., `feat: add new breath pattern`, `fix: volume slider sync`).
4. **Push to your fork** and submit a Pull Request to `main`.

---

## Development Guidelines

- Keep audio synthesis routines lightweight and performant.
- Ensure all visual canvas animations run at a smooth 60 FPS across desktop and mobile devices.
- Respect accessibility and contrast standards for typography and interactive controls.

Thank you for helping build a peaceful digital sanctuary for everyone!
