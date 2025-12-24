# GEMINI.md - Context & Rules for structured-reporting-web-tools

## 1. Project Context (專案背景)

- **Project Name**: Structured Reporting Web Tools
- **Author**: Dr. I-Ta Tsai (Radiologist)
- **Description**: A collection of web-based tools designed for Radiologists to generate structured reports (e.g., Lung-RADS, HCC, Adrenal washout).
- **Goal**: Create fast, reliable, and medically accurate HTML/JS tools that run in a browser. The final output is text specifically formatted for pasting into PACS/RIS systems.

## 2. Tech Stack & Architecture (技術架構)

- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Build System**: Webpack (Note: Ensure `webpack.config.js` is respected when adding new assets).
- **Structure**:
  - `src/`: Contains source JavaScript logic and templates.
  - `public/`: Static HTML entry points (or templates).
  - `dist/`: Output directory (do not edit manually).
- **Styling**: Keep it lightweight (Vanilla CSS or Bootstrap if configured). Focus on high contrast and readability for medical reading rooms (dim light environments).
- Use pnpm as package manager.

## 3. Coding Guidelines (開發準則)

### A. Logic & Accuracy (邏輯精確性)

- **Medical Logic**: Calculations (e.g., Tumor size, Washout %) must be mathematically precise. Always double-check logic against provided guidelines (e.g., ACR Lung-RADS v2022).
- **Validation**: Inputs must have validation (e.g., prevent negative numbers for size).

### B. User Interface (UI/UX)

- **Simplicity**: Interfaces should be dense but clean. Radiologists need to see information at a glance. Avoid excessive scrolling.
- **Input Methods**: Prefer Radio buttons or clickable badges over dropdown menus for faster clicking.
- **Dark Mode**: If possible, support a dark theme as default, as reading rooms are dark.

### C. Output & Integration (輸出與整合)

- **Copy Feature**: Every tool MUST have a prominent "Copy Report" button.
- **Format**: The generated text should be clean, without HTML tags (plain text), unless rich text is specifically requested.
  - _Example_: `Lung-RADS Category: 4A (Suspicious)`
- **AutoHotkey Friendly**: Use standard DOM IDs (e.g., `id="btn-copy"`) to allow external automation tools like AutoHotkey to easily interact with the page.

## 4. Preferred Tone & Language (語言偏好)

- **UI Language**: Traditional Chinese (繁體中文) for labels/instructions, or Medical English where appropriate.
- **Code Comments**: English.
- **Response Style**: Be concise, professional, and solution-oriented.

## 5. Specific Tasks (常見任務)

- **Refactoring**: When moving legacy HTML code to `src/` modules, ensure variable scope is handled correctly.
- **New Tools**: When asking to create a new calculator, expect to provide the medical scoring table first.

## 6. Agent Persona

- 產出程式碼時，請預設加入適當的註解 (Traditional Chinese)。
- 修改既有程式碼時，請保留原程式碼的註解。
- 請使用中文與我溝通。

---

_Note to AI: The user is an experienced Radiologist and hobbyist developer. Prioritize medical correctness and workflow efficiency (fewer clicks)._
