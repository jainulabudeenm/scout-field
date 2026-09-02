#!/usr/bin/env node
// Smoke test: POST a real screenshot at the worker and validate the SSE result.
//   node test/smoke.mjs <png> [--url http://localhost:8787] [--route eval]
//   [--provider gemini|anthropic] [--code CODE] [--out file.json]

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const png = args[0];
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
if (!png) {
  console.error('usage: node test/smoke.mjs <png> [--url ...] [--route eval|detect] [--provider ...]');
  process.exit(1);
}

const url = flag('url', 'http://localhost:8787');
const route = flag('route', 'eval');
const provider = flag('provider', '');
const code = flag('code', process.env.SCOUT_ACCESS_CODE || 'scoutdev');
const out = flag('out', '');

const buf = readFileSync(png);
// PNG IHDR: 8-byte signature, then length+type, then width and height.
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

const body = {
  image: buf.toString('base64'),
  width,
  height,
  scale: 1,
  platform: flag('platform', 'android'),
  nodes: [],
  screenName: png.split('/').pop().replace(/\.png$/, ''),
  source: 'production',
};

console.log(`POST ${url}/${route}  ${width}x${height}  ${(buf.length / 1024).toFixed(0)}KB  provider=${provider || 'default'}`);
const started = Date.now();

const res = await fetch(`${url}/${route}`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-scout-code': code,
    ...(provider ? { 'x-scout-provider': provider } : {}),
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`HTTP ${res.status}:`, await res.text());
  process.exit(1);
}

let buffer = '';
let result = null;
for await (const chunk of res.body) {
  buffer += Buffer.from(chunk).toString('utf8');
  const frames = buffer.split('\n\n');
  buffer = frames.pop() ?? '';
  for (const frame of frames) {
    const event = frame.match(/^event: (.+)$/m)?.[1];
    const data = JSON.parse(frame.match(/^data: (.+)$/m)?.[1] ?? '{}');
    if (event === 'progress') console.log(`  ... ${data.stage}`);
    if (event === 'error') {
      console.error(`  ERROR ${data.status}: ${data.message}`);
      process.exit(1);
    }
    if (event === 'result') result = data;
  }
}

const secs = ((Date.now() - started) / 1000).toFixed(1);
if (!result) {
  console.error('No result event received.');
  process.exit(1);
}

const r = result.result;
console.log(`\nOK in ${secs}s  provider=${result.provider}  tokens in/out/cached=${result.usage.input}/${result.usage.output}/${result.usage.cacheRead}`);

if (route === 'detect') {
  console.log(JSON.stringify(r, null, 2));
} else {
  const bySeverity = {};
  const byLayer = {};
  for (const f of r.findings ?? []) {
    bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
    byLayer[f.layer] = (byLayer[f.layer] ?? 0) + 1;
  }
  console.log(`screen: ${r.screen_name} / ${r.screen_type} / ${r.platform}`);
  console.log(`findings: ${r.findings?.length ?? r.new_findings?.length ?? 0}`, bySeverity, byLayer);
  console.log(`report_markdown: ${(r.report_markdown ?? '').length} chars`);

  const missingMeaning = (r.findings ?? []).filter((f) => !f.ref_meaning?.trim());
  const located = (r.findings ?? []).filter((f) => f.node_id || f.bbox);
  console.log(`ref_meaning missing on: ${missingMeaning.length}`);
  console.log(`located findings: ${located.length}/${r.findings?.length ?? 0}`);
}

if (out) {
  writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(`\nwrote ${out}`);
}
