# 🤝 Contributing to Space

We welcome contributions to the Space Studio! To maintain a high standard of code quality and aesthetic consistency, please follow these guidelines.

## 🛠️ Development Standards

### 1. Code Style
- **Naming**: Use precise, domain-specific names (avoid `data`, `item`, `handleX`).
- **Logic**: UI components should not contain API logic. Move business logic to the `lib/services` layer.
- **Styling**: Stick to the predefined design tokens in `index.css`. Avoid ad-hoc utility classes for layout.

### 2. TypeScript
- Always define interfaces for component props and API responses.
- Avoid type casting (`as any`) unless absolutely necessary.

### 3. Git Workflow
- Create feature branches: `feature/your-feature-name`.
- Use descriptive commit messages: `feat(ui): add new knowledge editor modal`.
- Ensure all commits pass linting and build checks.

## 🎨 Visual Guidelines
Space is a "Quiet Studio."
- Maintain the **Warm Parchment** aesthetic.
- Use smooth transitions (`transition-all duration-200`).
- Favor Serif fonts for headers and Mono for technical data.

## 📝 Pull Request Process
1. Update the documentation in `docs/` if you change architecture.
2. Include screenshots or recordings of UI changes.
3. Request a review from the core maintainers.

---
*Thank you for helping us build a calmer Discord management experience.*
