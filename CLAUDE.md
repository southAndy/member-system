# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A member system backend built with NestJS 11 and TypeScript. Currently in early stage with the default scaffold structure.

## Commands

- `npm run build` — compile the project
- `npm run start:dev` — run in watch mode (development)
- `npm run lint` — lint and auto-fix with ESLint (flat config) + Prettier
- `npm run format` — format code with Prettier
- `npm test` — run unit tests (Jest, matches `*.spec.ts` in `src/`)
- `npm run test:e2e` — run e2e tests (Jest, config in `test/jest-e2e.json`)
- `npx jest --testPathPattern=<pattern>` — run a single unit test file

## Architecture

- **NestJS modular structure**: modules, controllers, services in `src/`. Entry point is `src/main.ts`, root module is `src/app.module.ts`.
- **Port**: defaults to `process.env.PORT` or 3000.
- **TypeScript**: targets ES2023 with `nodenext` module resolution. `strictNullChecks` enabled, `noImplicitAny` disabled.
- **Testing**: unit tests live alongside source (`*.spec.ts`), e2e tests in `test/`.

## Lint/Format Rules

- ESLint flat config (`eslint.config.mjs`) with `typescript-eslint` recommended + Prettier plugin.
- `@typescript-eslint/no-explicit-any` is off.
- `no-floating-promises` and `no-unsafe-argument` are warnings, not errors.
