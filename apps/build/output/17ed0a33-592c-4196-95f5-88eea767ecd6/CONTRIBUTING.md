# devContributing Guide

# Contributing Guide

Thanks for your interest in contributing. This project is a Vercel-inspired build and deployment platform and follows a structured, production-style development workflow.

Please read this guide before opening issues or pull requests.

---

## Prerequisites

Ensure the following tools are installed on your system:

- Node.js (v18 or later)
- pnpm (latest stable version)
- Docker (Docker Desktop or Docker Engine)
- ngrok (for tunneling local services)

Verify installations:

```bash
node -v
pnpm -v
docker --version
ngrok version
```


Thanks for your interest in contributing. This project follows a
clean, predictable engineering workflow. Please read this before
opening issues or pull requests.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies using `pnpm`
4. Create a new branch from `main`

```bash
pnpm dev
git checkout -b feature/your-feature-name
cp .env.example .env
pnpm tunnel
```
