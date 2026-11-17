# Launch and recovery checklist

## Current state
- Public crawling stays blocked pending qualified legal review. `INDEXING_BLOCKED` in `src/lib/site.ts` keeps `noindex, nofollow` on every page, and `robots.txt` still uses `Disallow: /` for every crawler, including GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended and Bingbot. Do not submit the sitemap or switch robots to Allow before that review.
- Canonical, Open Graph and sitemap URLs use `https://bordercover.shop` (`SITE_URL`, overridable at build time with `VITE_SITE_URL`, `SITE_URL` or `PUBLIC_SITE_ORIGIN`). Regenerate `public/sitemap.xml`, `public/robots.txt` and `public/llms.txt` with `bun run seo:assets`.
- The sitemap lists launch-candidate pages only. Insurer-country URLs are added only when `isCoverIndexable` is true for every plan. Directory size is not eligibility. `/review` stays out of the sitemap.
- All markets are research previews. Direct AA HTML observations support the imported allowance values but are not human approval.
- The pure engine remains the sole coverage evaluator. Approved editorial revisions are displayed separately in the source register; updating policy rules still requires a reviewed structured-data revision and tests.
- Reviewer permissions are assigned out of band in `public.user_roles`; signup never grants privileges. No reviewer is assigned yet.
- Verification completed for release 2.2: 52 rule/validation/routing tests passed; 74 content routes loaded with page-specific metadata and no browser runtime errors. Generic guidance, unknown usage, renewal suppression, pinned sharing, claim quotations, phone stages/edit preservation and printing were exercised. Phone width 390 and wide desktop width 2602 had no horizontal document overflow.
- A submitted correction was read back from Cloud. Authenticated evidence approval remains unverified because the backend has no auth users; the owner must sign up and identify the actual reviewer before assigning privileges.
- The production dependency scan reported no known advisories after compatible package updates/overrides. The database linter has no errors; its remaining warning is the intentionally authenticated role-check function, necessary for server authorization and RLS.
- Private report submission is public insert-only through a validated server function; browser roles cannot insert/read private reports directly. Add provider-level abuse protection before a high-traffic public launch.
- `/api/public/health` is a minimal public uptime target and reveals no private data.
- `/api/public/jobs/source-check` accepts only managed scheduled authentication. It monitors fixed publisher URLs with timeout/size limits and no redirects, recording availability and raw content hashes. Hash changes require review and may be caused by page noise; they are not legal-rule changes. PDFs and blocked pages need manual inspection.
- Changed/failed source observations now create one open review task per source. Tasks can be claimed and resolved by authorized reviewers. The applied schema, task trigger and private policies were inspected; authenticated task actions remain unverified without real accounts.
- Evidence approval requires a different authorized reviewer from the immutable draft author, both in the server action and database trigger. Approval requires an actual source access date. Ordinary authenticated accounts cannot directly read the private evidence table; the public view remains narrowly projected.
- The new unlisted-insurer request was submitted through the public UI and read back from Cloud with kind `insurer-request`, release `atlas-rules-2.2` and status `open`.

## Reviewed release preparation
- Record structured claim IDs (for example `uk-aa-silver-europe-allowance`) on evidence drafts, not only a scenario reference. Record actual access date, edition/section, quotation, reviewer and future deadline. Never substitute draft creation time for document access.
- A different owner-authorized reviewer approves the revision. No real reviewers or approvals currently exist; no current claim is represented as independently approved.
- The private workspace can export a current independently approved candidate matched to bundled claim IDs. Account identifiers are replaced by release-scoped hashes in this export. Export never changes live rules.
- Run `bun scripts/prepare-reviewed-release.ts <export-path> <candidate-path>` offline. It rejects unapproved/overdue evidence, bad references and annual claim values inconsistent with policy data. Adopt the validated evidence candidate and corresponding reviewed policy revision together, run regressions, and deploy only after review. Other material claim validation and complete scope review remain editorial responsibilities.
- `bun scripts/archive-research.ts` archives the policy JSON, evidence JSON, engine and provenance source with SHA-256 hashes using exclusive creation. Release 2.2 is archived under `research-releases/`. Never overwrite an existing archive.
- Current links require a matching explicit release identifier. Unknown/old/unversioned links are rejected visibly instead of being replayed against current rules; archives are retained for audit, not silently executed as browser code.
- Indexing also requires explicit liability, own-car, documents, notification and assistance research claims, each with current independent approval. Allowance-only observations never qualify a full page.

## Remaining external verification
- Real reviewer and independent-approver accounts, owner-authorized roles, accountable claim research and hosted authorization exercises are still needed. A fresh session-mint attempt failed because there are no auth users.
- Standard backend rate limiting is not available. Do not fabricate protection or silently introduce an ad-hoc limiter; provider-level abuse protection remains a launch prerequisite, requiring a configured provider and owner approval of its tradeoffs.
- Monitoring/analytics collection and retention ownership, publication, source-check schedule, alert delivery, isolated backup restore and rollback drills remain unconfigured/unproved. Accessibility checks are functional keyboard/layout checks, not WCAG certification or a professional screen-reader assessment.

## Before publishing
1. Supply owner/privacy/corrections contact, reviewer identity, retention policy and qualified legal review.
2. Connect the intended GitHub account in Project settings → Git; confirm the account, new private repository and sync in that screen. Git sync status is not available to this agent.
3. Choose the production HTTPS origin and domain. This app uses TanStack Start SSR/server functions; the old static Cloudflare Pages ZIP is not the current deployment artifact. Lovable publishing supports the current app; separate self-hosting requires supported runtime and environment setup.
4. Run the tests, verify all content routes, keyboard interaction and phone layouts; scan dependencies and resolve critical findings.
5. Confirm protected review permissions, public evidence projection and private report isolation against hosted Cloud, not just source files.
6. Set an alert recipient and connect an external uptime monitor to the published health target. Configure diagnostic retention without collecting scenario fragments or report contents.
7. Schedule the single weekly source check after the app is published; confirm a successful observed execution. It is not active yet because there is no published target.
8. After qualified legal review, set `INDEXING_BLOCKED` to false and replace `Disallow: /` with a crawl policy that still excludes `/review`. Run `bun run seo:assets`. Insurer-country URLs enter the sitemap only when every plan passes `isCoverIndexable`. Do not index all theoretical pairings.

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