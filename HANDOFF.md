# Scout Field, handoff to a fresh session

Written 3 Sep 2026. If you are a new session in this repo, read this file, then `milestones.md`.
Those two are enough to start work.

---

## What this repo is

**Scout Field is the public edition of Scout.** Same evaluation, no client material.

Scout is a Figma plugin. You select a frame, press one button, and it draws numbered findings on
the canvas beside your design, with a report panel and a shareable report board. It evaluates on
three universal layers: Nielsen's 10 heuristics, WCAG 2.1 AA, and platform accessibility
(Material 3, Apple HIG, or web).

There are two editions and they are separate repositories.

| Edition | Repo | Who it is for | State |
|---|---|---|---|
| Internal | `dev-projects/scout` | One employer, with private lens packs for their apps | Shipping. **Frozen. Do not edit it.** |
| Public | `dev-projects/scout-field` (this one) | Anyone, from Figma Community | Being prepared for release |

This repo was created on 3 Sep 2026 by copying the internal working tree and deleting everything
client-specific. **Fresh git history on purpose**, because the internal repo's history carries the
client lens packs in old commits.

## Why the two are separate, and why it matters

A Figma plugin manifest is public once the plugin is published. The internal manifest names the
internal Cloudflare Worker. Publishing one manifest for both editions would put a private
company's proxy hostname into a public listing, permanently.

That single fact is why this repo exists. Keep it in mind before proposing to merge them again.

**The rule while the internal edition has a live demo booked: never write to `dev-projects/scout`.**
Copy out of it, never into it.

## What was removed, and what replaced it

Removed: four client lens packs from `reference/lens/`, the internal build notes
(`HANDOFF.md`, `milestones.md`, `plan.md`, `scout-prd.md`), the demo brief, and the client lens
that had been copied into `skill/references/`.

Changed from the internal edition:

| File | Change | Why |
|---|---|---|
| `manifest.json` | `id: scout-field`, one allowed domain: `scout-field.jain-sathak.workers.dev` | The internal proxy must never appear in a public manifest |
| `worker/wrangler.toml` | Worker is named `scout-field` | So `wrangler deploy` here can never overwrite the internal `scout-proxy` |
| `src/main/storage.ts` | Default server is the deployed worker, not `localhost:8787` | A stranger's fresh install pointed at their own machine, where nothing runs |
| `src/ui/components/Settings.tsx` | Opens on **Your API key**. Access code moved to Advanced | A public user has no team to ask for an access code |
| `src/ui/api.ts` | Error reads "No API key set" | Same reason |
| `.gitignore` | Blocks every lens pack except `_TEMPLATE.md` | A pack dropped in here to try locally must not get committed |
| `worker/scripts/build-lenses.mjs` | `ORDER` is empty | It listed client pack names |

`reference/lens/` holds only `_TEMPLATE.md`. The lens build prints `lenses: none`. That is correct.

## How the thing works

```
Figma sandbox (src/main)     Figma UI iframe (src/ui)     Cloudflare Worker (worker/)
─────────────────────────    ─────────────────────────    ──────────────────────────
figma.* API                  fetch, DOM, <canvas>         assembles the prompt
export PNG                   crop images                  owns reference/
read the node tree           render the report            calls the model
draw boxes                   chat                         SSE streaming
build the report board       export
no fetch                     no figma.* API
        └──── postMessage ────┘        └──── HTTPS/SSE ────┘
```

Two rules that carry most of the design:

**1. Bounding boxes come from Figma, never from the model.** The sandbox builds a node index
(`buildNodeIndex()` in `src/main/capture.ts`: id, name, type, x, y, w, h, text, breadth-first,
capped at 250 nodes). The model returns a `node_id`. The plugin looks up the real
`absoluteBoundingBox`. Vision models cannot localise to the pixel; Figma already knows exactly
where everything is. A flat pasted screenshot has no layer tree, so it falls back to an estimated
box, and every such finding is badged "estimated position".

**2. `reference/` is the product.** The evaluation lives in markdown, and the Worker compiles it
into the prompt at build time. Changing how Scout evaluates means editing a markdown file and
redeploying the Worker. It is not a plugin release.

```
reference/
  core/       nielsen-heuristics, wcag-aa, severity-rubric, eval-discipline
  platform/   mobile-a11y, web-a11y, material3, ios-hig
  lens/       _TEMPLATE only in this edition
  output/     report-template, finding-contract
```

`core/` and `platform/` must stay domain-neutral. There is a check: `npm run check:neutral`.
It must return nothing. Anything product-specific belongs in a lens.

A lens can also be pasted at runtime. Settings has "Your own lenses", stored in
`figma.clientStorage` and sent with the request, so nobody has to commit private principles to use
one.

## The key problem, which is the next feature

A Figma plugin cannot hold a secret. Anything in the bundle is readable by anyone who installs it.
So the public edition asks the user for their own API key, which they paste into Settings.

That is correct but it is a cold start. A designer who has never heard of Scout will not go and
make a Google API key to try an unknown plugin.

**So: everyone's first run is on the maintainer's key, then they bring their own.** That is the
next milestone. Full specification in `docs/prd-first-run-free.md`. The short version:

- A run with no key and no access code is a **free run**, charged against the maintainer's key
- Each Figma user gets **one**. After that the plugin asks for a key, and a key means no limit
- A **global daily cap** protects the maintainer's quota, because the per-user id is
  client-supplied and therefore forgeable
- The free run uses a free-tier Google key, and **Google's free tier may train on what is
  submitted**. The user must be told this before the run, not after

**It is not a trial, and the copy must never call it one.** Nothing is reduced or held back: the
first run is the whole tool. The only limit is how many times.

## State right now

**Working:** everything the internal edition does, minus lens packs. Numbered boxes on canvas,
a crop per finding, the report board, chat follow-ups, custom lens packs, export, run history.

**Verified on 3 Sep 2026:** both typechecks pass, the plugin builds, the lens build prints
`lenses: none`, and a scan for client names, internal hostnames and API-key patterns returns
nothing.

**Not done:**
1. First run free. See `milestones.md` F1 to F4.
2. The Worker has never been deployed. `scout-field` does not exist on Cloudflare yet.
3. The plugin has never been imported into Figma from this repo.
4. No Figma Community submission. No icon, no cover art, no listing copy.

## Things that will bite you

- **Provider default is Gemini free tier, which trains on submissions.** Fine for a public tool as
  long as it says so. Not fine for confidential work. `PROVIDER=anthropic` is the private path.
- **An evaluation takes 90 to 160 seconds.** That is normal, not a hang.
- **Gemini's free tier returns 503 under load.** The Worker retries three times with backoff.
- **Free-tier Gemini is roughly 15 requests a minute.** Concurrency will hit it.
- **`worker/src/lenses.generated.ts` is generated and gitignored.** Run
  `node worker/scripts/build-lenses.mjs` after a fresh clone, or just `npm run deploy`, which does
  it first.
- **Downloads can be blocked by Figma's iframe sandbox.** Scout falls back to the clipboard.
- **The report board caps at 40 findings.** The rest stay in the panel.

## Test assets

`test-assets/checkout.png` is a neutral test screen with known problems planted in it.
`test-assets/README.md` lists each problem and whether the current prompt catches it.
`checkout-baseline-gemini.json` is the baseline. **Run it after any prompt change.** Fewer
findings than the baseline means the prompt lost something.

## Related work, for context only

`dev-projects/copycat` is a sibling plugin by the same author. It rewrites the copy in a Figma
frame rather than auditing it. It will reuse this codebase's node index and frame-writing
approach. Nothing in this repo depends on it.
