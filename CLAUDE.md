# Scout Field

Public edition of Scout, a Figma plugin that runs a heuristic and accessibility evaluation on a
selected frame and draws the findings on the canvas.

**Read `HANDOFF.md` first, then `milestones.md`.** Together they carry the full context: what this
repo is, why it is separate from the internal edition, how the plugin is wired, and what is left
to build.

## Standing rules

- **Never write to `../scout`.** That is the internal edition. It has a live demo booked and is
  frozen. Copy out of it, never into it.
- **No client material in this repo.** `reference/core/` and `reference/platform/` stay
  domain-neutral: `npm run check:neutral` must return nothing. Anything product-specific is a lens,
  and lens packs are gitignored here except the template.
- **The internal Worker hostname must never appear here.** That is the whole reason this repo
  exists.
- **No em dashes in user-facing prose.**
- **`reference/` is the product.** Changing the evaluation means editing markdown and redeploying
  the Worker, not releasing the plugin.
- **Never ship an API key in the bundle.** A plugin bundle is readable by anyone who installs it.

## Commands

```bash
npm install && npm run build     # build the plugin into dist/
npm run typecheck
npm run check:neutral            # must print nothing before the success line
cd worker && npm run deploy      # builds lenses, then wrangler deploy
```
