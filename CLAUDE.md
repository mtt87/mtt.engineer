# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog at **mtt.engineer** - a full-stack static site with:
- **Frontend**: Astro 5 + TypeScript + Tailwind CSS 4
- **Backend**: Rust server (Axum) serving static files
- **Deployment**: Docker → Raspberry Pi 5 → Cloudflare Tunnel

## Commands

### Website (in `/website`)

```bash
bun install          # Install dependencies
bun dev              # Dev server (localhost:4321)
bun run build        # Production build → dist/
npm run check-spell  # Spell check content
```

### Server (in `/server`)

```bash
cargo build --release   # Build release binary
cargo run               # Run server (serves ./dist on port 3000)
cargo fmt               # Format Rust code
cargo clippy            # Lint
```

### Docker (from root)

```bash
docker build -t mtt.engineer .
docker run -p 3000:3000 mtt.engineer
```

## Architecture

```
website/
├── src/
│   ├── content/posts/     # Markdown blog posts (typed frontmatter via Zod)
│   ├── pages/             # Astro file-based routing
│   │   ├── index.astro    # Home
│   │   ├── cv.astro       # CV page (renders resume.json)
│   │   └── posts/[post].astro  # Dynamic blog post route
│   ├── layouts/           # BaseLayout.astro (header/footer)
│   └── resume.json        # CV data (JSON Resume format)
└── public/                # Static assets (images, PDF)

server/
└── src/main.rs            # Axum server - static file serving with tracing
```

## Key Patterns

- **Content Collections**: Blog posts use Astro content collections with Zod schema validation for frontmatter (title, description, keywords, dates)
- **Resume as Data**: Single `resume.json` source renders to HTML (`/cv`), JSON (`/cv.json`), and PDF
- **Multi-stage Docker**: Builds website (bun) → builds server (cargo) → minimal runtime image

## Formatting

- Astro/TypeScript/JSON/Markdown/CSS: Prettier (with Astro + Tailwind plugins)
- Rust: rustfmt via rust-analyzer
- VS Code format-on-save is configured
