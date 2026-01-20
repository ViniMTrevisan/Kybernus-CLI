# Port Configuration Reference

To run all Kybernus services simultaneously without conflicts:

| Service | Port | Command | Directory |
|---------|------|---------|-----------|
| License API | 3000 | `npm run dev` | `/license-api` |
| Landing Page | 3001 | `npm run dev` | `/apps/web` |
| CLI Dev | N/A | `npm run dev` | `/` (root) |

## Notes
- **CLI**: No server needed. The `npm run dev` command only watches files for development.
- **CORS**: License API is configured to accept requests from both ports (3000, 3001).
- **Environment**: Next.js port is set in `apps/web/.env.local`.
