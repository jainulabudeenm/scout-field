# PRD: first run free

Status: specified, not built. Written 3 Sep 2026.

## Naming, because it changes the copy

This is **not a trial**. Nothing is reduced, timed, watermarked or held back. The first run is the
whole tool: every layer, every finding, boxes on the canvas, the report board, chat, export.

The only limit is **how many times**, and the fix for that is a key the user can get free in a
minute.

So the words are "**your first run is on us**", never "trial", "free tier", "demo mode" or
"upgrade". A session writing UI copy should hold this line. The honest pitch is the stronger one
here, because it is true.

## The problem

Scout Field asks a new user for a Google API key before it will do anything.

A designer who has never heard of Scout will not go and create an API key to try an unknown
plugin. They will close it. The key request is correct, because a plugin bundle cannot hold a
secret, but it is a wall at the exact moment the user has the least reason to climb it.

## The decision

**Everyone's first evaluation runs on the maintainer's key. After that, their own key, unlimited.**

One run is enough to see boxes land on a real design, which is the thing that sells the tool. It
is not enough to use Scout as free infrastructure.

## Rules

1. A request carrying **no API key and no access code** is a free run. The Worker serves it on
   `GEMINI_API_KEY` from its own environment.
2. Each Figma user gets **one**. `RUNS_PER_USER = 1`, one constant, easy to change.
3. A **global daily cap** limits free runs across everyone. `RUNS_PER_DAY = 50`.
4. When a user's free run is spent, the plugin asks for a key and says why.
5. When the daily cap is spent, the plugin says so, and still offers the key path.
6. A request carrying a key or an access code **never touches the counters**. With a key there is
   no limit of any kind.

## Why the global cap is the part that matters

The user id comes from the client, so it can be forged. Anyone who reads the plugin bundle can see
the header and send a new id per request.

Defending against that properly would need real authentication, which this tool does not have and
does not want. The global daily cap makes the attack pointless instead. The worst case is that a
day's free runs are used up, and every honest user is invited to paste their own key, which is the
outcome the product wants anyway.

**Accepted ceiling. Do not build auth to close it.**

## The privacy disclosure, which is not optional

The free run uses the maintainer's **free-tier** Google key. Google's free tier states that
submitted content may be used to improve their products and may be seen by human reviewers, and
tells you not to submit confidential material.

A user is about to send a design through it. **They must be told before the run, not after.**

Shown once, before the first free run, with a confirm step:

> **Your first run is on us, using a shared Google key on their free tier.** Google may use what
> you send to improve their products, and a human reviewer may see it. Do not use this run on
> confidential work. Add your own key in Settings and nothing is shared.

A user with their own key never sees this, because a personal or paid key is not on the shared
free tier.

## Where the counting lives

Cloudflare **KV**, bound as `FREE_RUNS`. The free tier allows 100,000 reads and 1,000 writes a
day, far above a daily cap of 50.

Two keys:

| Key | Value | TTL |
|---|---|---|
| `user:<figmaUserId>` | free runs spent by this user | 90 days |
| `day:<YYYY-MM-DD>` | free runs served today, all users | 48 hours |

A Durable Object would count more exactly under concurrent requests. KV can undercount a burst.
That is acceptable: this is a courtesy, not billing.

## The change, file by file

### 1. `worker/wrangler.toml`

```toml
[[kv_namespaces]]
binding = "FREE_RUNS"
id = "<from: npx wrangler kv namespace create FREE_RUNS>"
```

### 2. `worker/src/free-run.ts`, new

```ts
const RUNS_PER_USER = 1;
const RUNS_PER_DAY = 50;

export type Verdict =
  | { ok: true }
  | { ok: false; reason: 'runs_used' | 'daily_full' | 'no_user'; message: string };

export async function spendFreeRun(kv: KVNamespace, userId: string | null): Promise<Verdict> {
  // The id is client-supplied and therefore forgeable. The daily cap, not this,
  // is what actually protects the key. See "Why the global cap is the part that matters".
  if (!userId) {
    return { ok: false, reason: 'no_user', message: 'Add your own API key in Settings to run Scout.' };
  }

  const today = `day:${new Date().toISOString().slice(0, 10)}`;
  const used = Number((await kv.get(today)) ?? 0);
  if (used >= RUNS_PER_DAY) {
    return {
      ok: false,
      reason: 'daily_full',
      message: "Today's free runs are gone. Add your own API key in Settings for unlimited runs, or try again tomorrow.",
    };
  }

  const mine = Number((await kv.get(`user:${userId}`)) ?? 0);
  if (mine >= RUNS_PER_USER) {
    return {
      ok: false,
      reason: 'runs_used',
      message: 'That was your free run. Add your own API key in Settings for unlimited runs.',
    };
  }

  await kv.put(`user:${userId}`, String(mine + 1), { expirationTtl: 90 * 24 * 60 * 60 });
  await kv.put(today, String(used + 1), { expirationTtl: 48 * 60 * 60 });
  return { ok: true };
}
```

### 3. `worker/src/index.ts`

Add `FREE_RUNS: KVNamespace` to `Env`. Add `x-scout-user` to the CORS allow-headers list. Then
replace the gate at roughly line 180:

```ts
const ownKey = request.headers.get('x-scout-key');
const hasCode = request.headers.get('x-scout-code') === env.SCOUT_ACCESS_CODE;

if (!ownKey && !hasCode) {
  const verdict = await spendFreeRun(env.FREE_RUNS, request.headers.get('x-scout-user'));
  if (!verdict.ok) {
    return Response.json({ error: verdict.message, reason: verdict.reason },
      { status: 402, headers: CORS });
  }
}
```

402 is "Payment Required", the closest honest code. It must not be 401, because the UI treats 401
as a wrong access code.

**Count the attempt, not the success.** A retry loop on a failed evaluation would otherwise spend
the maintainer's quota without limit. A user who loses their run to a 503 can paste a key, which
is the path the product wants anyway.

### 4. `src/main/code.ts`

`figma.currentUser?.id` is available in the sandbox and is stable per Figma account. Read it once
and include it with the capture message to the UI. It can be `null` when the file is open
anonymously, and the Worker treats that as `no_user` and asks for a key.

### 5. `src/ui/api.ts`

Add the header, next to the existing three:

```ts
...(conn.userId ? { 'x-scout-user': conn.userId } : {}),
```

Add `userId` to the `Conn` interface. Keep `reason` from the error body so the UI can tell the
cases apart.

### 6. `src/ui/App.tsx`

On a 402, do not show a plain error. Show the state that converts:

- `runs_used` heading: **That was your free run.**
- `daily_full` heading: **Today's free runs are used up.**
- Body: one line on why, then a button, **Add your key**, that opens Settings with the key field
  focused.
- A line saying a Gemini key is free and takes about a minute at `aistudio.google.com/apikey`, and
  that with a key there is no limit.

Do not use the words trial, upgrade, or premium. There is no paid version of this. The user is not
buying anything, they are bringing their own key.

### 7. The disclosure

Before the **first** free run only. A `freeRunNoticeSeen` boolean in `figma.clientStorage`, set
after the user confirms. Never shown to a user who has their own key.

## Verify before shipping

1. No key, no code, fresh user: the run works in full, with nothing held back.
2. Same user again: 402 with `runs_used`, and the panel shows the Add your key state.
3. Own key set: works, repeatedly, and neither counter moves.
4. Access code set: works, and neither counter moves.
5. Set `RUNS_PER_DAY = 1` temporarily and run as two different users: the second gets
   `daily_full`.
6. The disclosure appears once, and never again after it is confirmed.
7. `figma.currentUser` is null: the user is asked for a key, and the Worker is not charged.

## Estimate

About 2 to 2.5 hours. The Worker part is roughly 45 minutes and the plugin panel state is most of
the rest.

## Explicitly not building

- Real authentication. See the accepted ceiling above.
- Paid tiers, accounts, or billing. There is nothing to buy.
- Per-user daily reset. One run is one run. Someone who wants more brings a key.
- Server-side storage of anyone's key. A key entered in Settings stays in `figma.clientStorage` on
  that machine and is sent per request.
