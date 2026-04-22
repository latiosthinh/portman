# PortMan 💪

**Cross-platform port killer CLI — view and kill local ports with style**

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![npm](https://img.shields.io/npm/v/portman)
![license](https://img.shields.io/npm/l/portman)

## Quick Start

### Run without installing

```bash
npx portman
```

### Install globally

```bash
npm install -g portman
```

Then run:

```bash
portman
```

## Features

- 🔍 **View all user ports** with process details
- ⚡ **Kill processes** with a single keystroke
- 🎨 **Beautiful terminal UI** with smooth navigation
- 🖥️ **Cross-platform** — Windows, macOS, Linux
- 🚀 **No installation required** — run via npx
- 🎯 **Dev-focused** — hides system processes by default

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate port list |
| `Space` | Kill selected process |
| `h` | Hide process |
| `s` | Toggle system processes |
| `r` | Refresh |
| `u` | Unhide all |
| `1-9` | Quick kill by ID |
| `q` | Quit |

## Screenshot

```
portman v1.0.0 (win32)
─────────────────────────────────────────────────────────────────

   1   3000   node.exe                   12345  active
   2   8080   java.exe                   67890  active
   3   5432   postgres.exe               11111  active

─────────────────────────────────────────────────────────────────
  3 visible  15 total  0 hidden  localhost only

  ↑↓ navigate  space kill  h hide  s system  l toggle localhost  r refresh  u unhide  1-9 quick kill  q quit
```

## Non-Interactive Mode

Pipe or redirect output for scripting:

```bash
portman > ports.txt
```

Shows a simple table without interactive UI.

## Development

```bash
# Install dependencies (none required!)
npm install

# Run CLI
node bin/cli.js

# Link locally for testing
npm link
portman
```

## How It Works

PortMan uses native OS commands to detect and manage ports:

- **Windows:** `netstat` + `taskkill`
- **macOS:** `lsof` + `kill`
- **Linux:** `ss`/`netstat` + `kill`

No dependencies required!

## License

MIT
