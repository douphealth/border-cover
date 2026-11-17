# BorderCover Atlas: evidence-first upgrade

## Goal
Make BorderCover Atlas a trustworthy, beautiful tool for comparing published overseas motor-insurance rules—not a promise that an individual driver is insured. Prioritize traceable answers and a usable journey before expanding the directory.

This plan covers the full upgrade. Approval authorizes phased implementation; publication, paid services and account-level changes remain separate decisions.

## What the code confirms
- The dataset has **6 markets, 24 named insurer profiles, 6 generic fallback profiles, 56 plans across all profiles, 58 countries, 36 source records and 55 listed insurer–country pages**. Distinct brands need explicit grouping rather than assumptions based on names.
- The homepage counts named profiles; the footer counts all profiles without explaining the difference.
- The UK map excludes Great Britain and Northern Ireland, leaving **56 eligible international destinations**. This explains the apparent 58-versus-56 discrepancy; it is not evidence that two destinations have no verdict.
- The checker uses previous foreign-use days, but the map always evaluates with **0 used days**. They can disagree after usage changes.
- The AA dataset already contains Silver **30 days**, Gold/Platinum **90 days per policy year**, and an Ireland exemption. These are stored rules, not newly verified claims.
- The engine already distinguishes annual/per-trip/unspecified allowances, downgrades some unresolved situations, evaluates declared transit stops and avoids automatically calling an exceeded UK enhanced allowance uninsured.
- The engine's current annual `remaining` value is **before** the entered trip, not after it. Result labels must distinguish both.
- Source-level dates and some policy editions exist, but results reuse a sitewide date. Claim-level quotations, review accountability and renewal-aware calculations are incomplete.
- Current automated coverage consists of a route-matching test. Useful page-specific metadata exists; there is no sitemap in the public folder, and robots currently allows crawling.

The uploaded audit did not verify the visual design, mobile behaviour or performance. Builder-badge visibility and live insurer wording remain unverified; do not treat them as confirmed defects.

## Phase 1 — Correct the trust signals
1. Use shared dataset-derived statistics throughout the site. Clearly distinguish named market profiles, fallback profiles, plans, source records and listed journeys. Describe a journey as evidence-backed only after it passes evidence eligibility checks.
2. Explain the map's eligible-country total and domestic exclusions. Account for every eligible destination, including unresolved results.
3. Replace “Published full cover” with **“Published overseas cover”**. Lead with country, insurer and plan, then the published cover level, counting period and conditions.
4. For AA Silver/France with 14 trip days and 0 previously used, show: **30-day policy-year allowance; 14 + 0 entered; 16 days remaining after this trip**, followed by the personal-policy caveat.
5. Show source dates as recorded historical dates, not fresh verification. Label dataset-release dates separately. Display missing editions/review dates honestly rather than inventing them.
6. Pass identical scenario inputs—including known/unknown prior usage—to checker, map and comparisons.

**Exit check:** totals reconcile, checker/map answers agree, positive headings never outrun the published evidence, and the default AA arithmetic has a regression test.

## Phase 2 — Verify a narrow launch scope and strengthen the rules
Start with **UK-issued policies**, verifying AA's France and Ireland examples first. Keep other markets available as clearly labelled research previews until their material rules pass the same review standard; do not silently delete existing information.

- Review official insurer wording and authoritative country guidance, recording exact quotes, relevant sections and source conflicts. A blocked or unavailable source stays unresolved.
- Separate **legal liability**, **own-car damage/theft**, **breakdown/recovery** and **required documents**. An equivalent-cover statement does not establish every optional benefit.
- Distinguish not researched, insufficient evidence, insurer confirmation required and explicit exclusion, per benefit. Unknown must not become permission or a fabricated exclusion.
- Preserve annual, per-trip and unspecified counting rules. Allow prior usage to be unknown rather than silently assuming zero.
- Add departure/return dates and policy renewal date when a policy-year allowance requires them. State the day-count convention. Split calculations only where documented wording supports the reset; otherwise flag renewal crossings for confirmation.
- Return a readable result and conditions for every declared transit country. Count a trip once, not once per stop; disclose conservative whole-trip assumptions when country-specific dates are absent.
- When enhanced allowance is exceeded, separate the enhanced benefit from any supported legal-minimum baseline. Require confirmation where continued legal cover or an extension cannot be established.

**Regression cases:** AA Silver 30/31-day boundary; Gold and Platinum 90/91; prior usage at/exceeding/exhausting allowance; Ireland exception; missing evidence; explicit exclusion; per-trip versus annual caps; unspecified counting basis; multi-stop severity and no double counting; renewal boundaries and unresolved reset rules; invalid dates/inputs.

**Exit check:** every enabled launch rule has traceable evidence and concrete tests; unresolved cases remain visibly unresolved.

## Phase 3 — Claim-level evidence and accountable maintenance
Organize evidence as **market → insurer → product → tier → policy edition → destination → rule → evidence**.

- Store exact URL and quotation, PDF page/section, effective dates where published, retrieval date, human verification date, reviewer, review deadline, conflicts and change history.
- Preserve imported dates as legacy records unless verification provenance can be established. Never fabricate reviewers, quotations or effective dates.
- Add expandable evidence beside each material result and a “Report an issue” action tied to its rule/version.
- Introduce a protected review queue for missing evidence, overdue reviews, broken links, changed sources and unresolved conflicts.
- Automated checks report availability/content changes only. They never reset human-verification dates or publish new coverage rules without review. PDFs or access-blocked pages have a manual path.
- Publish actual ownership, editorial standards, correction handling and truthful business-model disclosures. Obtain the owner's details rather than inventing them; qualified counsel must assess launch-market wording and monetization outside this implementation.

**Exit check:** a reviewer can trace, correct and approve a rule; public results show the approved revision, and the history remains intact.

## Phase 4 — A calmer, more useful checker
- Make the checker the first-screen focus: compact inputs beside a generous result on desktop; short stacked inputs followed by a clear result on mobile. Keep the map secondary and the statistics unobtrusive.
- Apply the audit's proposed warm off-white, deep-navy text and restrained teal direction, using amber/red only for meaningful conditions. Use one readable family, consistent spacing and fewer uppercase labels; avoid a navy-dominated decorative theme.
- Add searchable country selection, explicit plan selection, numeric day fields alongside sliders, and renewal-aware date inputs.
- Show a concise summary first, then country-by-country benefit details, conditions, documents and expandable evidence.
- Provide visible keyboard focus, labelled inputs, accessible error messages, text/icons alongside colours, reduced motion and a fully usable list alternative to the map.
- Add shareable trip links and printable, dated checklists containing entered assumptions, rule version, evidence and unresolved conditions. Shared links include only chosen trip inputs—not identity or policy documents—and never imply an insurance certificate.
- Keep motion purposeful and lightweight. Defer accounts for visitors, gamification and AI chat.

**Exit check:** complete a real-input check, add transit stops, change usage, inspect evidence, reopen a shared scenario and print a checklist on desktop and phone-sized screens without overlapping content or console errors.

## Phase 5 — Search, delivery and operational readiness
- Keep useful insurer–country content in initial HTML. Add unique metadata, breadcrumbs and canonical URLs once the production domain is known.
- Generate a sitemap only from eligible, substantively distinct evidence-backed content. Mark research-preview/insufficient pages appropriately; keep preview deployments out of search.
- Measure completed checks, unresolved results, evidence clicks and issue reports with a minimal privacy-conscious event model. Do not claim a completion event for untouched defaults.
- Check mobile accessibility, keyboard-only workflows, dependency security and slow-network behaviour. Target WCAG 2.2 AA and good Core Web Vitals; report measured results rather than guaranteed scores.
- Configure uptime/error alerts, source-monitor status, deployment smoke checks and a rollback procedure. Back up evidence/review records and prove recovery with a restore drill.
- Reassess legacy Cloudflare Pages ZIP instructions against this TanStack Start app. Confirm the supported production deployment before promising static Pages compatibility.
- Verify GitHub connection/ownership and deployment automation for the intended account; connecting GitHub, choosing a domain and changing production badge visibility are owner-controlled launch actions.

**Launch gate:** traceable rules, explicit unknowns, consistent calculations, usable mobile checks, accountable reviews, no known critical security issues, and tested rollback/restore. Expand markets only at a sustainable review capacity.

## Technical approach
- Preserve TanStack Start routing and SSR. Evolve the existing pure engine rather than introduce a second rules implementation; all views and exports consume its versioned result contract.
- Keep public approved rules in versioned structured data. Add schema validation, referential-integrity checks and rule-focused Vitest tests alongside existing tests.
- Use semantic design tokens and shared controls; separate scenario inputs, result rendering and evidence presentation into focused units.
- Enable **Lovable Cloud only when implementing persistent correction reports, protected review workflows or scheduled server checks**, with approval at that stage. Keep reviewed publication distinct from draft edits; protect reviewer access and privileged credentials.
- Use supported server functions/routes and a supported scheduling mechanism for review operations. Validate inputs, authorize reviewers and prevent source-fetching from accessing arbitrary private/internal addresses.
- Record structural decisions in the project's architecture guidance. Keep business facts and provenance in evidence records, not UI code.

## Decisions and dependencies before public launch
Implementation can begin with Phase 1 without further choices. Later phases need:
- Actual owner/editorial contact, corrections recipient and reviewer identity.
- A chosen production domain and owner-completed GitHub connection where needed.
- Approval for Cloud and any paid monitoring/service changes when introduced.
- Source access and qualified review; legal assessment cannot be certified by this app.

No repository, domain, verified insurance claim or production launch is promised merely by approving this plan.