# Fullstack Notes

Fullstack Notes is a modern, production-grade web application built to deliver secure, multi-user note management. Utilizing a `pnpm workspace`monorepo architecture, the project combines an **Express 5** and **MongoDB** backend with a **React 19** frontend to provide end-to-end authentication, robust **RESTful APIs**, and optimized modern web performance.

## Key Features

- **User Authentication & Security**: Password hashing via `bcrypt`, JSON Web Token (JWT) stateless authorization, and route guard middleware.
- **Note Management**: Complete CRUD workflows (create, read, toggle importance, delete) with owner isolation.
- **Integrated Monorepo**: Structured workspace isolating frontend, backend, and end-to-end testing packages via `pnpm`.
- **Production Health Checks**: Health monitoring endpoint (/api/health) featuring database connection state validation and ping checks.
- **In-Memory Test Environment**: Isolated backend testing using `mongodb-memory-server` to eliminate database dependencies during integration testing.
- **High-Performance Tooling**: Fast linting and formatting using `oxlint` and `oxfmt`, coupled with `husky` git hooks and `lint-staged`.

## Tech Stack

- **Backend**: Node.js (v25), Express.js (v5), Mongoose, MongoDB, Zod, T3 Env Core.
- **Frontend**: React (v19), React Compiler, Vite, Axios.
- **Testing & Code Quality**: Vitest (v4), Playwright, Supertest, mongodb-memory-server, Oxlint, Oxfmt.
- **DevOps & Containerization**: Docker (Multi-stage build), Fly.io, GitHub Actions CI/CD.


## Architecture / System Overview

```plaintext
.
├── apps/
│   ├── client/          # React 19 single-page application (Vite)
│   ├── server/          # Express 5 REST API & Mongoose models
│   └── e2e/             # Playwright end-to-end testing suite
├── .github/
│   └── workflows/       # GitHub Actions CI/CD workflow
├── Dockerfile           # Multi-stage production container setup
├── pnpm-workspace.yaml  # Monorepo workspace configuration
├── vitest.config.js     # Root test orchestration
└── package.json         # Root scripts & dev dependencies
```

In development, **Vite** proxies requests from `/api` to `http://localhost:3001`. In production, **Express** serves the compiled static React build from the `public` directory.

## Getting Started

Ensure you have the following installed on your machine:

- **Node.js**: `>= 25.0.0`
- **pnpm**: `>= 11.0.0`
- **Corepack**: Enabled (`corepack enable`)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### Installation

1. Clone the repository:

  ```Bash
  git clone https://github.com/marekzelinka/notes-app.git
  cd notes-app
  ```

2. Enable **Corepack** and install workspace dependencies:

  ```Bash
  corepack enable
  pnpm install
  ```

3. Setup environment variables for the server package (see Configuration).

### Configuration

Create a `.env` file inside the `apps/server` directory based on the following environment schema:

| Variable                    | Description                                             | Required       | Default     |
|-----------------------------|---------------------------------------------------------|----------------|-------------|
| PORT                        | HTTP Server port                                        | No             | 3001        |
| NODE_ENV                    | Application environment (development, test, production) | No             | development |
| MONGODB_URI                 | MongoDB connection string                               | Yes (dev/prod) | N/A         |
| SECRET_KEY                  | Secret key for JWT signing                              | Yes            | N/A         |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiration duration in minutes                    | No             | 30          |
| ALGORITHM                   | JWT signing algorithm                                   | No             | HS256       |

### Usage / Running the Project

#### Development Mode

Run client and server concurrently:

```Bash
pnpm run dev
```

Run individual packages:

```Bash
# Start server only
pnpm run dev:server

# Start client only
pnpm run dev:client
```

#### Production Build & Containerization

Build and run using Docker:

```Bash
docker build -t fullstack-notes .
docker run -p 3001:3001 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e SECRET_KEY="your-production-secret" \
  fullstack-notes
```

### Testing

#### Unit and Integration Testing

Run unit/integration tests across all packages via Vitest:

```Bash
# Run all tests
pnpm run test

# Run server tests (uses mongodb-memory-server)
pnpm run test:server

# Run client browser tests
pnpm run test:client
```

#### End-to-End Testing

Run end-to-end tests using Playwright:

```Bash
# Install browsers
pnpx playwright install --with-deps chromium

# Execute E2E tests
pnpm run e2e

# View test report
pnpm run e2e:report
```

### Code Quality & Formatting

```Bash
# Run linter
pnpm run lint

# Format code check
pnpm run fmt:check
```

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Ensure all tests and lint checks pass (`pnpm run lint && pnpm run test`).
4. Commit your changes (`git commit -m 'Add amazing feature'`).
5. Push to the branch (git push origin feature/amazing-feature).
6. Open a **Pull Request** against `main`.

## License & Acknowledgments

This project is open-source and available under the **MIT License**.

## Acknowledgments

Inspired by the **University of Helsinki Full Stack Open** curriculum.
