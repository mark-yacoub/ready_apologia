# Ready Apologia - Workspace Rules

## Mandatory Initialization
- **Read JETSKI.md**: At the start of any new session working on this repository, you MUST read `JETSKI.md` before making architectural decisions or modifying UI components.

## Terminal Sandbox & Node Execution Quirks
- **Missing $PATH Binaries**: In non-interactive subprocesses (`run_command`), standard `node`, `npm`, and `yarn` binaries are missing from `$PATH`.
- **Autonomous Builds**: To execute Astro builds or Node scripts autonomously, you MUST use the embedded Node binary located in VS Code Server along with the mandatory SQLite flag:
  ```bash
  NODE_OPTIONS='--experimental-sqlite' ~/.vscode-server/cli/servers/*/server/node ./node_modules/astro/astro.js build
  ```
- **Static Server Preview**: To serve preview builds locally:
  ```bash
  ~/.vscode-server/cli/servers/*/server/node scripts/serve.js
  ```
- **Fast Development Builds**: When running the Astro build command to verify changes during active development, temporarily modify `BUILD_BOOKS` in `src/utils/build_config.js` to a small `Set` of books (e.g., `export const BUILD_BOOKS = new Set(['jn', 'mt']);`) so the build completes quickly.
- **Production Build Reset**: Before executing any `git commit` or `git push` command, you MUST ensure `BUILD_BOOKS` in `src/utils/build_config.js` is reverted to `null` so that the entire Bible builds in the CI/CD pipeline.

## Git & Version Control Constraints
- **Explicit Commits & Pushes Only**: NEVER automatically execute `git commit` or `git push` to origin without explicit instruction from the user. Only execute these commands when the user explicitly requests to save the work or deploy.
