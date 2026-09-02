# Scout

Heuristic and accessibility evaluation for screens, inside Figma.

Select a frame, press one button, and get findings drawn on the canvas next to the design,
with a readable report you can export. Built for designers, product managers, and user
researchers alike: every finding carries a plain-language definition of whatever it cites,
so you do not need to know Nielsen's numbering to act on it.

This is the **public edition**. It ships the universal evaluation and nothing client-specific:
no bundled lens packs, and no shared key. You bring your own API key, and you write your own lens
if you want one.

## What it does

- **Three universal layers.** Nielsen's 10 heuristics, WCAG 2.1 AA, and platform guidelines
  (Material 3, Apple HIG, or web).
- **Findings land on the design.** The model names a Figma layer; the plugin looks up its real
  coordinates. Boxes are exact, not estimated.
- **A crop per finding**, so the report reads without the original open.
- **Progressive lenses.** Run the universal evaluation first, then extend it with a lens for
  your product. A lens adds findings and raises severities, always with a stated reason.
- **A report board on the canvas**, a chat for follow-up questions, and export to rich text,
  markdown, or JSON.

## Setup

You need Node 20+, a Cloudflare account for deployment, and one model API key.

```bash
git clone <this repo> && cd scout-field
npm install
npm run build
cd worker && npm install
```

Copy `worker/.dev.vars.example` to `worker/.dev.vars` and fill it in:

```
SCOUT_ACCESS_CODE=pick-a-short-word
GEMINI_API_KEY=from https://aistudio.google.com/apikey
ANTHROPIC_API_KEY=optional, for the quality path
```

Then:

```bash
./demo.sh          # builds the plugin and starts the server
./preflight.sh     # end-to-end check before you rely on it
```

In Figma: **Plugins > Development > Import plugin from manifest**, and pick `manifest.json`.
Open Scout, paste your API key once, select a frame, run.

## Deploying

```bash
cd worker
npx wrangler login
npx wrangler secret put SCOUT_ACCESS_CODE
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

Put the deployed URL into `manifest.json` under `networkAccess.allowedDomains`, and into
the plugin's Settings.

## Why a proxy

Figma plugins cannot hold a secret. Anything in the bundle is readable by anyone who installs it.
So no key ships with Scout. The Worker assembles the prompt from `reference/` and forwards the
request using the key **you** paste into Settings, which is stored in `figma.clientStorage` on
your own machine.

A team that wants nobody pasting keys can deploy its own Worker with a key in it and hand out a
short access code instead. That is the "Advanced" section in Settings, and the access-code path
in the Worker. The code is a shared secret, not real authentication: rotate it with
`wrangler secret put` and put a Cloudflare rate-limit rule in front of the Worker.

## Choosing a provider

| Provider | Model | Cost | Use for |
|---|---|---|---|
| `gemini` (default) | `gemini-3.6-flash` | free tier | pilots, demos, public screens |
| `anthropic` | `claude-opus-5` | around $0.20 per evaluation | confidential work, and the quality bar |

Set `PROVIDER` in `wrangler.toml`, or override per request from Settings.

**Read this before pointing Scout at unreleased work.** Google's free tier says submitted content
may be used to improve their products and may be seen by human reviewers, and tells you not to
submit confidential material. The paid tier is excluded from that. So a deployment that touches
confidential designs should run `PROVIDER=anthropic`, or a paid Gemini key. This is a real
constraint, not a footnote.

## The reference library

`reference/` is the evaluation itself, in markdown, and it is the single source of truth for
every surface.

```
reference/
  core/       nielsen-heuristics, wcag-aa, severity-rubric, eval-discipline
  platform/   mobile-a11y, web-a11y, material3, ios-hig
  lens/       _TEMPLATE
  output/     report-template, finding-contract
```

To change how Scout evaluates, edit a markdown file and redeploy the Worker. No plugin release.

`core/` and `platform/` are deliberately domain-neutral. There is a test for it:

```bash
npm run check:neutral
```

That must return nothing. Anything client-specific belongs in a lens.

## Writing your own lens

Copy `reference/lens/_TEMPLATE.md`. A lens states who it is for, its principles with plain-language
definitions, its severity amplifiers, and the tags it contributes.

You do not have to commit it. Settings has "Your own lenses", where you paste or upload a markdown
file. It is stored in `figma.clientStorage` on that machine and sent with each request, so
confidential principles never enter the repository.

## Three surfaces, one library

Scout is the same evaluation delivered three ways. All three read `reference/`, so they cannot
drift on what a Sev 3 means.

| Surface | Who it is for | What it can do |
|---|---|---|
| **Figma plugin** | designers working in the file | exact boxes on the canvas, crops, a report board, lenses, chat |
| **Claude skill** (`skill/`) | anyone with Claude, no Figma needed | the same evaluation on a screenshot, with estimated positions |
| **Triage board** (`artifact/board.html`) | the wider team, on a link | read findings, filter, and mark each one fixed or won't fix |

The handoff between them is the JSON. Press **JSON** in the plugin, paste it into the board, and
share the link. The board persists triage decisions for everyone who opens it.

An artifact cannot run an evaluation: the runtime has no model access. It renders and triages
results, it does not produce them.

## Repository layout

```
manifest.json          Figma plugin manifest
src/main/              sandbox: capture, node index, annotate, board, storage
src/ui/                iframe: React panel, SSE client, crops, export
src/shared/            types and the severity table, used by both sides
worker/                Cloudflare Worker: providers, schema, prompt assembly
reference/             the evaluation library
skill/                 the Claude skill surface, references synced from reference/
artifact/              the shareable triage board
test-assets/           a neutral test screen with known problems, and a baseline
docs/                  provider comparison
```

## Testing

```bash
./preflight.sh
node worker/test/smoke.mjs test-assets/checkout.png --route eval --platform ios --code $CODE
```

`test-assets/README.md` lists the problems planted in the test screen and whether the current
prompt catches each one. Run it after any prompt change. Fewer findings than the baseline means
something was lost.

## Known limits

- An evaluation takes 90 to 160 seconds. Deeper layer trees take longer.
- Gemini's free tier returns 503 under load. The Worker retries three times with backoff.
- Downloads can be blocked by Figma's iframe sandbox. Scout falls back to the clipboard.
- The report board caps at 40 findings. The rest stay in the panel.
- One screen per run. There is no batch mode.
