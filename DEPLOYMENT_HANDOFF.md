# Deployment handoff

No authenticated deployment CLI was present during validation. Deploy only a
production-disabled build after setting public contact configuration:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Keep `STORE_LIVE=false`. Do not add merchant, Supabase, or Solana credentials
until the legal, rights, and provider-information gates are complete.
