# Launch and recovery checklist

## Current state
- Public pages are deliberately noindex; robots disallows crawling until evidence accountability and production origin are established.
- All markets are research previews. Direct AA HTML observations support the imported allowance values but are not human approval.
- The pure engine remains the sole coverage evaluator. Approved editorial revisions are displayed separately in the source register; updating policy rules still requires a reviewed structured-data revision and tests.
- Reviewer permissions are assigned out of band in `public.user_roles`; signup never grants privileges. No reviewer is assigned yet.
- Private report submission is public insert-only through a validated server function; browser roles cannot insert/read private reports directly. Add provider-level abuse protection before a high-traffic public launch.
- `/api/public/health` is a minimal public uptime target and reveals no private data.
- `/api/public/jobs/source-check` accepts only managed scheduled authentication. It monitors fixed publisher URLs with timeout/size limits and no redirects, recording availability and raw content hashes. Hash changes require review and may be caused by page noise; they are not legal-rule changes. PDFs and blocked pages need manual inspection.

## Before publishing
1. Supply owner/privacy/corrections contact, reviewer identity, retention policy and qualified legal review.
2. Connect the intended GitHub account in Project settings → Git; confirm the account, new private repository and sync in that screen. Git sync status is not available to this agent.
3. Choose the production HTTPS origin and domain. This app uses TanStack Start SSR/server functions; the old static Cloudflare Pages ZIP is not the current deployment artifact. Lovable publishing supports the current app; separate self-hosting requires supported runtime and environment setup.
4. Run the tests, verify all content routes, keyboard interaction and phone layouts; scan dependencies and resolve critical findings.
5. Confirm protected review permissions, public evidence projection and private report isolation against hosted Cloud, not just source files.
6. Set an alert recipient and connect an external uptime monitor to the published health target. Configure diagnostic retention without collecting scenario fragments or report contents.
7. Schedule the single weekly source check after the app is published; confirm a successful observed execution. It is not active yet because there is no published target.
8. Once claim-level review is complete, configure canonicals and generate the eligible sitemap with `PUBLIC_SITE_ORIGIN=https://your-real-domain bun scripts/generate-sitemap.ts`. Do not index all theoretical pairings or flip preview robots to Allow.

## Rollback drill
- Record a known-good published version, rule dataset version and corresponding synced repository revision.
- Publish a test revision, complete a scenario and source-register smoke check, then restore the known-good app version through Lovable version history and publish it.
- Verify the restored default AA result, multi-stop flow and server health; confirm schema compatibility because app rollback does not undo live Cloud migrations.
- Record the outcome and elapsed recovery time. This drill cannot be certified before an initial publication.

## Backup and restore drill
- Export Cloud application data separately from source code using Database → Manage → Settings → Export data. Restrict access to private reports, account identifiers and review history.
- Keep structured policy/evidence files versioned in the synced repository; retain encrypted dated data exports according to the agreed retention policy.
- Restore an export into an isolated test environment, not production. Compare table counts, immutable history and one report/review readback; exercise reviewer access and public projections.
- Document backup frequency, custodian, retention, restore duration and any gaps. No successful Cloud restore is claimed yet.

## Privacy-conscious measurement
Use only completed-check, unresolved-result, evidence-click and issue-report events once a collection service and retention owner are agreed. A completed check must follow a deliberate input interaction, not an untouched default render. Do not include identity, trip dates, policy documents, report text or full URLs. No custom event collection is active in this release.