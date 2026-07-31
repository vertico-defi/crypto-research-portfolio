# Deployment handoff

The portfolio deploys only as a GitHub Pages static artifact. It has no server
runtime and no Vercel, checkout, payment, wallet, Supabase, or delivery setup.

```bash
npm ci
npm audit --omit=dev --audit-level=high
STORE_LIVE=false npm run build
```

The Pages workflow uploads `out/` after the same audit gate. Configure the
repository in **Settings → Pages → Build and deployment → Source → GitHub
Actions**. Keep `STORE_LIVE=false` permanently for this phase.
