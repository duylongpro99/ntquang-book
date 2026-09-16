---
name: cris-re-ui
description: Step 06 of the reverse-engineering pipeline. Produce the UI layer - design tokens extracted as a baseline then replaced, a component inventory sized to the layout patterns, lo-fi wireframes for the core flows as a multi-artboard design canvas, and hi-fi for one screen per pattern. Use after cris-re-ia/cris-re-ux, or when the user asks for wireframes, mockups, design tokens, component inventory, "phac thao UI".
---

# cris-re-ui — tokens, components, wireframes

Read `../cris-reverse-engineer/references/conventions.md` first.

**Input:** `patterns.md`, `screens.csv`, `states.md`, `flows/`, `job-stories.md`,
`mvp-scope.md`.

Do not start this step before `cris-re-ia` produces `patterns.md`. Wireframing from the route list
alone yields 60 disconnected screens instead of 6 reusable patterns — that mistake costs
weeks and is the main reason this step sits last.

## Procedure

### 1. tokens.json

Extract the reference's computed styles as a **baseline for structure, not for values**:
type scale ratio, spacing rhythm, radius scale, elevation levels, breakpoints, density.

```js
// via javascript_tool on the reference
getComputedStyle(document.documentElement)  // CSS custom properties
```

Then **replace every value** with your own palette and type choices, keeping the structure.
What transfers is "they use a 4px rhythm and 6 type sizes"; what does not transfer is their
blue. Per Boundaries in conventions: no brand identity, no fonts, no icon sets.

Emit as CSS custom properties with a light/dark pair for every color token.

### 2. components.md

Derive from `patterns.md`, not from browsing. For each pattern, list the components its
skeleton needs, then union across patterns and dedupe.

Per component: name, purpose, variants, states (default/hover/focus/active/disabled/loading/
error), which patterns use it, and the `screens.csv` rows that depend on it.

Expect **25-35 components** covering ~90% of screens. If you are over 50, you are cataloguing
instances rather than abstracting; merge until the count comes down.

### 3. Lo-fi wireframes

Invoke the `design` skill to build a multi-artboard canvas — one artboard per screen, laid
out as a flow so the sequence reads left to right.

Cover the 5-7 job stories from `job-stories.md`, and for each screen include **the states
from `states.md`, not just the happy state**. Empty and error artboards next to the happy one
is the whole point; it is what makes the wireframe a UX document rather than a picture.

Annotate each artboard with its `screens.csv` id and the branch it represents.

Stop here and get the user's review. Hi-fi before the flow is agreed wastes the expensive work.

### 4. Hi-fi

Only after lo-fi review. One screen per pattern from `patterns.md` — not one per screen.
Six well-resolved pattern exemplars plus the component inventory is a complete handoff; the
remaining 54 screens are assembly.

### 5. design-notes.md

Open the file by inlining the current `EVIDENCE-BASIS.md` verbatim — wireframes are the most
authoritative-looking artifact in the pipeline and the furthest from the evidence, so the
basis block matters most here.

Then: the rules a developer needs that the artboards cannot show: responsive behavior per
breakpoint, primary-action placement, error presentation, loading strategy per operation
class (from `latency-budget.md`), focus and keyboard order, motion.

## Output

`out/<slug>/06-ui/` : `tokens.json`, `components.md`, `design-notes.md`, plus the published
design canvas URL recorded in MANIFEST.md.

## Definition of done

- Every MVP-scoped screen maps to a pattern that has a hi-fi exemplar.
- Every component in `components.md` names its states and its consumer screens.
- Wireframes cover non-happy states for every core flow.
- `tokens.json` contains none of the reference's actual color or font values.
- A developer can build a screen from `components.md` + `tokens.json` + the artboard without
  asking a follow-up question. Test this claim before marking done.
