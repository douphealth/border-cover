# BorderCover Atlas

Source-backed research tool: does your UK, Irish, US, Canadian, Australian or NZ car insurance cover you when you drive abroad?

- **Checker** — multi-country route (up to 5 stops), plan tiers, trip & used-day tracking, Green Card/document rules, actions and linked evidence.
- **Interactive atlas** — every destination drawn as a route from your home market, coloured by published cover status.
- **Listed insurer × country pages**, guides, methodology, evidence register and change log; counts derive from the dataset rather than duplicated copy.
- **Evidence-first results** — distinct benefit states, unknown prior usage, inclusive dates and a renewal-crossing warning without a fabricated allowance reset.
- **Private corrections and editorial review** — Cloud records, reviewer role enforcement and approved evidence displayed separately from legacy observations.
- **Validated share links and printable checklist** — trip inputs only in a URL fragment, with rule version, evidence and unresolved conditions.

## Verification and launch

Run `bun run test`. See `OPERATIONS.md` for deployment, noindex/search gates, reviewer provisioning, source monitoring, rollback and restore requirements. The UI is a research preview, not an assertion of accountable human review. Current source observations do not replace personal policy confirmation.

Built with TanStack Start, React 19 and Tailwind v4. Not insurance advice — always confirm with your insurer.
