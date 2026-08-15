/**
 * Types for variables that Quasar CLI cannot infer on its own:
 * terminal-only variables used by the /quasar.config file.
 * Everything coming from the dotenv files or build > defineEnv is
 * auto-declared in /.quasar/quasar.d.ts
 */
interface ImportMetaEnv {
  /** Cloudflare Pages commit sha, only set in CI */
  readonly CF_PAGES_COMMIT_SHA?: string
  /** GitHub Actions commit sha, only set in CI */
  readonly GITHUB_SHA?: string
}
