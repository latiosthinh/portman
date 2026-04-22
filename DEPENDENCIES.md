# PortMan Dependencies

## Runtime Dependencies
**None!** PortMan has zero dependencies.

It uses only Node.js built-in modules:
- `child_process` - Execute OS commands
- `readline` - Interactive TUI
- `os` - Platform detection
- `fs` - Config file I/O
- `path` - Path resolution

## Development Dependencies
None required for development.

## Why Zero Dependencies?

1. **Security** - No supply chain attacks
2. **Size** - ~50KB total package size
3. **Speed** - No `node_modules` to install
4. **Reliability** - No breaking changes from dependencies
5. **Simplicity** - Easy to audit and maintain

PortMan proves you don't need hundreds of dependencies to build a great CLI tool!
