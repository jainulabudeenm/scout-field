# Milestones, Scout Field

The only file updated during the build. Tick a box when its verify step passes, not when the code
is written.

**Order matters.** D1 proves the thing runs at all before any feature is added to it. F1 to F4
build the free first run. P1 to P3 are the Community submission.

---

## Done, 3 Sep 2026

- [x] **S0. Fork the internal edition.** Working tree copied out of `dev-projects/scout`, fresh git
      history, client lens packs and internal build notes removed. Verify: a scan for client names,
      internal hostnames and API-key patterns returns nothing. **Passed.**
- [x] **S1. Public configuration.** New manifest id and allowed domain, worker renamed
      `scout-field`, default server points at the deployment, `.gitignore` blocks lens packs.
      Verify: both typechecks pass, the plugin builds, the lens build prints `lenses: none`.
      **Passed.**
- [x] **S2. Key-first Settings.** The panel opens on the API key. The access code moved to
      Advanced. The 401 error text now names the key, not a code. Verify: read the panel as a
      stranger with no team. **Passed.**

---

## D1. Deploy and prove it runs · GATE · ~45m

Nothing below this line is worth doing until a real evaluation completes end to end.

- [ ] `npx wrangler kv namespace create FREE_RUNS`, put the id in `wrangler.toml`
- [ ] `npx wrangler secret put GEMINI_API_KEY`
- [ ] `npx wrangler secret put SCOUT_ACCESS_CODE` (still needed: it is the private path)
- [ ] `npm run deploy`
- [ ] Import `manifest.json` into Figma, paste your own key in Settings, run on a real frame

**Verify.** `curl https://scout-field.jain-sathak.workers.dev/health` returns 200. In Figma, an
evaluation completes and **every box sits on the element its finding names**. More than about 4px
off means node resolution is broken, which is a bigger problem than any feature below.

> Must be run off a corporate network. Wrangler login fails behind a proxy that blocks
> `*.workers.dev`.

---

## First run free

Full specification: `docs/prd-first-run-free.md`. Read it before starting F1.

**It is not a trial.** The first run is the whole tool. The only limit is how many times, and a
key removes it. Do not let the words trial, upgrade or premium into the UI copy.

### F1. Worker counts free runs · ~45m

- [ ] `worker/src/free-run.ts` with `spendFreeRun()`, `RUNS_PER_USER = 1`, `RUNS_PER_DAY = 50`
- [ ] `FREE_RUNS: KVNamespace` on `Env`, `x-scout-user` added to the CORS allow-headers
- [ ] The gate at `worker/src/index.ts` roughly line 180 calls `spendFreeRun` when there is no key
      and no code, and returns **402** with `{ error, reason }`

**Verify.** Three curls against the deployed worker: no key and a new user id succeeds; the same
id again returns 402 `runs_used`; a request with `x-scout-key` succeeds and moves neither counter.

### F2. Plugin sends the user id · ~20m

- [ ] `src/main/code.ts` reads `figma.currentUser?.id` and passes it with the capture
- [ ] `userId` added to `Conn`, header sent in `src/ui/api.ts`
- [ ] `ScoutError` keeps `reason` from the response body

**Verify.** A run from Figma with no key in Settings works once, and the KV key `user:<id>` exists.

### F3. The panel converts instead of erroring · ~45m

- [ ] On 402, show a heading, one line of why, and an **Add your key** button
- [ ] `runs_used` and `daily_full` read differently
- [ ] The button opens Settings with the key field focused
- [ ] A line naming `aistudio.google.com/apikey` and that it takes about a minute

**Verify.** Spend the free run, then read the panel as someone who has never seen Scout. It must be
obvious what to do next without reading a README.

### F4. The free-tier disclosure · ~20m

- [ ] Shown before the **first** free run, with a confirm step
- [ ] `freeRunNoticeSeen` in `figma.clientStorage`, so it appears once
- [ ] Never shown to a user who has their own key

**Verify.** Fresh install: the notice appears, confirming runs the evaluation, and a second run
never shows it again. With a key set from the start it never appears at all.

---

## Publishing

### P1. Listing assets · ~40m

- [ ] Icon, 128x128
- [ ] Cover art, 1920x960
- [ ] Listing copy: what it does, who it is for, and the key requirement stated up front so
      nobody installs it and then feels tricked
- [ ] A short screen recording of boxes landing on a real design

### P2. Submit to Figma Community · ~30m

- [ ] Figma assigns the real plugin id on publish. Update `manifest.json` if it differs
- [ ] Publish, then install from Community on a second account and run it clean

**Verify.** A person who is not you installs from the Community listing and completes one
evaluation without being told anything.

### P3. Watch the first week · ongoing

- [ ] Cloudflare rate-limit rule in front of the Worker
- [ ] Check the daily counter. If the cap is hit every day, decide: raise it, lower it, or accept
      that it is doing its job

---

## L1. Lens packs a stranger can actually use · ~3h

The internal edition ships lens packs for named apps. This edition ships none, which is correct,
but "write your own from a blank template" is a wall for someone who just installed a plugin.

Zain, 3 Sep: offer **starting points, not finished lenses**. A handful of neutral templates the
user picks and then edits, for example e-commerce, booking, fintech, a dashboard. They are
examples to shape, not products to select.

- [ ] Two or three neutral templates in `reference/lens/`, marked `<!-- starter -->`
- [ ] Settings offers "start from a template" alongside "paste your own"
- [ ] A template says out loud that it is generic and asks the user to add their persona

**Verify.** Someone who has never written a lens produces a usable one in under ten minutes.

**Open question for Zain.** Do templates ship in the Worker (visible to everyone, one copy to
maintain) or in the plugin bundle (editable offline, but it becomes a plugin release to change
one)? The Worker matches how everything else here works.

---

## Before publishing: swap the Gemini keys · BLOCKING

The keys on `scout-field` today are the same three the internal edition uses. Free-tier quota is
usually counted per Google project, so strangers spending free runs can drain the quota the
internal demo depends on.

- [ ] New keys on a **separate Google account** before the Community listing goes live
- [ ] `npx wrangler secret put GEMINI_API_KEY` on `scout-field` only

Not urgent while the plugin is unpublished, because nobody can reach the free run yet.

---

## Later, not now

- **Flow evaluation.** Evaluate a sequence of screens rather than one, so it can find
  inconsistency between screens and paths that dead-end. This is a change in kind, not a bigger
  version of the same thing. About 1.5 to 2 days.
- **Parallel runs.** Several screens at once. Free-tier Gemini is roughly 15 requests a minute, so
  this needs a paid key to be worth building.
- **Directions instead of generated fixes.** Several written directions for a fix, rather than a
  detailed redesign. It avoids the two hardest problems in frame generation: component instances
  cannot be resized without detaching, and writing a raw colour where a design variable was bound
  silently breaks the link to the design system.
- **Comparison mode.** Several versions of a screen plus the user's context on what is being
  decided, returning pros and cons per option. It does not audit. The audit runs once, afterwards,
  on the version that wins.
