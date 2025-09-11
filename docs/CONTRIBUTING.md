# 🤝 Contributing to Tools Hub

Thank you for your interest in contributing!
This document provides guidelines for contributing to the Tools Hub project.

---

## 🛠️ Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/tariqul420/tools-hub.git
   cd tools-hub
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

---

## 🌱 Contribution Workflow

1. Create a new branch for your feature or fix:

   ```bash
   git checkout -b feature/tool-name
   ```

   Example: `feature/pdf-merge-tool`

2. Make your changes (code, tests, docs).

3. Commit with a clear message:

   ```bash
   git commit -m "feat: add pdf merge tool with drag-and-drop UI"
   ```

   - Use [Conventional Commits](https://www.conventionalcommits.org/) style:

     - `feat:` → new feature
     - `fix:` → bug fix
     - `docs:` → documentation change
     - `chore:` → maintenance, config updates

4. Push your branch:

   ```bash
   git push origin feature/tool-name
   ```

5. Open a **Pull Request**:

   - Title: short summary of the change
   - Description: explain the problem, solution, screenshots (if UI)
   - Link any related issues

---

## 🧪 Code Guidelines

- **Framework:** Next.js (App Router)
- **UI:** ShadCN + TailwindCSS
- **Code Style:** TypeScript, ESLint, Prettier
- **Tests:** Add tests if adding new logic or fixing a bug
- **Accessibility:** Use semantic HTML, ARIA attributes when needed
- **Performance:** Ensure Core Web Vitals-friendly

---

## ✅ Pull Request Checklist

Before submitting:

- [ ] Code builds without errors (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Added/updated documentation if needed
- [ ] Tested locally (UI + functionality)
- [ ] Screenshots included (if UI change)

---

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [ShadCN UI](https://ui.shadcn.com)
- [Prisma ORM](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🙏 Thanks

Your contributions make **Tools Hub** better for everyone.
We appreciate your help in building an open, useful platform!
