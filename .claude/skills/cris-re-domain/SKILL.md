---
name: cris-re-domain
description: Step 02 of the reverse-engineering pipeline. Derive the logical architecture of a reference webapp - entity model with ERD, state machines for every status enum, business event catalog, and role-permission matrix. Use after cris-re-features, or when the user asks for the data model / domain model / workflows / "kien truc logic" behind a reference product.
---

# cris-re-domain — the logical architecture

Read `../cris-reverse-engineer/references/conventions.md` first.

**Input:** `out/<slug>/00-recon/` (endpoints, strings) and `out/<slug>/01-features/features.csv`.

This step produces the part that is expensive to get wrong later. UI is cheap to change;
the entity model and its workflows are not.

## Procedure

### 1. Entities

From `endpoints.csv`, group by resource path segment. `/api/v1/projects/:id/tasks` yields
`Project` and `Task` with a containment relation. From response shapes, list fields and
types. From `strings.txt`, recover field *labels* the API only exposes as snake_case keys.

Write `entities.csv`: `entity,field,type,required,relation,notes`.
Write `domain.md` with a mermaid ERD and a paragraph per entity explaining its role.

### 2. State machines — where hidden features surface

**Every `status` / `state` / `stage` / `type` enum you find is a workflow.** This is the
single highest-yield rule in the pipeline.

For each enum, work out:
- the full value set (from response samples AND from `strings.txt` — the corpus usually
  contains labels for states you never saw an instance of)
- legal transitions, and who can trigger each
- the side effects of each transition: notification, permission change, audit entry,
  downstream job

Write `state-machines.md`, one mermaid `stateDiagram-v2` per enum, plus a transition table:

```
| From | To | Trigger | Who | Side effects | Confidence |
```

Then **feed discoveries back into `features.csv`**. A 6-state approval workflow almost
always implies screens, permissions and notifications that were not yet inventoried. Add
the rows, mark them `inferred`, and note `evidence: state-machine:Invoice.status`.

### 3. Business events

Sources, in order of quality: the notification-preferences settings page (the most complete
enumeration any product gives you), email template names in the bundle, webhook event type
lists in docs, `strings.txt` namespaces like `notifications.*` or `emails.*`.

Write `events.md`: `event, trigger, audience, channel (in-app/email/webhook/slack), payload`.

An event catalog is an indirect but near-complete index of every meaningful state change in
the system — including ones with no UI at all.

### 4. Permissions

Write `permissions.md` as a matrix: rows = `entity.action`, columns = roles.
Sources: role names in `strings.txt`, 403 responses, the members/roles settings page, the
pricing page (some permissions are tier-gated, not role-gated — track both), and diffing
two accounts with different roles if available.

Mark cells `yes` / `no` / `unknown`. Unknowns are fine and expected; pretending to know is not.

## Output

`out/<slug>/02-domain/` : `domain.md`, `entities.csv`, `state-machines.md`, `events.md`,
`permissions.md`. Plus an updated `features.csv` with the `entity` column filled and any
newly discovered rows appended.

## Definition of done

- Every endpoint in `endpoints.csv` maps to exactly one `(entity, action)` pair. An endpoint
  that will not map means you are missing an entity — find it.
- Every enum found in recon has a state machine, even if some transitions are `unknown`.
- `features.csv` `entity` column is populated for every row where an entity applies.
- MANIFEST.md updated with entity count, enum count, event count.

## Do not

- Do not invent transitions to make a diagram look complete. An enum with 6 values and 3
  known transitions is drawn with 3 transitions and a note saying the rest are unknown.
- Do not model their database. You are modelling the *domain* they expose. Their internal
  schema is neither visible nor worth guessing at.
