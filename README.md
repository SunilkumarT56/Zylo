<p align="center">
  <img width="300" src="https://github.com/user-attachments/assets/918f06c3-6eda-4f0e-b1ef-b077c08acaa6" alt="Zylo Mobile View" />
  <img width="100%" src="https://github.com/user-attachments/assets/61df4cd1-78ed-4d45-9e7f-bbe4cd77c7bd" alt="Zylo Desktop Dashboard" />
</p>

# Zylo — YouTube Automation Pipeline

**Build, configure, and operate production-grade YouTube upload pipelines.**

Zylo is a backend-first YouTube automation platform designed to create, configure, verify, and run scalable upload pipelines for long-form videos and Shorts. It emphasizes **correctness**, **auditability**, and **operational clarity** over magic.

---

## 📚 Table of Contents

1. [Overview](#1-overview)
2. [Core Philosophy](#2-core-philosophy)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Pipeline Lifecycle](#4-pipeline-lifecycle)
5. [Features](#5-features)
6. [UI Overview](#6-ui-overview)
7. [Data Model](#7-data-model)
8. [Configuration Model](#8-configuration-model)
9. [Admin Limits & Safety](#9-admin-limits--safety)
10. [Readiness & Verification](#10-readiness--verification)
11. [Scheduling & Execution](#11-scheduling--execution)
12. [Content Sources](#12-content-sources)
13. [YouTube Integration](#13-youtube-integration)
14. [Metadata & SEO](#14-metadata--seo)
15. [Thumbnails](#15-thumbnails)
16. [Upload Rules](#16-upload-rules)
17. [Analytics & Insights](#17-analytics--insights)
18. [Logs, History & Audits](#18-logs-history--audits)
19. [Security & Permissions](#19-security--permissions)
20. [API Design](#20-api-design)
21. [Backend Implementation](#21-backend-implementation)
22. [Frontend Implementation](#22-frontend-implementation)
23. [Image Uploads (S3)](#23-image-uploads-s3)
24. [Error Handling](#24-error-handling)
25. [Scaling Strategy](#25-scaling-strategy)
26. [Performance Considerations](#26-performance-considerations)
27. [Deployment](#27-deployment)
28. [Environment Variables](#28-environment-variables)
29. [Local Development](#29-local-development)
30. [Testing Strategy](#30-testing-strategy)
31. [CI/CD](#31-cicd)
32. [Observability](#32-observability)
33. [Roadmap](#33-roadmap)
34. [FAQ](#34-faq)
35. [License](#35-license)

---

## 1. Overview

Zylo enables creators and teams to automate YouTube uploads with fine-grained control over sources, metadata, thumbnails, schedules, and safety limits. Pipelines are first-class entities that evolve from creation to verification to execution.

## 2. Core Philosophy

- **Clarity over magic** — every action is explicit.
- **Immutable runs** — each execution is traceable.
- **Least privilege** — permissions are scoped.
- **Fail loudly** — errors are visible and actionable.

## 3. High-Level Architecture

- **API Gateway** — Request validation and authorization.
- **Pipeline Service** — CRUD operations and configuration mutation.
- **Scheduler** — Cron/interval triggers.
- **Worker Pool** — Isolated execution environment.
- **Storage** — S3 for assets, PostgreSQL for state.
- **Integrations** — YouTube OAuth & APIs.

## 4. Pipeline Lifecycle

1.  **Create** — Establish minimal identity.
2.  **Configure** — Set sources, metadata, and schedules.
3.  **Apply Admin Limits** — Enforce safety rails.
4.  **Verify** — Run readiness checks.
5.  **Run** — Manual or scheduled execution.
6.  **Monitor** — Observe logs and analytics.
7.  **Archive** — Lifecycle management.

## 5. Features

- Multi-pipeline management
- Manual & scheduled execution
- Metadata templates
- Auto thumbnails
- Retry & failure handling
- Audit trails

## 6. UI Overview

- **Overview** — Global statistics.
- **Pipeline Detail** — Readiness status, last run details.
- **Settings** — Edit configuration.
- **Logs** — Full execution history.

## 7. Data Model

- `pipelines`
- `pipeline_runs`
- `oauth_accounts`
- `audit_logs`

## 8. Configuration Model

Configuration is stored as **JSONB** in Postgres for flexibility while keeping schema discipline at the application layer.

## 9. Admin Limits & Safety

**Admin-only controls:**

- Max concurrent runs
- CPU / memory caps
- Daily quotas
- Auto-disable on repeated failures

## 10. Readiness & Verification

Readiness checks ensure:

- Source configured
- YouTube connected
- Schedule valid
- Limits applied

## 11. Scheduling & Execution

Supports:

- Manual runs
- Cron expressions
- Interval scheduling

## 12. Content Sources

- File upload
- Drive / object storage (extensible)

## 13. YouTube Integration

- OAuth 2.0
- Channel binding
- Privacy & category controls

## 14. Metadata & SEO

Build dynamic metadata using templating variables:

- `{{title}}`
- `{{description}}`
- `{{tags}}`

## 15. Thumbnails

- **Auto-generated**: Extracted from video content.
- **Template-based**: Overlay text on background images.

## 16. Upload Rules

- Privacy defaults (Private, Unlisted, Public)
- "Made for Kids" flag compliance

## 17. Analytics & Insights

- Success rate tracking
- Time-to-publish metrics

## 18. Logs, History & Audits

Every action is logged for full system traceability.

## 19. Security & Permissions

Role-based access control (RBAC) and scoped actions.

## 20. API Design

RESTful endpoints utilizing clear HTTP verbs and resource naming.

## 21. Backend Implementation

- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Object Storage**: AWS S3

## 22. Frontend Implementation

- **Framework**: React
- **Styling**: Tailwind CSS

## 23. Image Uploads (S3)

Images are uploaded via Multer to the backend, stored in S3, and consumed via public or CDN URLs by the frontend.

## 24. Error Handling

System-wide typed errors with actionable user-facing messages.

## 25. Scaling Strategy

- Horizontal scaling of workers.
- Queue-based execution architecture.

## 26. Performance Considerations

- Memory-bounded uploads to prevent OOM.
- Streaming data processing where possible.

## 27. Deployment

Containerized services designed for environment isolation (Docker).

## 28. Environment Variables

Refer to `.env.example` for required configuration.

## 29. Local Development

```bash
pnpm install
pnpm dev
pnpm tunnel
```

## 30. Testing Strategy

Comprehensive suite including Unit, Integration, and Smoke tests.

## 31. CI/CD

Automated checks and builds on Pull Requests.

## 32. Observability

Integrated Metrics, Structured Logs, and Alerts.

## 33. Roadmap

- [ ] Presigned uploads
- [ ] CloudFront CDN Integration
- [ ] A/B Testing for Thumbnails/Titles

## 34. FAQ

**Is Zylo production ready?**
Yes, it is designed with production constraints and reliability in mind.

## 35. License

[MIT License](LICENSE)
