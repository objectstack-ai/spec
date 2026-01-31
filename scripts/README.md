# Development Scripts

This directory contains helper scripts to simplify common development tasks.

## Scripts

### dev.sh

Main development helper script that provides common tasks:

```bash
./scripts/dev.sh <command> [options]
```

**Commands:**
- `setup` - Initialize development environment
- `dev [package]` - Start development mode (watch mode)
- `build [package]` - Build package(s)
- `test [package]` - Run tests for package(s)
- `clean` - Clean all build artifacts
- `doctor` - Check development environment health
- `create <type>` - Create new package/plugin/example
- `link` - Link all workspace packages
- `help` - Show help message

**Examples:**
```bash
./scripts/dev.sh setup              # Setup development environment
./scripts/dev.sh dev spec           # Watch mode for @objectstack/spec
./scripts/dev.sh build cli          # Build @objectstack/cli
./scripts/dev.sh test spec          # Test @objectstack/spec
./scripts/dev.sh doctor             # Check environment health
```

## Adding New Scripts

When adding new scripts:

1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add documentation to this README
3. Follow the existing code style
4. Use colored output for better UX
5. Provide helpful error messages

## Best Practices

- Always check prerequisites before running commands
- Provide clear error messages with fix suggestions
- Use `set -e` to fail fast on errors
- Add help text with `--help` flag
- Color code output (info, success, warning, error)
