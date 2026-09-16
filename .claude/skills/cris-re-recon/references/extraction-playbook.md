# Extraction playbook

Set once: `SLUG=<slug>; BASE=https://<host>; OUT=out/$SLUG/00-recon`

Use a normal browser UA on fetches; many apps 403 a bare curl.
`UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'`

## 1. Unauthenticated surface

```bash
mkdir -p $OUT/raw
curl -sA "$UA" $BASE/robots.txt          | tee $OUT/raw/robots.txt
curl -sA "$UA" $BASE/sitemap.xml         | tee $OUT/raw/sitemap.xml
# sitemap index -> fetch each child
grep -oE '<loc>[^<]+</loc>' $OUT/raw/sitemap.xml | sed 's/<[^>]*>//g'
```

Also worth trying: `/.well-known/`, `/humans.txt`, `/security.txt`, `/manifest.json`
(PWA manifest often lists shortcuts = primary features), `/opensearch.xml`.

## 2. Bundle harvest

```bash
curl -sA "$UA" $BASE/ > $OUT/raw/index.html
grep -oE 'src="[^"]+\.js[^"]*"' $OUT/raw/index.html | sed 's/src="//;s/"$//' | sort -u
```

Modern SPAs load most chunks dynamically. Better: open the app in Chrome and read the
network log, or pull the chunk map out of the entry bundle (see 4/5 below).

Download everything found:
```bash
while read -r u; do
  case "$u" in /*) u="$BASE$u";; esac
  curl -sA "$UA" "$u" -o "$OUT/raw/$(basename "${u%%\?*}")"
done < urls.txt
```

## 3. Source maps — try this before anything else

```bash
for f in $OUT/raw/*.js; do
  tail -c 300 "$f" | grep -o 'sourceMappingURL=[^ ]*'
done
```
If a map exists, fetch it and list the original module paths:
```bash
curl -sA "$UA" "$BASE/path/to/main.js.map" -o $OUT/raw/main.js.map
python3 -c "import json,sys;print('\n'.join(json.load(open(sys.argv[1]))['sources']))" \
  $OUT/raw/main.js.map | sed 's|.*/src/||' | sort -u > $OUT/module-tree.txt
```
The module tree is a near-complete feature map: directory names are feature names.

To reconstruct actual source: `npx source-map-explorer` or write the `sourcesContent`
array back out to files.

## 4. i18n corpus — the highest-value source when maps are stripped

Hunt order:

```bash
# a) dedicated locale files
grep -ohE '"[^"]*(locales?|i18n|lang|translations?|messages)[^"]*\.json"' $OUT/raw/*.js | sort -u
# common paths
for p in /locales/en.json /locales/en/common.json /i18n/en.json /static/locales/en.json \
         /assets/i18n/en.json /lang/en.json; do
  curl -sfA "$UA" "$BASE$p" -o "$OUT/raw/i18n$(echo $p|tr / _)" && echo "HIT $p"
done
```

```bash
# b) inline string table: long runs of quoted human sentences inside the bundle
grep -ohE '"[A-Z][^"]{12,120}"' $OUT/raw/*.js \
  | sed 's/^"//;s/"$//' \
  | grep -vE '^(https?://|[A-Za-z0-9+/=]{40,}$)' \
  | sort -u > $OUT/strings.txt
```

```bash
# c) flatten a JSON locale file to key<TAB>value
python3 - <<'PY' >> $OUT/strings.txt
import json,glob
def walk(o,p=''):
    if isinstance(o,dict):
        for k,v in o.items(): yield from walk(v, f'{p}.{k}' if p else k)
    elif isinstance(o,str): yield f'{p}\t{o}'
for f in glob.glob('out/*/00-recon/raw/i18n*'):
    try: 
        for line in walk(json.load(open(f))): print(line)
    except Exception: pass
PY
sort -u -o $OUT/strings.txt $OUT/strings.txt
```

**How to read the corpus.** Key prefixes are the feature taxonomy. `billing.*`,
`audit.*`, `sso.*`, `webhooks.*` — each top-level namespace is a feature area, whether or
not you ever saw it in the UI. Count members per namespace; a namespace with 60 keys is a
substantial subsystem.

```bash
cut -f1 $OUT/strings.txt | cut -d. -f1 | sort | uniq -c | sort -rn | head -40
```

Also grep the values for verbs that imply capability:
```bash
grep -iE '\b(export|import|invite|archive|restore|merge|duplicate|schedule|approve|reject|publish|revoke|impersonate|bulk|webhook|API key|audit)\b' $OUT/strings.txt
```

## 5. Route manifest

```bash
# Next.js
curl -sA "$UA" $BASE/_next/static/*/\_buildManifest.js -o $OUT/raw/_buildManifest.js
grep -oE '"/[^"]*"' $OUT/raw/_buildManifest.js | tr -d '"' | sort -u > $OUT/routes.txt
# __NEXT_DATA__ in page HTML also carries buildId + page
grep -o '__NEXT_DATA__[^<]*' $OUT/raw/index.html | head -c 2000

# React Router / generic: path literals in the bundle
grep -ohE 'path:"[^"]+"' $OUT/raw/*.js | sed 's/path:"//;s/"$//' | sort -u

# Vue Router
grep -ohE 'path:"[^"]+",(name|component)' $OUT/raw/*.js

# Angular
grep -ohE '\{path:"[^"]*"' $OUT/raw/*.js
```

Mark `[nav]` on routes you can reach by clicking the primary navigation; everything else
is an orphan candidate for `cris-re-ia`.

## 6. API surface

Schema first — cheapest possible win:
```bash
for p in /openapi.json /openapi.yaml /swagger.json /swagger/v1/swagger.json /api/schema \
         /api/docs /api/v1/schema /.well-known/openapi.json /graphql; do
  code=$(curl -so /dev/null -w '%{http_code}' -A "$UA" "$BASE$p"); echo "$code $p"
done
```

GraphQL introspection (only if the endpoint responds and introspection is enabled):
```bash
curl -sA "$UA" -H 'content-type: application/json' \
  -d '{"query":"{__schema{types{name fields{name}}}}"}' $BASE/graphql -o $OUT/raw/graphql-schema.json
```

Otherwise capture live traffic: drive the app in Chrome and use
`mcp__claude-in-chrome__read_network_requests`, filtering to XHR/fetch. Walk every primary
nav item and every settings tab, then dump to `endpoints.csv`.

Static fallback — URL literals in the bundle:
```bash
grep -ohE '"/api/[^"]+"' $OUT/raw/*.js | tr -d '"' | sort -u
```

## 7. Feature flags

```bash
grep -ohiE '(launchdarkly|optimizely|growthbook|posthog|split\.io|unleash|statsig)' $OUT/raw/*.js | sort -u
grep -ohE '"[a-z0-9_-]*(flag|feature|enable|beta|experiment)[a-z0-9_-]*"' $OUT/raw/*.js | sort -u | head -60
```

A flag list is a roadmap: it names what they are building but have not shipped to you.

## 8. Authenticated walkthrough

Only with the user's own account. Order matters — settings last is a mistake, do it first:

1. **Settings, every tab.** The most honest feature map in any product. Screenshot each.
2. Primary nav, breadth-first, one level deep.
3. Every empty state — they describe features you have not used yet.
4. Any "upgrade" / "locked" surface — names features in higher tiers.
5. Notification preferences page — enumerates every business event in the system.
6. If a second role account exists: repeat 1-2 and diff. The delta is the admin surface.

Throughout, keep `read_network_requests` running and append to `endpoints.csv`.

## Recording what you could not get

`recon-report.md` must list blocked sources explicitly, e.g.:

```
BLOCKED  source maps      stripped in production
BLOCKED  i18n files       bundled inline, extracted 1,204 strings via regex instead
BLOCKED  /openapi.json    404
PARTIAL  authenticated    free tier only; Enterprise surface inferred from pricing + strings
```

This list directly sets the `confidence` ceiling for downstream steps.
