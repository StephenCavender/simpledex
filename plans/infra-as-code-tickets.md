# Infra-as-code migration: ticket drafts (for review)

Draft only. Nothing here has been created in GitHub or implemented. When approved, each `INFRA-n` becomes an issue, all of them sub-issues of one parent "Infra as code" issue, with GitHub native blocked-by links matching the **Prerequisites** lines.

## What the live data says (checked 2026-11-07)

These checks changed the plan:

| Check                                                             | Result                                                                                                                                                                                                                                                              | Consequence                                                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.dev` registry RDAP for `cavender.dev`                           | NS = `curitiba/fortaleza/maceio/salvador.ns.porkbun.com`, last changed 2026-05-05                                                                                                                                                                                   | **The nameservers already point at Porkbun.** The "move NS from Fastmail" cutover has already happened, so no cutover ticket is needed. INFRA-4 imports the NS as code instead. |
| `MX`, `TXT`, `fm1/2/3._domainkey`, `_dmarc`, Fastmail SRV records | **None exist** (DKIM name returns NXDOMAIN)                                                                                                                                                                                                                         | **Inbound mail to `*@cavender.dev` is almost certainly bouncing right now**, and outbound mail fails DKIM/SPF. INFRA-0 is an urgent manual hotfix to do before anything else.   |
| Records that do exist                                             | `simpledex` CNAME `c48a6641fceeb11d.vercel-dns-017.com.`; `mkt.simpledex` CNAME `ceec060ff7650a41.vercel-dns-017.com.`; nothing at apex or `www`                                                                                                                    | These two records get imported. There are no apex/`www` records to create, because the apps live on subdomains.                                                                 |
| DNSSEC                                                            | `delegationSigned: false` (no DS at registry)                                                                                                                                                                                                                       | No DS trap for NS changes. DNSSEC is out of scope (noted in the runbook).                                                                                                       |
| Domain expiry                                                     | **2026-12-10**                                                                                                                                                                                                                                                      | Auto-renew must be confirmed now (INFRA-2).                                                                                                                                     |
| Porkbun providers                                                 | `marcfrederick/porkbun` v1.3.3 (2026-04, active, on the OpenTofu registry, resources: `dns_record`, `nameservers`, `dnssec_record`, `url_forward`; import supported). `cullenmcdermott/porkbun` is **archived**. `kyswtn/porkbun` has had no release since 2025-01. | Pick `marcfrederick/porkbun`.                                                                                                                                                   |

## Decisions (please confirm or override in review)

1. **Tool: OpenTofu 1.13.x**, not Terraform. It's open source (MPL), and its **native client-side state encryption** is the feature that makes decision 3 possible. Both providers are on the OpenTofu registry.
2. **Providers:** `vercel/vercel ~> 5.26` and `marcfrederick/porkbun ~> 1.3.3`. Rationale is in the table above.
3. **State backend: no new account.** HCP Terraform and Cloudflare R2 both need an account you'd rather not create. The state is instead kept **OpenTofu-encrypted (PBKDF2 + AES-GCM) on an orphan `tofu-state` branch of this repo**. Plan reads it; apply commits it back. A single GitHub Actions `concurrency` group (`tofu-state`) stands in for locking. Risk: the repo is **public**, so the ciphertext is public too. That's acceptable only with a long random passphrase (32+ characters, stored as a GitHub secret and in your password manager). Losing the passphrase means re-importing everything.
4. **CI model (your answer 3b):** `tofu plan` on every push touching `infra/**` (any branch, including `master`), with the plan in the job summary. `tofu apply` on push to **`prod`**, which matches how the web app ships (`git push origin master:prod`), so promoting to prod is one gesture for both app and infra. Drift detection runs weekly. No PRs.
5. **Single root module** at `infra/` (DNS + Vercel + Convex env script). At this size, splitting state isn't worth the extra plumbing.
6. **Convex deploy stays in the Vercel prod build** (`apps/web/scripts/vercel-build.sh`), per your answer 5. GitHub Actions only manages Convex env vars.
7. **Vercel Hobby:** no `team_id`, so the provider's `team` is left unset. The brief's apex + `www` redirect doesn't apply. The two subdomains point at Vercel's per-project CNAME targets (`*.vercel-dns-017.com`, which is what Vercel issued) rather than `cname.vercel-dns.com`, so the import produces a zero diff.

## Values I need from you (flagged in tickets as **NEEDS**)

- **N1** Is mail to `cavender.dev` actually broken for you right now? The DNS data says it is. If you think it works, tell me how you're testing it.
- **N2** Vercel project name of the marketing site (the web project is `simpledex-web` per `docs/deployment.md`).
- **N3** The Fastmail **Manual DNS setup** table for `cavender.dev`, copied from Fastmail → Settings → Domains → cavender.dev. It's the authoritative record list.
- **N4** DMARC policy and report address. I suggest starting with `p=none; rua=mailto:dmarc@cavender.dev` and moving to `quarantine` after two clean weeks.
- **N5** Convex plan (free or Pro). Preview deployments (INFRA-9) depend on it.
- **N6** Your sign-off on keeping your **personal** `cavender.dev` zone (and your email) in the `simpledex` repo. The alternative is a small separate `cavender.dev-infra` repo with the same layout. In that case only the Vercel/Convex tickets stay here.
- **N7** Sign-off on the encrypted state living on a branch of a public repo (decision 3).

## Dependency graph

```
INFRA-0 (urgent, manual) ─────────────────────────────┐
INFRA-1 bootstrap ──┐                                   │
INFRA-2 runbook ────┴─► INFRA-3 CI ─┬─► INFRA-4 import DNS+NS ─► INFRA-5 email as code ─► INFRA-10 rollback
                                    ├─► INFRA-6 import Vercel ─► INFRA-7 vercel.json source of truth
                                    └─► INFRA-8 Convex env ─► INFRA-9 Convex previews (optional, N5)
```

(INFRA-5 also depends on INFRA-0.)

## Suggested execution order

1. **INFRA-0**, today and independent of everything else.
2. INFRA-1, then INFRA-2. These can run in parallel; INFRA-2 is mostly dashboard work.
3. INFRA-3.
4. INFRA-4, then INFRA-5, then INFRA-10.
5. INFRA-6, then INFRA-7. This chain can run in parallel with step 4, but serialise the `prod` pushes because they share state.
6. INFRA-8, then INFRA-9 if it applies.

**Dropped from the brief:** the "nameserver cutover with TTL lowering" ticket. Delegation is already at Porkbun. Its useful parts (`dig` against Porkbun NS, NS as code, email + web verification) are folded into INFRA-4, INFRA-5 and INFRA-10.

---

## INFRA-0: Hotfix: restore Fastmail email DNS at Porkbun (manual)

**Goal:** Get mail to and from `*@cavender.dev` working again now, before any IaC exists. INFRA-5 imports these records into code later.

**Prerequisites:** none. **Effort:** S

**Resources (Porkbun dashboard → cavender.dev → DNS):** Enter **every** row from Fastmail's _Manual DNS setup_ screen for `cavender.dev` (**NEEDS N3**). Expected shape, _not authoritative, copy from the screen_:

- MX `@`: `in1-smtp.messagingengine.com` prio 10, `in2-smtp.messagingengine.com` prio 20
- MX `*`, only if listed (subdomain addressing)
- TXT `@`: `v=spf1 include:spf.messagingengine.com ?all` (exact string from screen)
- CNAME `fm1._domainkey`, `fm2._domainkey`, `fm3._domainkey` → `fmN.cavender.dev.dkim.fmhosted.com`
- SRV records for `_submission`, `_imap(s)`, `_pop3(s)`, `_jmap`, `_caldav(s)`, `_carddav(s)`, `_autodiscover`, and any autoconfig CNAME/A records, exactly as listed
- TXT `_dmarc`: `v=DMARC1; p=none; rua=mailto:…` (**NEEDS N4**; Fastmail may not list this)

The `*` MX doesn't conflict with the existing `simpledex` / `mkt.simpledex` CNAMEs, because wildcards don't apply to names that exist.

**Acceptance:**

- `dig +short MX cavender.dev @curitiba.ns.porkbun.com` lists both Fastmail MX hosts with the right priorities. Same for `@1.1.1.1` once caches expire. (`dig` isn't installed on this machine: `sudo pacman -S bind`, or use `curl -s 'https://dns.google/resolve?name=cavender.dev&type=MX'`.)
- `dig +short CNAME fm1._domainkey.cavender.dev` resolves (and likewise for fm2 and fm3).
- An external mailbox (Gmail) sends to `test-$(date +%s)@cavender.dev` and the message arrives (catch-all). A reply from Fastmail arrives at Gmail with `spf=pass`, `dkim=pass header.d=cavender.dev`, `dmarc=pass` in _Show original_.
- Fastmail → Domains → cavender.dev shows all records as valid.
- The ticket gets a comment containing the Porkbun record list (`type name content prio ttl`) for INFRA-5 to diff against.

---

## INFRA-1: Bootstrap `infra/`: OpenTofu, pinned providers, encrypted state on `tofu-state` branch

**Goal:** An empty but working OpenTofu root module whose state is encrypted and stored on an orphan branch. `tofu plan` reports "No changes".

**Prerequisites:** none. **Effort:** M

**Files:**

- `infra/versions.tf`: `terraform { required_version = "~> 1.13" ; required_providers { vercel = { source = "vercel/vercel", version = "~> 5.26" }, porkbun = { source = "marcfrederick/porkbun", version = "~> 1.3.3" } } }`
- `infra/backend.tf`: `backend "local" { path = ".state/terraform.tfstate" }`, plus an `encryption` block:
  - `key_provider "pbkdf2"` with `passphrase = var.state_passphrase`
  - `method "aes_gcm"`
  - `state { enforced = true }` and `plan { enforced = true }`
- `infra/providers.tf`: `provider "vercel" {}` reads `VERCEL_API_TOKEN` (no `team`, since this is Hobby). `provider "porkbun" {}` reads `PORKBUN_API_KEY` and `PORKBUN_SECRET_API_KEY`.
- `infra/variables.tf`: `state_passphrase` (sensitive), `domain = "cavender.dev"`.
- `infra/.terraform.lock.hcl`: generated with `tofu providers lock -platform=linux_amd64 -platform=darwin_arm64`. Committed.
- `infra/.gitignore`: `.terraform/`, `.state/`, `*.tfplan`.
- `infra/scripts/state.sh`, with two modes:
  - `pull`: `git worktree add infra/.state tofu-state` (or fetch it if it already exists)
  - `push`: commit `terraform.tfstate` in the worktree and push `tofu-state`
  - Used locally and in CI.
- `infra/README.md`: layout, how to plan locally (`state.sh pull && tofu -chdir=infra plan`), and the rule: **never apply locally, apply only via push to `prod`**.
- `docs/adr/0008-infrastructure-as-code-with-opentofu.md`: decisions 1–5 above, including the public-ciphertext trade-off.
- `AGENTS.md`: one line under "Read when relevant" pointing at `infra/README.md`.
- Orphan branch `tofu-state`, created once with `git switch --orphan tofu-state && git commit --allow-empty -m "chore: init tofu state branch"` and pushed with permission.

**Hooks note:** the repo uses plain git + Husky. Don't add `tofu fmt` to `.lintstagedrc.json` unless it's guarded by `command -v tofu`, or the hook breaks for sessions without tofu. `fmt -check` is enforced in CI (INFRA-3) instead.

**Acceptance:**

- `tofu -chdir=infra init && tofu -chdir=infra validate` succeeds.
- `tofu -chdir=infra plan` prints `No changes`.
- After a CI apply (INFRA-3), `git show origin/tofu-state:terraform.tfstate | head -c 200` shows `"encrypted_data"` and **no** plaintext `"resources"`.
- `tofu -chdir=infra fmt -check -recursive` exits 0.
- `bun run lint` and the pre-commit hook pass (knip/oxfmt ignore `infra/`).

---

## INFRA-2: Manual prerequisites and runbook

**Goal:** Every dashboard-only or one-time step is written down with who and when, and the ones needed for CI are done.

**Prerequisites:** none. **Effort:** S

**Files:** `infra/RUNBOOK.md`, with a table of _step · where · who · when (once / on rotation / on incident) · done-date_. Later tickets append their own manual steps to it.

**Steps to perform and record (owner: Steve):**

1. **Porkbun auto-renew on for `cavender.dev`.** The domain expires 2026-12-10. Check that the registrar locks stay on.
2. **Porkbun API:** create an API key and secret (porkbun.com → Account → API Access). Then **enable "API Access" on the `cavender.dev` domain** (Domain Management → cavender.dev → Details). The API refuses domains without this.
3. **Vercel:** create a token scoped to your Hobby account. Record its expiry and add a rotation reminder.
4. **Vercel ↔ GitHub app:** confirm it's installed with access to `StephenCavender/simpledex` (needed for `git_repository` on `vercel_project`).
5. **Convex:** confirm the production deploy key for `adept-labrador-868` exists (Dashboard → prod → Settings → Deploy Keys). Note the plan (**NEEDS N5**).
6. **Fastmail:** the domain `cavender.dev` is already added, the catch-all alias for `*@cavender.dev` is configured, and DNS hosting is set to _external_ (done in INFRA-5).
7. **State passphrase:** generate it with `openssl rand -base64 48`, store it in your password manager, and record _where_ (not the value).
8. **GitHub Actions secrets** (repo → Settings → Secrets → Actions): `PORKBUN_API_KEY`, `PORKBUN_SECRET_API_KEY`, `VERCEL_API_TOKEN`, `CONVEX_DEPLOY_KEY_PROD`, `TOFU_STATE_PASSPHRASE`. No `VERCEL_TEAM_ID` (Hobby).
9. **Billing:** Porkbun renewal card, Vercel Hobby ($0), Convex plan, Fastmail subscription. Record renewal dates.
10. **DNSSEC:** currently not delegated. This was a deliberate choice; the runbook says to revisit it later with `porkbun_dnssec_record`.

**Acceptance:**

- `gh secret list` shows exactly the five secrets.
- `curl -s -X POST https://api.porkbun.com/api/json/v3/dns/retrieve/cavender.dev -d "{\"apikey\":\"$K\",\"secretapikey\":\"$S\"}" | jq .status` returns `"SUCCESS"`.
- `curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" https://api.vercel.com/v9/projects/simpledex-web | jq .name` returns `"simpledex-web"`.
- RDAP or the Porkbun dashboard shows auto-renew on.
- `infra/RUNBOOK.md` has every row with a done-date.

---

## INFRA-3: CI: plan on push, apply on `prod`, weekly drift

**Goal:** All infra changes flow through GitHub Actions, and state writes are serialised.

**Prerequisites:** INFRA-1, INFRA-2. **Effort:** M

**Files:** `.github/workflows/infra.yml`

- **Triggers:**
  - `push` on any branch with `paths: [infra/**, .github/workflows/infra.yml]`
  - `push` on `prod` (no path filter, so imports and Vercel changes always apply)
  - `schedule: cron "0 7 * * 1"`
  - `workflow_dispatch`
- **Workflow-level `concurrency: { group: tofu-state, cancel-in-progress: false }`.** Together with INFRA-1's never-apply-locally rule, this is the lock.
- `opentofu/setup-opentofu` pinned to a tag and `tofu_version: 1.13.x`. Check out `tofu-state` into `infra/.state` (`actions/checkout` with `ref: tofu-state`, `path: infra/.state`).
- **plan job** (non-`prod` pushes):
  - `fmt -check`, `validate`, `plan -no-color -out=tfplan`
  - `tofu show -no-color tfplan` into `$GITHUB_STEP_SUMMARY` (decision 4b: no PR comment)
  - Fail if the plan contains any `destroy` unless the commit message contains `[allow-destroy]`
- **apply job** (`prod` push):
  - Uses a GitHub Environment `production` restricted to branch `prod`
  - Runs plan, then `apply tfplan`, then `infra/scripts/state.sh push` with `permissions: contents: write`
- **drift job** (schedule):
  - Runs `plan -detailed-exitcode` against `prod`'s checkout
  - On exit 2, opens or updates a single issue titled `Infra drift detected` (label `infra-drift`) with the plan in the body, using `gh issue`
  - On exit 0, closes that issue if it's open
- Secrets are exposed as env: `TF_VAR_state_passphrase`, `VERCEL_API_TOKEN`, `PORKBUN_API_KEY`, `PORKBUN_SECRET_API_KEY`.

**Acceptance:**

- Pushing a branch that only changes `infra/README.md` produces a green plan run with "No changes" in the job summary.
- `git push origin master:prod` produces a green apply run and a new commit on `tofu-state`.
- `gh workflow run infra.yml` (drift) exits clean and opens no issue.
- Temporarily adding a throwaway TXT record in the Porkbun dashboard makes the next drift run open the `Infra drift detected` issue. Deleting the record makes the following run close it.
- Two pushes to `prod` in quick succession run sequentially, never concurrently (check the Actions run timeline).

---

## INFRA-4: Import existing Porkbun DNS records and nameservers

**Goal:** Everything Porkbun currently serves for `cavender.dev`, including the delegation, is in code. The first apply only imports.

**Prerequisites:** INFRA-3 (and INFRA-0 done, so the email records exist to import). **Effort:** S

**Files:**

- `infra/dns.tf`:
  - `porkbun_nameservers.cavender_dev` with the four `*.ns.porkbun.com` hosts
  - `porkbun_dns_record` for `simpledex` (CNAME `c48a6641fceeb11d.vercel-dns-017.com`) and `mkt.simpledex` (CNAME `ceec060ff7650a41.vercel-dns-017.com`), each with `ttl = 600`
  - Any other non-email record the API returns
- `infra/imports.tf`: one `import { to = …, id = "cavender.dev:<record_id>" }` per record, and `id = "cavender.dev"` for the nameservers. Get record IDs from the Porkbun `dns/retrieve` call in INFRA-2.
- Email records are imported **in INFRA-5**, not here. That keeps this diff reviewable.

**Notes:** Check open provider issue marcfrederick/terraform-provider-porkbun#35 ("issue with applying a dns record") before applying. If the API returns Porkbun's default parking records (`ALIAS @ → pixie.porkbun.com`, `CNAME * → …`), **don't import them**. Delete them in a separate, explicit commit marked `[allow-destroy]`, because a wildcard CNAME would shadow the wildcard MX.

**Acceptance:**

- The plan job summary reads exactly `Plan: N to import, 0 to add, 0 to change, 0 to destroy`.
- After the `prod` apply, `tofu state list` (local, after `state.sh pull`) lists every record from the `dns/retrieve` output, minus email records.
- A follow-up commit removes `imports.tf`, and its plan shows `No changes`.
- `curl -sI https://simpledex.cavender.dev` and `curl -sI https://mkt.simpledex.cavender.dev` still return 200.

---

## INFRA-5: Fastmail email DNS records as code, plus send/receive verification

**Goal:** Every record Fastmail requires is declared in code, verified against Fastmail's own screen, and proven with real mail.

**Prerequisites:** INFRA-0, INFRA-4. **Effort:** M

**Files:**

- `infra/email.tf`:
  - `locals.fastmail` (a list of `{ type, subdomain, content, prio }` objects) transcribed **from Fastmail's Manual DNS setup screen (NEEDS N3), not from memory**
  - `porkbun_dns_record.email` using `for_each` keyed by `"${type}:${subdomain}:${content}"`
  - It must include:
    - both MX hosts with their priorities, plus `*` MX if listed
    - the SPF TXT
    - the `fm1`, `fm2` and `fm3` `._domainkey` CNAMEs
    - the DMARC TXT (**NEEDS N4**)
    - every SRV, autoconfig and autodiscover record listed (IMAP, SMTP submission, POP, JMAP, CalDAV, CardDAV)
  - Porkbun SRV format: `prio` is a separate argument, and `content` is `"weight port target"`. Verify this against one record created in INFRA-0 before writing the rest.
- `infra/imports.tf`: import blocks for the INFRA-0 records (`cavender.dev:<id>`).
- `infra/README.md`: a section saying the Fastmail screen is the source, and stating the date it was transcribed.

**Acceptance:**

- The first plan shows `0 to add, 0 to change, 0 to destroy` (imports only). Any `change` means the transcription and INFRA-0 disagree, and the Fastmail screen wins.
- For every row of the Fastmail screen, `dig +short <type> <name> @curitiba.ns.porkbun.com` returns the expected value. Paste a scripted loop and its output into the ticket.
- Receive: an external sender's mail to `random-$(date +%s)@cavender.dev` arrives (catch-all).
- Send: mail from Fastmail to an external address shows `spf=pass`, `dkim=pass header.d=cavender.dev`, `dmarc=pass`.
- Client setup: autodiscover/autoconfig works. For example, `curl -s https://autoconfig.cavender.dev/mail/config-v1.1.xml` returns Fastmail XML if that's listed, or a fresh Thunderbird or Apple Mail account setup finds IMAP/SMTP/CalDAV/CardDAV automatically.
- In Fastmail → Settings → Domains → cavender.dev, DNS is set to **external / own DNS** and **Recheck DNS** passes for every row. Add a screenshot to the ticket.
- `imports.tf` is removed in a follow-up, which shows `No changes`.

---

## INFRA-6: Import Vercel projects, domains and env vars

**Goal:** Both Vercel projects are managed by OpenTofu, and the first apply shows zero destroys.

**Prerequisites:** INFRA-3. **Effort:** M

**Files:**

- `infra/vercel.tf`. Two `vercel_project` resources, each with `git_repository { type = "github", repo = "StephenCavender/simpledex", production_branch = "prod" }`:

  | Resource    | Name            | `root_directory` |
  | ----------- | --------------- | ---------------- |
  | `web`       | `simpledex-web` | `apps/web`       |
  | `marketing` | **NEEDS N2**    | `apps/marketing` |

- `vercel_project_domain` for `simpledex.cavender.dev` (web) and `mkt.simpledex.cavender.dev` (marketing). No apex/`www`/redirect: those hostnames don't belong to these apps.
- Move the two Vercel CNAME records from `dns.tf` into `vercel.tf` next to their domains (`moved {}` blocks, not destroy and recreate).
- `vercel_project_environment_variable` for each var on each project. Inventory them with `curl -H "Authorization: Bearer $VERCEL_API_TOKEN" https://api.vercel.com/v10/projects/<id>/env | jq '.envs[] | {id,key,target,type}'`. Known so far:

  | Project | Variable             | Targets                              | Value from                                                                 |
  | ------- | -------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
  | web     | `CONVEX_DEPLOY_KEY`  | `["production"]`, `sensitive = true` | `var.convex_deploy_key_prod` (from GitHub secret `CONVEX_DEPLOY_KEY_PROD`) |
  | web     | `VITE_CONVEX_URL`    | `["preview", "development"]`         | literal dev URL                                                            |
  | either  | any Clerk keys found | as found                             | as found                                                                   |

- `infra/imports.tf` IDs: project `prj_…`, domain `prj_…/simpledex.cavender.dev`, env var `prj_…/<env_id>`.
- `infra/variables.tf`: add `convex_deploy_key_prod` (sensitive). `infra.yml`: export `TF_VAR_convex_deploy_key_prod`.
- `docs/deployment.md`: say that env vars are now managed in `infra/vercel.tf`, and remove "set it in the dashboard".

**Acceptance:**

- The plan summary shows `0 to destroy`. Any `change` is listed in the ticket and justified. Sensitive env values can't be read back, so one in-place update per sensitive var is expected and acceptable.
- After the `prod` apply, `vercel env ls` (run in `apps/web`) matches the table above.
- `vercel domains inspect simpledex.cavender.dev` reports the domain is configured correctly. Same for `mkt.simpledex`.
- A preview deploy from a feature branch and a production deploy from `prod` both succeed. The prod build log still shows `convex deploy` running against `adept-labrador-868`.

---

## INFRA-7: `vercel.json` as the build source of truth (turbo-ignore, headers, cleared dashboard overrides)

**Goal:** Build behaviour lives only in each app's `vercel.json`. The Vercel project settings for build behaviour are empty and enforced as empty by OpenTofu.

**Prerequisites:** INFRA-6. **Effort:** S

**Files:**

- `apps/web/vercel.json`:
  - keep `buildCommand` and `rewrites`
  - add `"framework": "vite"`
  - add `"ignoreCommand": "npx turbo-ignore @simpledex/web --fallback=HEAD^1"`. Changes in `packages/backend` still trigger builds, because web depends on it, and Convex deploys depend on that.
  - add `headers`: `Cache-Control: public, max-age=31536000, immutable` on `/assets/(.*)`, plus a baseline security set on `/(.*)` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`). Keep the security headers minimal; CSP is out of scope because of Clerk.
- `apps/marketing/vercel.json`: keep `framework` and `installCommand`, and add `"ignoreCommand": "npx turbo-ignore @simpledex/marketing --fallback=HEAD^1"`.
- **No function regions.** Both apps are static and have no serverless functions; the ticket says so explicitly.
- `infra/vercel.tf`: leave the build-behaviour attributes on both projects unset or null so the dashboard values are cleared, with a comment pointing at `vercel.json`. Those attributes are `framework`, `build_command`, `install_command`, `output_directory`, `dev_command` and `ignore_command`.
- Root `package.json`: decide whether to drop `deploy:preview` and `deploy:prod`, which run `vercel` from the repo root and could link a stray project. Remove them unless you use them.

**Acceptance:**

- `curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" https://api.vercel.com/v9/projects/<id> | jq '{framework,buildCommand,installCommand,outputDirectory,devCommand,commandForIgnoringBuildStep}'` shows all nulls for both projects.
- A commit touching only `apps/marketing` pushed to a branch makes the web preview show "Ignored Build Step: canceled" while marketing builds, and vice versa.
- `curl -sI https://simpledex.cavender.dev/assets/<some-file>.js | grep -i cache-control` shows `immutable`.
- The drift job stays clean the week after.

---

## INFRA-8: Convex env vars as code (committed script plus CI)

**Goal:** Production Convex env vars are declared in the repo, applied on `prod`, and drift-checked weekly. The deploy itself stays in the Vercel build (decision 6).

**Prerequisites:** INFRA-3. **Effort:** M

**Files:**

- `infra/convex/env.prod`: non-secret `KEY=value` lines. Inventory them with `cd packages/backend && npx convex env list --prod`; known so far: `SYNC_REQUEST_DELAY_MS`.
- `infra/convex/secrets.prod`: **names only** of secret vars, whose values come from GitHub secrets with the same names.
- `infra/convex/sync-env.sh [--check]`:
  - runs from `packages/backend` with `CONVEX_DEPLOY_KEY`
  - **apply mode:** `npx convex env set KEY value` for each declared var whose value differs from `npx convex env list`
  - **`--check` mode:** exits 2 if anything differs or an undeclared var exists on the deployment
  - never deletes vars unless `--prune` is given
  - refuses keys that aren't `prod:adept-labrador-868|…`, the same guard as `vercel-build.sh`
- `.github/workflows/infra.yml`: a `convex-env` job on `prod` push (after `apply`), and a `--check` step in the drift job that feeds the same drift issue.
- `convex.json`: **don't add one** unless a non-default setting is needed. Today the project uses the defaults (`convex/` directory). Say so in `infra/README.md`. If you want the file anyway as a documented anchor, add `packages/backend/convex.json` with `{ "functions": "convex/" }`.
- `docs/deployment.md`: state that Convex deploy runs in `apps/web/scripts/vercel-build.sh` on Vercel prod builds, that env vars come from `infra/convex/`, and how to run `sync-env.sh --check` locally with the `.env.prod.local` key.
- `infra/RUNBOOK.md`:
  - **Convex custom domain for HTTP actions is dashboard-only.** It's unused today (no `convex/http.ts`). If it's added later: Convex dashboard → prod → Settings → Custom Domains, then add the CNAME it gives as a `porkbun_dns_record` in `infra/dns.tf`. Note that this requires a paid plan.
  - Deploy key rotation: regenerate the key in Convex, then update GitHub secret `CONVEX_DEPLOY_KEY_PROD`, then push to `prod` (OpenTofu updates the Vercel env var).

**Acceptance:**

- `CONVEX_DEPLOY_KEY=… infra/convex/sync-env.sh --check` exits 0 against prod right after the first run.
- Changing a value in `env.prod` and pushing to `prod` updates it (`npx convex env list --prod` shows the new value).
- Setting a stray var by hand makes the next drift run report it.
- `sync-env.sh` with a dev key exits non-zero with the guard message.

---

## INFRA-9 (optional, NEEDS N5): Convex preview deployments for Vercel preview builds

**Goal:** Each Vercel preview gets its own Convex preview deployment instead of reading the shared dev deployment.

**Prerequisites:** INFRA-6, INFRA-8. Only applies if your Convex plan supports preview deployments; close it as won't-fix otherwise. **Effort:** M

**Files:**

- `apps/web/scripts/vercel-build.sh`: on the `VERCEL_ENV=preview` branch, if `CONVEX_DEPLOY_KEY` starts with `preview:`:
  - run `npx convex deploy --cmd 'cd ../../apps/web && turbo run build' --cmd-url-env-var-name VITE_CONVEX_URL --preview-run 'sync:run' …`, seeding with a small Sync like CI's `{"gens":[1],"numbers":[906,1025]}`
  - otherwise keep the current build-only path
  - keep the production guard unchanged
- `infra/vercel.tf`: `CONVEX_DEPLOY_KEY` with target `["preview"]` from a new secret `CONVEX_DEPLOY_KEY_PREVIEW`. Remove `VITE_CONVEX_URL` from the preview target.
- `infra/RUNBOOK.md`: how to create a preview deploy key, and the note that previews are cleaned up by Convex automatically.

**Acceptance:**

- A feature-branch preview build log shows a Convex preview deployment named after the branch.
- The preview site loads Pokémon from that deployment (the Network tab shows a different `*.convex.cloud` host from prod and dev).
- Production deploys are unchanged.

---

## INFRA-10: Rollback runbook: email or DNS breaks

**Goal:** You can restore mail within minutes and know which layer to roll back.

**Prerequisites:** INFRA-5. **Effort:** S

**Files:** a `infra/RUNBOOK.md` section called "Rollback", with three escalating levels.

1. **Bad record change:**
   - `git revert <sha>`, then `git push origin master:prod`, which makes CI apply the revert.
   - If CI itself is broken, fix the record in the Porkbun dashboard, then reconcile by making the code match the next day. The drift job will flag the difference until you do.
2. **Porkbun DNS unusable (outage or provider bug): fall back to Fastmail DNS.**
   - Preconditions to keep true at all times: Fastmail still has the domain, and its DNS hosting can be switched back to "Fastmail".
   - Record the Fastmail nameservers from its screen (**NEEDS N3**, typically `ns1.messagingengine.com` / `ns2.messagingengine.com`).
   - Steps:
     1. In Fastmail, set DNS back to Fastmail-hosted.
     2. In Fastmail custom DNS, add the two Vercel CNAMEs (`simpledex`, `mkt.simpledex`), otherwise the web apps go down.
     3. In the Porkbun dashboard, set the nameservers to Fastmail's.
     4. **Immediately** change `porkbun_nameservers` in `infra/dns.tf` to match and push to `prod`. Otherwise the next apply moves the NS back to Porkbun.
3. **Reverse it:** the same steps in the opposite direction, then check that the zone matches with `dig` against Porkbun NS before switching the delegation back.

**Expected propagation:** up to the `.dev` delegation TTL. Measure it with `dig +norec NS cavender.dev @ns-tld1.charlestonroadregistry.com` and record the value in the runbook. Sending servers retry for days when a host is unreachable. A zone that answers but has **no MX** makes them bounce immediately. That's why level 2 changes the delegation instead of leaving an empty zone in place.

**Acceptance:**

- A dry run of level 1 on a throwaway TXT record: add it, revert it, and the record is gone after the `prod` apply.
- Level 2 is walked through on paper. Every value it needs (Fastmail NS hosts, Vercel CNAME targets, the delegation TTL) is written into the runbook, not left to look up during an incident.
- The test from INFRA-5 (send + receive + Recheck DNS) is listed as the post-rollback verification.
