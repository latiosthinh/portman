# Phase 2: Electron Packaging & CLI - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase packages the existing Local Port Dashboard (server.js + public/index.html) as a distributable Electron desktop application with a CLI entry point. The existing Express backend and vanilla HTML/CSS/JS frontend remain unchanged — this phase adds the Electron wrapper, build configuration, and CLI command.

Cross-platform support for macOS/Linux is deferred to Phase 3. This phase targets Windows only.

</domain>

<decisions>
## Implementation Decisions

### Architecture
- **D-01:** Embed Express server inside Electron main process — Electron starts Express on startup, loads the dashboard via localhost URL in the BrowserWindow. Server lifecycle is tied to app lifecycle (server dies when app closes).
- **D-02:** Existing `server.js` and `public/index.html` are reused as-is — no refactoring needed for the initial Electron integration.

### CLI Behavior
- **D-03:** `local-port-dashboard` CLI command launches the Electron app window and then exits. No persistent terminal process, no headless mode, no additional CLI subcommands.

### Build Configuration
- **D-04:** Target Windows only for this phase. Use electron-builder configured for Windows (NSIS installer + portable .exe).
- **D-05:** macOS and Linux build targets are deferred to Phase 3 (Cross-Platform Support).

### Port Configuration
- **D-06:** Express server port should be configurable via environment variable (e.g., `PORT` env var) with fallback to default `8765`. This allows conflict avoidance and future flexibility.
- **D-07:** Electron main process should handle port-in-use errors gracefully (show error dialog if port is occupied).

### the agent's Discretion
- Exact electron-builder configuration details (icon, app name, publisher) are left to the planner's discretion based on standard Electron conventions.
- Whether to use `electron-is-dev` or similar dev/production detection is up to the planner.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, tech stack, key decisions
- `.planning/REQUIREMENTS.md` — PKG-01, PKG-02 requirements for this phase
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, UI hint

### Existing Code
- `server.js` — Express backend to be embedded in Electron
- `public/index.html` — Frontend dashboard to be loaded by BrowserWindow
- `package.json` — Current dependencies (electron, express), bin declaration

### No external specs
No external specs or ADRs referenced — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server.js` — Complete Express API with `/api/ports` and `/api/kill/:pid` endpoints. Can be imported directly into Electron main process.
- `public/index.html` — Self-contained dashboard UI with all CSS/JS inline. Can be loaded via `loadURL('http://localhost:${PORT}')` or `loadFile()`.
- `package.json` — Already declares electron dependency and bin entry point.

### Established Patterns
- Express + vanilla JS stack (no build step, no bundler)
- Windows-specific commands: `netstat -ano`, `tasklist`, `taskkill /F`
- Dark theme with Tailwind-like color palette (#0f172a, #1e293b, #3b82f6)

### Integration Points
- Electron `main.js` needs to: (1) start Express server, (2) create BrowserWindow, (3) load dashboard URL
- `bin/cli.js` needs to invoke Electron binary
- `package.json` needs `main` field pointing to `main.js` and electron-builder config

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the decisions above — open to standard Electron conventions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-electron-packaging-cli*
*Context gathered: 2026-04-21*
