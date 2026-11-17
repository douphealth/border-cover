<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Coverage verdicts come only from `src/lib/engine.ts` (ported original pure engine) over `src/data/policies.json`; UI never hardcodes verdicts, so evidence updates are data-only edits.
- Insurer×country pages are listed in `src/data/cover-pages.json` and evaluated at render time, so they stay in sync with the dataset.
- Use one versioned pure result contract for benefit states, date safeguards and exports; parallel engines would make surfaces disagree.
- Keep supporting quotations and provenance in structured evidence records, with automated observations separate from human approval; imported dates do not establish accountable review.
- Serialize only validated scenario inputs into share-link fragments; fragments avoid sending trip details in ordinary host request URLs.
- Persistent corrections and review actions use Cloud with server-validated reviewer roles; draft evidence never silently changes published rules.
- Keep previews noindex and require approved claim provenance plus a real production origin for sitemap generation; directory size is not an indexing eligibility signal.
- Keep the template-supported TanStack server-function API and patch vulnerable transitive dependencies through verified compatible overrides; a latest-version bump can remove the supported input-validation method.
- Bind research provenance and release identifiers inside the pure result contract; release links must fail explicitly rather than silently use different rules.
- Require independent reviewer approval in both server actions and database triggers; client-disabled approval controls are not authorization.
- Source observations create deduplicated private review tasks through a database trigger; automated monitoring never publishes rules.
- Reviewed releases are prepared offline from authorized approval exports and archived with content hashes; runtime surfaces consume the adopted bundled dataset, not drafts.
- Keep homepage photography and motion in the index presentation with scoped semantic CSS tokens; visual changes must not alter the shared research engine or scenario behavior.
