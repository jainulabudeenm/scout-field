# PRD: one free run, then bring your own key

Status: specified, not built. Written 3 Sep 2026.

## The problem

Scout Field asks a new user for a Google API key before it will do anything.

A designer who has never heard of Scout will not go and create an API key to try an unknown
plugin. They will close it. The key request is correct (a plugin bundle cannot hold a secret) but
it is a wall at the exact moment the user has the least reason to climb it.

## The decision

**Give every user one free evaluation on the maintainer's key. Then ask for theirs.**

One run is enough to see the boxes land on the canvas, which is the thing that sells the tool.
It is not enough to use Scout as free infrastructure.

## Rules

1. A request carrying **no API key and no access code** is a trial run. The Worker serves it on
   `GEMINI_API_KEY` from its own environment.
2. Each Figma user gets **one** trial run. `FREE_RUNS = 1`, one constant, easy to change.
3. A **global daily cap** limits total trial runs across everyone. `DAILY_CAP = 50`.
4. When the personal allowance is spent, the plugin asks for a key and says why.
5. When the daily cap is spent, the plugin says so, and still offers the key path.
6. A request carrying a key or an access code **never touches the trial counters**.

## Why the global cap is the part that matters

The user id comes from the client, so it can be forged. Anyone who reads the plugin bundle can
see the header and send a new id per request.

Defending against that properly would need real authentication, which this tool does not have and
does not want. The global daily cap makes the attack pointless instead: the worst case is that
the day's free runs are used up, and every honest user is invited to paste their own key, which
is the outcome the product wants anyway.

**Accepted ceiling. Do not build auth to close it.**

## The privacy disclosure, which is not optional

The trial runs on the maintainer's **free-tier** Google key. Google's free tier states that
submitted content may be used to improve their products and may be seen by human reviewers, and
tells you not to submit confidential material.

A user is about to send a design through it. **They must be told before the run, not after.**

Shown once, on the first trial run, with a confirm step:

> **Your free run uses a shared Google key on their free tier.** Google may use what you send to
> improve their products, and a human reviewer may see it. Do not use the free run on confidential
> work. Add your own key in Settings for private runs.

A user with their own key never sees this, because a paid or personal key is not on the shared
free tier.

## Where the counting lives

Cloudflare **KV**, bound as `TRIAL`. The free tier allows 100,000 reads and 1,000 writes a day,
which is far above a daily cap of 50.

Two keys:

| Key | Value | TTL |
|---|---|---|
| `user:<figmaUserId>` | number of trial runs spent | 90 days |
| `day:<YYYY-MM-DD>` | trial runs served today, all users | 48 hours |

A Durable Object would count more exactly under concurrent requests. KV can undercount a burst.
That is acceptable: this is a courtesy allowance, not billing.

## The change, file by file

### 1. `worker/wrangler.toml`

```toml
[[kv_namespaces]]
binding = "TRIAL"
id = "<from: npx wrangler kv namespace create TRIAL>"
```

### 2. `worker/src/trial.ts`, new

```ts
const FREE_RUNS = 1;
const DAILY_CAP = 50;

export type Verdict =
  | { ok: true }
  | { ok: false; reason: 'trial_used' | 'daily_full' | 'no_user'; message: string };

export async function spendTrial(kv: KVNamespace, userId: string | null): Promise<Verdict> {
  // The id is client-supplied and therefore forgeable. The daily cap, not this,
  // is what actually protects the key. See "Why the global cap is the part that matters".
  if (!userId) {
    return { ok: false, reason: 'no_user', message: 'Add your own API key in Settings to run Scout.' };
  }

  const today = `day:${new Date().toISOString().slice(0, 10)}`;
  const used = Number((await kv.get(today)) ?? 0);
  if (used >= DAILY_CAP) {
    return {
      ok: false,
      reason: 'daily_full',
      message: "Today's free runs are gone. Add your own API key in Settings, or try again tomorrow.",
    };
  }

  const mine = Number((await kv.get(`user:${userId}`)) ?? 0);
  if (mine >= FREE_RUNS) {
    return {
      ok: false,
      reason: 'trial_used',
      message: 'You have used your free run. Add your own API key in Settings to keep going.',
    };
  }

  await kv.put(`user:${userId}`, String(mine + 1), { expirationTtl: 90 * 24 * 60 * 60 });
  await kv.put(today, String(used + 1), { expirationTtl: 48 * 60 * 60 });
  return { ok: true };
}
```

### 3. `worker/src/index.ts`

Add `TRIAL: KVNamespace` to `Env`. Add `x-scout-user` to the CORS allow-headers list. Then replace
the gate at roughly line 180:

```ts
const ownKey = request.headers.get('x-scout-key');
const hasCode = request.headers.get('x-scout-code') === env.SCOUT_ACCESS_CODE;

if (!ownKey && !hasCode) {
  const verdict = await spendTrial(env.TRIAL, request.headers.get('x-scout-user'));
  if (!verdict.ok) {
    return Response.json({ error: verdict.message, reason: verdict.reason },
      { status: 402, headers: CORS });
  }
}
```

402 is "Payment Required", which is what this is. It must not be 401, because the UI treats 401 as
a wrong access code.

**Count the attempt, not the success.** A retry loop on a failed evaluation would otherwise spend
the maintainer's quota without limit. A user who loses their one run to a 503 can paste a key,
which is the path the product wants anyway.

### 4. `src/main/code.ts`

`figma.currentUser?.id` is available in the sandbox and is stable per Figma account. Read it once
and include it with the capture message to the UI. It can be `null` when the file is open
anonymously; the Worker treats that as `no_user` and asks for a key.

### 5. `src/ui/api.ts`

Add the header, next to the existing three:

```ts
...(conn.userId ? { 'x-scout-user': conn.userId } : {}),
```

Add `userId` to the `Conn` interface. Keep `reason` from the error body so the UI can tell the two
cases apart.

### 6. `src/ui/App.tsx`

On a 402, do not show a plain error. Show the state that converts:

- `trial_used` heading: **That was your free run.**
- `daily_full` heading: **Today's free runs are used up.**
- Body: one line on why, then a button, **Add your key**, that opens Settings focused on the key
  field.
- A short line on where a free Gemini key comes from: `aistudio.google.com/apikey`, about a minute.

### 7. The disclosure

Before the **first** trial run only. A `trialNoticeSeen` boolean in `figma.clientStorage`, set
after the user confirms. Never shown to a user who has their own key.

## Verify before shipping

1. No key, no code, fresh user: the run works.
2. Same user again: 402 with `trial_used`, and the panel shows the Add your key state.
3. Own key set: works, repeatedly, and neither KV counter moves.
4. Access code set: works, and neither KV counter moves.
5. Set `DAILY_CAP = 1` temporarily, run as two different users: the second gets `daily_full`.
6. The disclosure appears once, and never again after it is confirmed.
7. `figma.currentUser` is null: the user is asked for a key, and the Worker is not charged.

## Estimate

About 2 to 2.5 hours. The Worker part is roughly 45 minutes and the plugin panel state is most of
the rest.

## Explicitly not building

- Real authentication. See the accepted ceiling above.
- Paid tiers, accounts, or billing.
- Per-user daily reset. One run is one run. Someone who wants more brings a key.
- Server-side storage of anyone's key. A key entered in Settings stays in `figma.clientStorage`
  on that machine and is sent per request.
