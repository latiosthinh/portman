# PortMan 💪

> **Kill ports, not vibes.** The fastest way to view and manage local ports.

[![npm](https://img.shields.io/npm/v/portman.svg)](https://www.npmjs.com/package/portman)
[![npm](https://img.shields.io/npm/dt/portman.svg)](https://www.npmjs.com/package/portman)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://www.npmjs.com/package/portman)
[![license](https://img.shields.io/npm/l/portman.svg)](https://www.npmjs.com/package/portman)
[![size](https://img.shields.io/bundlephobia/min/portman)](https://www.npmjs.com/package/portman)

---

## 🚀 Quick Start

```bash
# No install needed - run instantly
npx portman

# Or install globally
npm install -g portman
portman
```

---

## ✨ Features

- ⚡ **Lightning fast** - 22ms refresh with intelligent caching
- 🎯 **Smart grouping** - Ports organized by application
- 🧠 **Persistent hiding** - Hide apps forever, saved locally
- 🖥️ **Cross-platform** - Windows, macOS, Linux
- 🎨 **Beautiful TUI** - Clean, modern terminal interface
- 📦 **Zero dependencies** - Pure Node.js, ~50KB total
- 🔒 **Privacy-first** - All data stays on your machine

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate ports |
| `Space` | Kill selected process |
| `h` | Hide this port (session) |
| `H` | Hide entire app (permanent) |
| `s` | Toggle system processes |
| `r` | Refresh port list |
| `u` | Unhide everything |
| `1` - `9` | Quick kill by ID |
| `q` | Quit |

---

## 📸 Screenshots

### Interactive Mode
```
portman v1.0.0 (win32)
─────────────────────────────────────────────────────────────────

  steam.exe (4 ports)
    ▶ 01  27036  0.0.0.0          8872  active
       02  27060  0.0.0.0          8872  active
       03  65022  0.0.0.0          8872  active
       04  65023  0.0.0.0          8872  active

  Code.exe (1 port)
       05  5500   127.0.0.1       20024  active

─────────────────────────────────────────────────────────────────
  5 ports  2 apps  0 hidden

  ↑↓ navigate  space kill  h hide port  H hide app  s system  r refresh  u unhide all  1-9 quick kill  q quit
```

### Non-Interactive (Piped Output)
```bash
$ portman > ports.txt
```

```
ID   APP                                    PORTS
────────────────────────────────────────────────────────────
 01   Code.exe                               5500
 02   steam.exe                              27036, 27060, 65022, 65023
 03   PanGPS.exe                             4767
 04   ArmouryCrateControlInterface.exe       7778, 50923
 05   AsusSoftwareManager.exe                24830
```

---

## 🎯 Use Cases

### Development
```bash
# Find what's using port 3000
portman | grep 3000

# Kill it fast (navigate + space, or type "3" + Enter)
```

### Clean Up
```bash
# Hide apps you don't care about (press H)
# They'll stay hidden forever in ~/.portman/config.json
```

### Scripting
```bash
# Get all ports as text
portman > report.txt

# Check if a port is in use
portman | grep -q 3000 && echo "Port 3000 is busy"
```

---

## 🔧 Configuration

PortMan stores hidden apps in:
- **Windows:** `C:\Users\You\.portman\config.json`
- **macOS/Linux:** `~/.portman/config.json`

```json
{
  "hiddenApps": ["steam.exe", "OneDrive.exe"]
}
```

Edit this file manually or use `H` in the app to hide, `u` to unhide all.

---

## 🛠️ Development

```bash
# Clone and install (zero dependencies!)
git clone https://github.com/portman/portman.git
cd portman

# Run directly
node bin/cli.js

# Link globally for testing
npm link
portman

# Test non-interactive mode
node bin/cli.js > output.txt
```

---

## 🏗️ How It Works

PortMan uses native OS commands - **no dependencies required**:

| Platform | Port Detection | Process Kill |
|----------|---------------|--------------|
| Windows | `netstat -ano` | `taskkill /PID` |
| macOS | `lsof -i -P -n` | `kill -9` |
| Linux | `ss -tlnp` | `kill -9` |

Process names are cached for 5 seconds for instant refresh.

---

## 📊 Performance

| Action | Time |
|--------|------|
| First run | ~1.3s |
| Cached refresh | ~22ms ⚡ |
| Package size | ~50KB |
| Dependencies | 0 |

---

## 🙋 FAQ

**Q: Why isn't `npx portman` showing the latest features?**  
A: Make sure you're using the latest version from npm. For development, use `npm link`.

**Q: Where are hidden apps stored?**  
A: `~/.portman/config.json` - edit this file to manage hidden apps.

**Q: Can I hide system processes?**  
A: System processes are hidden by default. Press `s` to show them.

**Q: Does this work on WSL?**  
A: Yes! PortMan detects the platform and uses appropriate commands.

**Q: Is this safe?**  
A: PortMan only shows and kills processes you have permission to kill. Admin/sudo may be required for system processes.

---

## 🤝 Contributing

Contributions welcome! Areas we'd love help:

- 🎨 Custom themes/colors
- 📊 Export to JSON/CSV
- 🔍 Search/filter functionality
- 🧪 Automated tests

```bash
# Fork, clone, and submit a PR
git clone https://github.com/portman/portman.git
```

---

## 📝 Changelog

### v1.0.0
- ✨ Initial release
- 🎯 Port grouping by application
- 🧠 Persistent app hiding
- ⚡ 50x faster refresh with caching
- 🖥️ Cross-platform support

---

## 📄 License

MIT © [PortMan Team](https://github.com/portman/portman)

---

<div align="center">

**Made with ❤️ for developers everywhere**

[Report Issue](https://github.com/portman/portman/issues) • [Request Feature](https://github.com/portman/portman/issues) • [Discussions](https://github.com/portman/portman/discussions)

</div>
