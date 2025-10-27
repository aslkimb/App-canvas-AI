# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup
```bash
npm install
```

### Running the Application
```bash
npm run dev
# Dev server runs on http://localhost:3005
```

### Building
```bash
npm run build
# Outputs to dist/
```

### Testing
```bash
npm test                  # Run all Playwright tests
npm run test:ui          # Run tests with UI mode
npm run test:report      # View test report
```

### Preview Production Build
```bash
npm run preview
```

## Environment Configuration

Create a `.env.local` file with:
```
GEMINI_API_KEY=your_api_key_here
```

The app uses Google's Gemini API for AI generation. API key can also be set via the in-app Settings panel (stored in localStorage as `appcanvas_apikey`).

## Architecture Overview

### Application Flow
This is an **AI-powered application planning tool** that guides users through 8 steps to design an app from initial idea to complete technical specification:

1. **Refine Idea & Define Modules** - AI refines user input and creates high-level modules
2. **Define Features** - Identifies key features within each module
3. **Detail User Actions** - Breaks features into atomic user actions
4. **Design Pages & User Flow** - Outlines pages and navigation
5. **Define Database Schema** - Creates data models and relationships
6. **Plan Feature Implementation** - Details state management, forms, authorization
7. **Define Backend Logic** - Outlines API endpoints and cron jobs
8. **Establish Design System** - Creates color palette, typography, and style guidelines

### Core State Management
- **App.tsx** is the main orchestrator (~1000+ lines)
- Central state includes: `appData` (accumulated results from each step), `activeStep`, `completedSteps`, `clarification` (for MCPS), and UI state
- Each step uses structured JSON schemas (defined in `constants.ts`) to ensure consistent AI output
- **Multi-Clarification Prompting System (MCPS)**: Steps request 2 clarifying questions with 3 options each before generation

### Key Technical Patterns

#### AI Service Integration
- **services/geminiService.ts**: Wraps Google Gemini API
  - Supports two modes: `generation` (for structured step output) and `clarification` (for MCPS questions)
  - Implements 3-retry logic with exponential backoff for transient errors
  - Has response caching mechanism for expensive calls
  - Parses and formats API errors into user-friendly messages

#### Schema-Driven Generation
All 8 steps use strict JSON schemas from `constants.ts`:
- Schemas use `@google/genai` Type system
- Enforce structure like `refinedIdea + modules[]`, `features[]`, `pages[]`, `database[]`, etc.
- IDs follow conventions: `snake_case` for most entities, `PascalCase` for database entities

#### Component Architecture
**Diagram Components** (components/):
- `MindMap.tsx` - Hierarchical tree view of modules → features → actions
- `PageDiagram.tsx` - Page flow visualization with D3.js force simulation
- `EntityDiagram.tsx` - Database ERD with D3.js
- `FeatureDetailDiagram.tsx` - Implementation details per feature
- `BackendDiagram.tsx` - API functions grouped by feature
- `DesignSystemDiagram.tsx` - Visual design guidelines display

Each diagram component:
- Accepts `appData`, `onNodeSelect`, `selectedNodeIds`, `highlightedNodeIds`, `searchTerm`
- Implements search/highlight via search term matching
- Supports node selection for InspectorPanel sync

**UI Components**:
- `InspectorPanel.tsx` - Right sidebar showing selected node details
- `ClarificationModal.tsx` - Multi-question modal for MCPS
- `SettingsPanel.tsx` - API key + model selection
- `ExportModal.tsx` - Export as JSON, Text, or PNG (via html2canvas)

### Data Flow
1. User enters idea → Step 0 (IdeaInput)
2. For each subsequent step (1-8):
   - If step requires clarification → show ClarificationModal with AI-generated questions
   - User answers → context passed to generation prompt
   - AI generates structured JSON → stored in `appData[stepId]`
   - Step marked complete → user advances to next step
3. Each step builds on previous step data (e.g., features need modules, actions need features)

### Theme & Styling
- Uses **Tailwind CSS** (loaded via CDN in index.html)
- Supports light/dark mode (stored in localStorage as `appcanvas_theme`)
- Dark mode class applied to `<html>` element
- Custom grid pattern background (`.bg-grid-pattern`)

### Type System
**types.ts** defines:
- `AppData` - Indexed by step number (1-8), each step has specific shape
- `Step` interface with `id`, `name`, `prompt()`, `schema`, `needsClarification`, `clarificationPrompt()`
- Entity types: `Module`, `Feature`, `Action`, `Page`, `Entity`, `FeatureDetail`, `BackendFunction`, `CronJob`, `DesignGuidelines`

### Build Configuration
- **Vite** for bundling (React + TypeScript)
- Dev server on port 3005, bound to `0.0.0.0`
- Environment variables injected via `define` in vite.config.ts
- Path alias: `@/` → project root
- Import map in index.html for AI Studio CDN (React 19, @google/genai, D3, html2canvas)

## Important Notes

- **No .env.local in repo** - Users must create it manually or use Settings panel
- **Large App.tsx** - Main logic concentrated here; consider refactoring into hooks if modifying
- **No TypeScript checking script** - Add `"typecheck": "tsc --noEmit"` to package.json if needed
- **No linting script** - No ESLint configuration present
- **Playwright tests** exist but location not specified in codebase
- **Gemini API models supported**: gemini-2.5-pro, gemini-2.5-flash (defined in constants.ts)
- **LocalStorage keys**: `appcanvas_theme`, `appcanvas_apikey`, `appcanvas_model`

## Project Source
Created via Google AI Studio. View original: https://ai.studio/apps/drive/16cK-W-UHDDwCd5J1V6q7CUxyYjch-VXp
