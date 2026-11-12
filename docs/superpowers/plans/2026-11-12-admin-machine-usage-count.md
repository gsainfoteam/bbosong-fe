# Admin machine usage count Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each user's washer/dryer usage session count (`machineUsageCount`) in the admin permissions user table, typed from regenerated OpenAPI schema.

**Architecture:** Regenerate `src/@types/api-schema.ts` from staging swagger so `GetUsersResDto` includes `machineUsageCount`. Pass-through typing via existing `AdminUserWithSubscriptions`. Add one column + i18n + Storybook mocks; no new viewmodel logic.

**Tech Stack:** Bun, openapi-typescript (`bun run gen:api`), React, i18next, Storybook, TypeScript.

## Global Constraints

- Use Bun for scripts (`bun run gen:api`, `bun run gen:i18n`, `bun run check` / lint).
- Do not hand-edit `api-schema.ts` as the primary path; regenerate from swagger.
- Import API types only through feature models outside model files (existing `AdminUserWithSubscriptions` is fine).
- kebab-case under `src/`; commit titles: `<type>: <title>` imperative.
- Responses/commits in repo style; no filter/sort by usage count (YAGNI).

---

## File map

| File                                                               | Responsibility                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `src/@types/api-schema.ts`                                         | Regenerated OpenAPI types including `GetUsersResDto.machineUsageCount` |
| `src/features/admin/views/components/user-table/index.tsx`         | Render usage-count column                                              |
| `src/features/admin/views/components/user-table/index.stories.tsx` | Typed Storybook mocks with counts                                      |
| `public/locales/ko/admin.json`                                     | Korean label `machineUsageCount`                                       |
| `public/locales/en/admin.json`                                     | English label `machineUsageCount`                                      |
| `src/@types/resources.d.ts`                                        | Regenerated i18n types (via `gen:i18n`)                                |

---

### Task 1: Regenerate API schema with `machineUsageCount`

**Files:**

- Modify: `src/@types/api-schema.ts` (generated)
- Verify: staging swagger already exposes the field (confirmed 2026-11-12)

**Interfaces:**

- Consumes: `.env.local` `SWAGGER_URL`, `SWAGGER_USER`, `SWAGGER_PASSWORD`
- Produces: `components['schemas']['GetUsersResDto']` includes `machineUsageCount: number` (required)

- [ ] **Step 1: Regenerate schema**

Run from repo root (loads `.env.local` via Bun env if present; if not auto-loaded, export the three vars first):

```bash
set -a && source .env.local && set +a && bun run gen:api
```

Expected: `API schema generated successfully!`

- [ ] **Step 2: Verify the field exists**

```bash
rg -n 'machineUsageCount' src/@types/api-schema.ts
```

Expected: at least one match under `GetUsersResDto` like:

```ts
machineUsageCount: number;
```

If missing: stop and report that swagger source lacks the field; do not hand-patch unless user explicitly overrides the approach.

- [ ] **Step 3: Commit**

```bash
git add src/@types/api-schema.ts
git commit -m "$(cat <<'EOF'
chore: regenerate API schema for machineUsageCount

EOF
)"
```

---

### Task 2: i18n labels for the usage-count column

**Files:**

- Modify: `public/locales/ko/admin.json`
- Modify: `public/locales/en/admin.json`
- Modify: `src/@types/resources.d.ts` (via `gen:i18n`)

**Interfaces:**

- Consumes: none from Task 1 beyond shared feature
- Produces: translation key `admin:machineUsageCount` → `"이용 횟수"` / `"Usage count"`

- [ ] **Step 1: Add Korean key**

In `public/locales/ko/admin.json`, insert alphabetically near other `m*` / after `lastPushSentAt` / before `machine` keys as fits existing sort. Exact entry:

```json
"machineUsageCount": "이용 횟수",
```

Place it after `"machineName"` if present, otherwise after `"lastPushSentAt"` and before `"noPushDevices"` — keep JSON valid (trailing commas match file style: this project uses standard JSON without trailing commas).

- [ ] **Step 2: Add English key**

In `public/locales/en/admin.json`:

```json
"machineUsageCount": "Usage count",
```

Same relative placement as Korean for maintainability.

- [ ] **Step 3: Regenerate i18n types**

```bash
bun run gen:i18n
```

Expected: exits 0; `src/@types/resources.d.ts` includes `"machineUsageCount": ...` under admin.

- [ ] **Step 4: Commit**

```bash
git add public/locales/ko/admin.json public/locales/en/admin.json src/@types/resources.d.ts
git commit -m "$(cat <<'EOF'
feat: add admin i18n for machine usage count

EOF
)"
```

---

### Task 3: UserTable column + Storybook mocks

**Files:**

- Modify: `src/features/admin/views/components/user-table/index.tsx`
- Modify: `src/features/admin/views/components/user-table/index.stories.tsx`
- Test: typecheck / lint (no dedicated unit test file for this presentational table)

**Interfaces:**

- Consumes: `AdminUserWithSubscriptions` with `machineUsageCount: number`; `t('machineUsageCount')`
- Produces: permissions table column showing the numeric count between role and push devices

- [ ] **Step 1: Update Storybook mocks to require the new field (fail typecheck until UI uses valid data)**

Replace users in `Default` story args so each user includes `machineUsageCount`:

```tsx
users: [
  {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: '관리자',
    email: 'admin@example.com',
    studentNumber: '20260001',
    gender: Gender.MALE,
    role: UserRole.ADMIN,
    machineUsageCount: 3,
    pushSubscriptions: [
      {
        uuid: 'device-1',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
        createdAt: '2026-10-20T01:00:00Z',
        lastActivatedAt: '2026-10-20T03:15:00Z',
      },
      {
        uuid: 'device-2',
        userAgent: null,
        createdAt: '2026-10-20T02:00:00Z',
        lastActivatedAt: null,
      },
    ],
  },
  {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: '김뽀송',
    email: 'bbosong@example.com',
    studentNumber: '20260002',
    gender: Gender.FEMALE,
    role: UserRole.USER,
    machineUsageCount: 0,
    pushSubscriptions: [],
  },
],
```

- [ ] **Step 2: Add the table column**

In `src/features/admin/views/components/user-table/index.tsx`:

1. Header list — insert `t('machineUsageCount')` after `t('role')` and before `t('pushDevices')`:

```tsx
{[
  t('user'),
  t('studentNumber'),
  t('gender'),
  t('role'),
  t('machineUsageCount'),
  t('pushDevices'),
  t('actions'),
].map((label) => (
```

2. After the role `<td>`, add:

```tsx
<td className="px-5 py-4 whitespace-nowrap">{user.machineUsageCount}</td>
```

3. Empty row `colSpan`: change `6` → `7`.

- [ ] **Step 3: Verify types and lint**

```bash
bun run check
```

If `check` is too heavy / unavailable, at minimum:

```bash
bunx tsc --noEmit
bun run lint
```

Expected: PASS (no missing `machineUsageCount` on story mocks; no unused keys).

- [ ] **Step 4: Commit**

```bash
git add \
  src/features/admin/views/components/user-table/index.tsx \
  src/features/admin/views/components/user-table/index.stories.tsx
git commit -m "$(cat <<'EOF'
feat: show machine usage count in admin user table

EOF
)"
```

---

## Spec coverage checklist

| Spec requirement                                | Task                       |
| ----------------------------------------------- | -------------------------- |
| `bun run gen:api` / confirm `machineUsageCount` | Task 1                     |
| Fallback if swagger missing field               | Task 1 Step 2 stop         |
| UserTable column between role and push          | Task 3                     |
| Numeric display including 0                     | Task 3 (story has 0 and 3) |
| i18n ko/en                                      | Task 2                     |
| Storybook mocks                                 | Task 3                     |
| No filter/sort                                  | Not added                  |
| Keep `AdminUserWithSubscriptions`               | No model change needed     |

## Self-review notes

- No TBD/TODO placeholders.
- Property name `machineUsageCount` consistent across schema, UI, i18n, stories.
- Staging swagger already includes the field as of plan write time.
