#!/usr/bin/env node
/**
 * Cloudflare Zone Configuration Snapshot & Drift Check
 *
 * Fetches the live Cloudflare zone configuration (phase entrypoint rulesets,
 * DNS records, and optional R2 custom domains), strips volatile metadata,
 * sorts keys deterministically, and writes `cloudflare/zone-config.json`.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... node scripts/cloudflare/snapshot.mjs
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... node scripts/cloudflare/snapshot.mjs --check
 *
 * Optional environment variables:
 *   CLOUDFLARE_ACCOUNT_ID  Account ID used to query R2 custom domains
 *   CLOUDFLARE_R2_BUCKET   R2 bucket name (default: "ready-apologia-web")
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.join(REPO_ROOT, 'cloudflare', 'zone-config.json');

const API_BASE = 'https://api.cloudflare.com/client/v4';

const PHASES = [
  'http_request_dynamic_redirect',
  'http_request_transform',
  'http_request_cache_settings',
  'http_request_firewall_custom',
  'http_ratelimit',
  'http_response_headers_transform',
];

const VOLATILE_KEYS = new Set([
  'id',
  'version',
  'last_updated',
  'created_on',
  'modified_on',
  'comment_modified_on',
  'tags_modified_on',
  'etag',
  'ref',
  'zone_id',
  'zone_name',
  'proxiable',
  'meta',
  'domainId',
  'zoneId',
  'status',
]);

/**
 * Recursively strips volatile keys and sorts object keys deterministically.
 */
function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (value !== null && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      if (VOLATILE_KEYS.has(key)) continue;
      const v = value[key];
      if (v === undefined) continue;
      sorted[key] = canonicalize(v);
    }
    return sorted;
  }
  return value;
}

/**
 * Redacts the token from any error message as a defense-in-depth safeguard.
 */
function redact(text, token) {
  const str = String(text ?? '');
  if (!token) return str;
  return str.split(token).join('[REDACTED]');
}

/**
 * Performs an authenticated GET request against the Cloudflare v4 API.
 * If allow404 is true, returns null when the endpoint responds with 404 or
 * "could not find entrypoint ruleset".
 */
async function cfGet(endpointPath, token, { allow404 = false } = {}) {
  const url = `${API_BASE}${endpointPath}`;
  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    throw new Error(
      `Network error fetching ${endpointPath}: ${redact(err?.message || err, token)}`
    );
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON response body
  }

  const errors = Array.isArray(payload?.errors) ? payload.errors : [];
  const isNoEntrypoint =
    res.status === 404 ||
    errors.some(
      (e) =>
        e?.code === 10003 ||
        /could not find entrypoint|no entrypoint|not found/i.test(String(e?.message ?? ''))
    );

  if (allow404 && isNoEntrypoint) {
    return null;
  }

  if (!res.ok || payload?.success !== true) {
    const errDetail =
      errors.length > 0
        ? errors.map((e) => `[${e.code ?? res.status}] ${e.message}`).join('; ')
        : `HTTP ${res.status} ${res.statusText}`;
    throw new Error(
      `Cloudflare API error on GET ${endpointPath}: ${redact(errDetail, token)}`
    );
  }

  return payload.result;
}

/**
 * Normalizes a DNS record to deterministic, non-volatile fields.
 */
function normalizeDnsRecord(record) {
  const cleaned = canonicalize(record);
  if (Array.isArray(cleaned.tags) && cleaned.tags.length === 0) {
    delete cleaned.tags;
  }
  if (
    cleaned.settings &&
    typeof cleaned.settings === 'object' &&
    Object.keys(cleaned.settings).length === 0
  ) {
    delete cleaned.settings;
  }
  return cleaned;
}

/**
 * Fetches all pages of DNS records for the zone.
 */
async function fetchDnsRecords(zoneId, token) {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${API_BASE}/zones/${encodeURIComponent(zoneId)}/dns_records?per_page=100&page=${page}`;
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
    } catch (err) {
      throw new Error(
        `Network error fetching /zones/${zoneId}/dns_records: ${redact(err?.message || err, token)}`
      );
    }

    let payload = null;
    try {
      payload = await res.json();
    } catch {
      // Non-JSON
    }

    if (!res.ok || payload?.success !== true) {
      const errors = Array.isArray(payload?.errors) ? payload.errors : [];
      const errDetail =
        errors.length > 0
          ? errors.map((e) => `[${e.code ?? res.status}] ${e.message}`).join('; ')
          : `HTTP ${res.status} ${res.statusText}`;
      throw new Error(
        `Cloudflare API error on GET /zones/${zoneId}/dns_records: ${redact(errDetail, token)}`
      );
    }

    const records = Array.isArray(payload.result) ? payload.result : [];
    for (const rec of records) {
      all.push(normalizeDnsRecord(rec));
    }

    const totalPages = payload.result_info?.total_pages ?? 1;
    if (page >= totalPages || records.length === 0) break;
    page += 1;
  }

  all.sort((a, b) => {
    const byName = String(a.name ?? '').localeCompare(String(b.name ?? ''));
    if (byName !== 0) return byName;
    const byType = String(a.type ?? '').localeCompare(String(b.type ?? ''));
    if (byType !== 0) return byType;
    return String(a.content ?? '').localeCompare(String(b.content ?? ''));
  });

  return all;
}

/**
 * Builds the canonical zone config object from the live Cloudflare API.
 */
async function fetchLiveZoneConfig({ token, zoneId, accountId, r2Bucket, existingConfig }) {
  const zoneMeta = await cfGet(`/zones/${encodeURIComponent(zoneId)}`, token);
  const zoneName = zoneMeta?.name ?? existingConfig?.zone?.name ?? 'readyapologia.com';

  const phases = {};
  for (const phase of PHASES) {
    const ruleset = await cfGet(
      `/zones/${encodeURIComponent(zoneId)}/rulesets/phases/${phase}/entrypoint`,
      token,
      { allow404: true }
    );
    const rawRules = Array.isArray(ruleset?.rules) ? ruleset.rules : [];
    phases[phase] = rawRules.map((rule) => canonicalize(rule));
  }

  const dnsRecords = await fetchDnsRecords(zoneId, token);

  let r2CustomDomains = existingConfig?.r2_custom_domains ?? [];
  if (accountId) {
    const r2Res = await cfGet(
      `/accounts/${encodeURIComponent(accountId)}/r2/buckets/${encodeURIComponent(r2Bucket)}/domains/custom`,
      token,
      { allow404: true }
    );
    const rawDomains = Array.isArray(r2Res?.domains)
      ? r2Res.domains
      : Array.isArray(r2Res)
        ? r2Res
        : [];
    r2CustomDomains = rawDomains
      .map((d) =>
        canonicalize({
          bucket: r2Bucket,
          domain: d.domain,
          enabled: d.enabled ?? true,
          ...(d.minTLS ? { minTLS: d.minTLS } : {}),
        })
      )
      .sort((a, b) => String(a.domain ?? '').localeCompare(String(b.domain ?? '')));
  }

  return canonicalize({
    dns_records: dnsRecords,
    phases,
    r2_custom_domains: r2CustomDomains,
    zone: {
      name: zoneName,
    },
  });
}

/**
 * Summarizes differences between committed and live configuration objects.
 */
function summarizeDiff(committed, live) {
  const diffs = [];

  if (JSON.stringify(committed.zone) !== JSON.stringify(live.zone)) {
    diffs.push(
      `zone: committed=${JSON.stringify(committed.zone)} vs live=${JSON.stringify(live.zone)}`
    );
  }

  if (JSON.stringify(committed.dns_records) !== JSON.stringify(live.dns_records)) {
    const cCount = Array.isArray(committed.dns_records) ? committed.dns_records.length : 0;
    const lCount = Array.isArray(live.dns_records) ? live.dns_records.length : 0;
    diffs.push(`dns_records: differs (committed: ${cCount} records, live: ${lCount} records)`);
  }

  if (
    JSON.stringify(committed.r2_custom_domains) !== JSON.stringify(live.r2_custom_domains)
  ) {
    const cCount = Array.isArray(committed.r2_custom_domains)
      ? committed.r2_custom_domains.length
      : 0;
    const lCount = Array.isArray(live.r2_custom_domains)
      ? live.r2_custom_domains.length
      : 0;
    diffs.push(
      `r2_custom_domains: differs (committed: ${cCount} domains, live: ${lCount} domains)`
    );
  }

  const allPhases = new Set([
    ...Object.keys(committed.phases ?? {}),
    ...Object.keys(live.phases ?? {}),
  ]);
  for (const phase of [...allPhases].sort()) {
    const cRules = committed.phases?.[phase] ?? [];
    const lRules = live.phases?.[phase] ?? [];
    if (JSON.stringify(cRules) !== JSON.stringify(lRules)) {
      diffs.push(
        `phases.${phase}: differs (committed: ${cRules.length} rules, live: ${lRules.length} rules)`
      );
    }
  }

  return diffs;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const checkMode = args.has('--check');

  const token = (process.env.CLOUDFLARE_API_TOKEN ?? '').trim();
  const zoneId = (process.env.CLOUDFLARE_ZONE_ID ?? '').trim();
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID ?? '').trim();
  const r2Bucket = (process.env.CLOUDFLARE_R2_BUCKET ?? 'ready-apologia-web').trim();

  if (!token || !zoneId) {
    console.error(
      'Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID environment variables are required.'
    );
    process.exit(1);
  }

  let existingConfig = null;
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (err) {
      if (checkMode) {
        console.error(`Error reading ${CONFIG_PATH}: ${err.message}`);
        process.exit(1);
      }
    }
  } else if (checkMode) {
    console.error(`Error: ${CONFIG_PATH} does not exist. Run without --check first.`);
    process.exit(1);
  }

  let liveConfig;
  try {
    liveConfig = await fetchLiveZoneConfig({
      token,
      zoneId,
      accountId,
      r2Bucket,
      existingConfig,
    });
  } catch (err) {
    console.error(redact(err?.message || err, token));
    process.exit(1);
  }

  if (checkMode) {
    const committedComparable = canonicalize({
      dns_records: existingConfig?.dns_records ?? [],
      phases: existingConfig?.phases ?? {},
      r2_custom_domains: existingConfig?.r2_custom_domains ?? [],
      zone: existingConfig?.zone ?? {},
    });

    if (JSON.stringify(committedComparable) !== JSON.stringify(liveConfig)) {
      const summary = summarizeDiff(committedComparable, liveConfig);
      console.error('Cloudflare zone configuration drift detected:');
      for (const line of summary) {
        console.error(`  - ${line}`);
      }
      process.exit(1);
    }

    console.log('Cloudflare zone configuration matches cloudflare/zone-config.json.');
    return;
  }

  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(liveConfig, null, 2)}\n`, 'utf8');
  console.log(`Wrote Cloudflare zone snapshot to ${path.relative(REPO_ROOT, CONFIG_PATH)}`);
}

main();
