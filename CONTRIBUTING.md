# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Local Dev Setup

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

**Prerequisites:**

- [Node.js](https://nodejs.org/) — see [`.nvmrc`](./.nvmrc) for the exact version. We recommend using [`nvm`](https://github.com/nvm-sh/nvm):
  ```sh
  nvm use
  ```
- [Yarn 4](https://yarnpkg.com) — enabled via Corepack:
  ```sh
  corepack enable
  ```

**Install dependencies (root + example):**

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development without manually migrating.

---

## Running the Example App

The example app in `/example` demonstrates all library features. It is configured to use the local version of the library, so changes you make to the library's source code are reflected immediately (JS changes without rebuild; native changes require a rebuild).

**Start the Metro bundler:**

```sh
yarn example start
```

**Run on Android:**

```sh
yarn example android
```

**Run on iOS:**

```sh
yarn example ios
```

**Run on Web:**

```sh
yarn example web
```

---

## Test Commands

**Run unit tests:**

```sh
yarn test
```

**Run with coverage report:**

```sh
yarn test --coverage
```

**Type-check without emitting:**

```sh
yarn typecheck
```

**Lint the codebase:**

```sh
yarn lint
```

**Fix auto-fixable lint issues:**

```sh
yarn lint --fix
```

Coverage thresholds are enforced at:
- Lines: **90%**
- Functions: **90%**
- Branches: **85%**

The CI pipeline will fail if any threshold is not met.

---

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/en) specification. All commit messages must be in the format:

```
<type>(<scope>): <summary>
```

**Allowed types:**

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation-only changes |
| `test` | Adding or updating tests |
| `refactor` | Code change that's neither a fix nor feature |
| `chore` | Build, CI, or tooling changes |
| `perf` | Performance improvements |

**Examples:**

```
feat(wheel): add weighted spin mode
fix(geometry): correct full-circle arc path
docs: update README with migration guide
test(winner): add 100k iteration distribution test
chore(ci): add coverage threshold enforcement
```

Our pre-commit hooks (via `lefthook`) verify commit message format and run lint + typecheck before each commit.

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `yarn` | Install all dependencies (root + workspaces) |
| `yarn typecheck` | Type-check files with TypeScript |
| `yarn lint` | Lint with ESLint |
| `yarn lint --fix` | Auto-fix lint issues |
| `yarn test` | Run unit tests with Jest |
| `yarn test --coverage` | Run tests with coverage report |
| `yarn prepare` | Build the library (`lib/module` + `lib/typescript`) |
| `yarn clean` | Delete `lib/` output directory |
| `yarn release` | Publish a new version (maintainers only) |
| `yarn example start` | Start Metro bundler for example app |
| `yarn example android` | Run example on Android emulator/device |
| `yarn example ios` | Run example on iOS simulator/device |
| `yarn example web` | Run example in browser |
| `yarn example build:web` | Build the example app for Web |

---

## Sending a Pull Request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer **small, focused** pull requests (one feature or fix per PR).
- Verify that **linters and tests pass** (`yarn lint` + `yarn test`).
- Verify **TypeScript compiles** cleanly (`yarn typecheck`).
- Review the documentation and update it if your change affects the public API.
- Follow the pull request template when opening a pull request.
- For PRs that change the API or implementation significantly, please **open an issue first** to discuss with maintainers.
