# Ready Apologia - Workspace Rules

## Mandatory Initialization
- **Read JETSKI.md**: At the start of any new session working on this repository, you MUST read `JETSKI.md` before making architectural decisions or modifying UI components.
- **Read the playbook before writing or designing**: Before writing or editing any article, hub, reader-facing label or SEO copy, or designing/restyling a page, you MUST read `docs/article_and_ux_playbook.md` (voice rules, strongest-first ordering, review process, UI/UX principles) and follow it.

## Parallel Agents: One Task = One Worktree (MANDATORY)
Several agents work on this repo at the same time. The main checkout (`~/Documents/ready_apologia`) is shared and holds other agents' and the user's uncommitted work, so editing, building, staging or committing there mixes everyone's changes.
- **Before your first edit, create your own worktree** (skip only for read-only questions):
  ```bash
  scripts/agent_worktree.sh new <task-name>   # e.g. fix-discover-back; branch agent/<task-name> from origin/master
  ```
  It prints the path (`~/Documents/ready_apologia-worktrees/<task-name>`) with `node_modules` hard-linked and `.env` copied, ready to build.
- **Work only inside it.** Each `run_command` starts in the main checkout, so prefix every command with `cd <worktree> &&`, and give file tools absolute paths under the worktree. Never edit, build, `git add`, `git stash`, `git checkout` or `git reset` in the main checkout or in another agent's worktree.
- **Your own `dist/` and port**: build inside your worktree, and serve previews on a free port (`PORT=8081`, `8082`, …), not the default 8080.
- **Commit on your branch** (`agent/<task-name>`) as you go; that is local and safe. The commit/push rule below still applies to `origin`.
- **Landing (only when the user asks to push)**: `cd <worktree> && git fetch origin && git rebase origin/master`, re-run the build and checks, set `BUILD_BOOKS` back to `null`, then `git push origin HEAD:master`. If the push is rejected, fetch, rebase and retry; never force-push `master`.
- **Clean up** after it lands: `scripts/agent_worktree.sh rm <task-name>` (refuses if there is uncommitted work).
- **If you are ever in a shared tree anyway** and see changes you did not make, they belong to someone else: never revert, stash or stage them. Stage only your own files/hunks.

## Terminal Sandbox & Node Execution Quirks
- **Missing $PATH Binaries**: In non-interactive subprocesses (`run_command`), standard `node`, `npm`, and `yarn` binaries are missing from `$PATH`.
- **Autonomous Builds**: To execute Astro builds or Node scripts autonomously, you MUST use the embedded Node binary located in VS Code Server along with the mandatory SQLite flag (`head -1`: several VS Code servers may be installed, and passing all of them breaks the command):
  ```bash
  NODE=$(ls ~/.vscode-server/cli/servers/*/server/node | head -1)
  NODE_OPTIONS='--experimental-sqlite' $NODE ./node_modules/astro/bin/astro.mjs build
  ```
- **Static Server Preview**: To serve preview builds locally:
  ```bash
  PORT=8081 $NODE scripts/serve.js
  ```
- **Fast Development Builds**: When running the Astro build command to verify changes during active development, temporarily modify `BUILD_BOOKS` in `src/utils/build_config.js` to a small `Set` of books (e.g., `export const BUILD_BOOKS = new Set(['jn', 'mt']);`) so the build completes quickly.
- **Production Build Reset**: Before executing any `git commit` or `git push` command, you MUST ensure `BUILD_BOOKS` in `src/utils/build_config.js` is reverted to `null` so that the entire Bible builds in the CI/CD pipeline.

## Git & Version Control Constraints
- **Explicit Commits & Pushes Only**: NEVER automatically execute `git commit` or `git push` to origin without explicit instruction from the user. Only execute these commands when the user explicitly requests to save the work or deploy.

## SEO & Sitemap Maintenance
- **Sitemap `<lastmod>`**: dates come from `src/utils/sitemap_lastmod.js` (last git commit touching each URL's content sources). When you add a **new route, Discover article, or data source**, you MUST add/extend its rule in `LASTMOD_RULES` (or `DISCOVER_SOURCES`). After a build, any `[sitemap-lastmod]` warning lists URLs that ship without `<lastmod>`; fix the mapping instead of ignoring it. Never set `lastmod` to the build time.
- **No redirect or noindex pages in the sitemap**: redirect stubs (e.g. `/bible`) are excluded in `astro.config.mjs`'s sitemap `filter`; keep it that way for any new stub.
- **No explanatory text about the app on reader pages**: never add visible intro/stats/"what this page contains" lines (e.g. the removed `.chapter-opening-line` under the chapter header). SEO copy goes in `<title>` and the meta description only; `npm run audit:seo` fails if an opening line reappears.
- **Description voice**: generic or aggregate pages (verse tabs such as videos/footnotes/manuscripts, hubs) use template copy in our voice and must pass the playbook tone list; single-item pages (e.g. one hadith permalink) may quote that item. Quotations go inside curly quotes “…” (the audit skips quoted text).
- **One `<h1>` per page**: every page template must render exactly one `<h1>`. When the visible title is made of buttons/selectors, mirror it in `<h1 class="sr-only">` (the text must match what is on screen).
- **Public URLs are permanent**: never rename/remove a route without adding a 301 (Cloudflare redirect rule, see `CLOUDFLARE.md`).
- **Static SEO & title audit (`npm run audit:seo`)**: run `node scripts/test_seo_titles.mjs` (supports `--dist <dir>`, `--allow-sliced`, `--allow-missing-lastmod`) against built output to verify `<title>` budgets (`<= 60` chars on templated Scripture pages, no duplicates or doubled words), meta descriptions (`50-170` chars, no raw markdown), single `<h1>`, no visible opening lines, playbook tone, sitemap `<lastmod>`/canonicals, and JSON-LD blocks.
