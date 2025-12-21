
<img width="822" height="391" alt="Screenshot 2025-12-21 at 2 30 33 PM" src="https://github.com/user-attachments/assets/7e331b0d-39d8-4ddd-967c-b7cf9b4be5e0" />
<img width="1710" height="1016" alt="Screenshot 2025-12-21 at 2 42 43 PM" src="https://github.com/user-attachments/assets/71691536-3764-44f9-8556-855cc9488f93" />



---
## Auth Flow

<img width="2263" height="1531" alt="Zylo-Auth" src="https://github.com/user-attachments/assets/f3110d01-d569-456d-9d93-7ee8d57b0d04" />

---

---

## Zylo

Zylo is a lightweight, distributed build-and-deployment platform inspired by modern edge-first hosting systems.
It automates the process of building, deploying, and serving web applications from source code to production.

The goal of Zylo is simplicity, transparency, and control — no magic, no hidden abstractions.

---

## What Zylo Does

- Accepts source code via Git or upload
- Runs isolated builds in sandboxed environments
- Generates production-ready artifacts
- Stores build outputs in a distributed storage layer
- Serves deployments through a routing layer
- Provides unique deployment URLs per build
- Streams real-time build logs and status updates

---

## Core Philosophy

- Infrastructure should be understandable
- Builds should be reproducible
- Deployments should be immutable
- Logs should be accessible
- Systems should fail loudly, not silently

---

## High-Level Architecture

Zylo is composed of independent services:

- Ingest Service – receives deployment requests
- Build Service – executes builds in isolated containers
- Storage Service – persists build artifacts
- Deploy Service – manages versions and rollbacks
- Routing Layer – maps domains to deployments
- Log Stream – streams build and runtime logs

Each service communicates through APIs or events.

---

## Tech Stack

- Backend: Node.js + TypeScript
- Build Isolation: Docker
- Queue / Events: Kafka or Redis Streams
- Storage: Object storage (S3-compatible)
- Database: PostgreSQL
- Reverse Proxy: Nginx
- Runtime: Linux-based containers

---

## Deployment Flow

1. User triggers a deployment
2. Zylo validates project configuration
3. Source code is pulled into a sandbox
4. Dependencies are installed
5. Build command is executed
6. Artifacts are generated
7. Artifacts are uploaded to storage
8. A deployment record is created
9. Routing is updated
10. Deployment goes live

---

## Features

- Deterministic builds
- Versioned deployments
- Rollback support
- Real-time build logs
- Preview URLs per deployment
- Stateless edge routing
- Horizontal scalability

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/SunilkumarT56/zylo.git
cd zylo
npm install
