# Production dependency audit

Run on 2026-07-31 with `npm audit --omit=dev --audit-level=high` after upgrading
the application to Next 16.2.12. The command reports **three high-severity
production dependency findings** and exits non-zero.

| Dependency path | Installed version | Finding | Safe remediation available? |
| --- | ---: | --- | --- |
| `next -> postcss` | 8.4.31 | GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849 | No |
| `next -> sharp` | 0.34.5 | GHSA-f88m-g3jw-g9cj / listed libvips CVEs | No |

`npm audit fix --dry-run --omit=dev` proposes a forced downgrade to Next
9.3.3, which is a breaking and clearly unsuitable change. It was **not
applied**. The current latest registry version observed was Next 16.2.12, so
there was no non-breaking package-manager remediation at audit time.

## Resolution

On 2026-07-31 the read-only portfolio was migrated from Next.js to a Node
built-in static compiler. The exported site has no server runtime, API routes,
or Next/PostCSS/Sharp dependency chain. After lockfile regeneration,
`npm audit --omit=dev --audit-level=high` reports zero vulnerabilities. The
prior entries remain above as historical evidence; they no longer block the
static Pages artifact.
