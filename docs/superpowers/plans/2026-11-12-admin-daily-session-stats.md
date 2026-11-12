# Admin daily session stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show dual-line daily registered/unregistered machine session counts on the admin overview, fed by `GET /machine/stats/sessions/daily` with 7/14/30/90 day presets.

**Architecture:** Pure KST range helper → `$api` viewmodel hook → presentational chart panel (recharts + preset buttons) mounted on overview between status cards and room overview. Types pass through `DailySessionStat` from regenerated OpenAPI schema.

**Tech Stack:** Bun, openapi-typescript (`bun run gen:api`), React, TanStack Query via `openapi-react-query`, recharts, i18next, Vitest, Storybook, TypeScript.

## Global Constraints

- Use Bun for scripts (`bun run gen:api`, `bun run gen:i18n`, `bun run check` / lint, `bunx vitest run`).
- Do not hand-edit `api-schema.ts` as the primary path; regenerate from swagger.
- Project `.gitignore` ignores `src/@types/*.ts` — do not force-add generated type files; skip commits when only those change.
- Import API types only through feature models outside model files.
- kebab-case under `src/`; commit titles: `<type>: <title>` imperative.
- Presets exactly `7 | 14 | 30 | 90`; default `7`. No custom date picker, sum cards, or separate stats route (YAGNI).
- GPG commits on this machine: commit unsandboxed.

---

## File map

| File | Responsibility |
|------|----------------|
| `src/@types/api-schema.ts` | Regenerated OpenAPI types for daily session stats (gitignored) |
| `src/features/admin/models/index.ts` | Export `DailySessionStat` type |
| `src/features/admin/viewmodels/daily-session-stats-range.ts` | KST `from`/`to` helper + `DailySessionStatsRange` |
| `src/features/admin/viewmodels/daily-session-stats-range.test.ts` | Unit tests for inclusive KST ranges |
| `src/features/admin/viewmodels/use-daily-session-stats.ts` | Query hook wrapping the stats endpoint |
| `src/features/admin/viewmodels/index.ts` | Re-export new viewmodel modules |
| `src/features/admin/views/components/daily-session-stats-panel/index.tsx` | Presets + dual LineChart + loading/error |
| `src/features/admin/views/components/daily-session-stats-panel/index.stories.tsx` | Storybook mocks |
| `src/features/admin/views/components/index.ts` | Barrel export |
| `src/features/admin/views/overview-screen/index.tsx` | Mount panel with range state |
| `public/locales/ko/admin.json` | Korean copy |
| `public/locales/en/admin.json` | English copy |

---

### Task 1: Confirm schema + export `DailySessionStat` + KST range helper (TDD)

**Files:**
- Verify / regenerate: `src/@types/api-schema.ts` (generated, gitignored)
- Modify: `src/features/admin/models/index.ts`
- Create: `src/features/admin/viewmodels/daily-session-stats-range.ts`
- Create: `src/features/admin/viewmodels/daily-session-stats-range.test.ts`
- Modify: `src/features/admin/viewmodels/index.ts`

**Interfaces:**
- Consumes: `components['schemas']['GetDailySessionStatsResDto']`; `ApiPaths.MachineController_getDailySessionStats` already in schema
- Produces:
  - `export type DailySessionStat = components['schemas']['GetDailySessionStatsResDto']`
  - `export type DailySessionStatsRange = 7 | 14 | 30 | 90`
  - `export function getDailySessionStatsQueryRange(days: DailySessionStatsRange, now?: Date): { from: string; to: string }`

- [ ] **Step 1: Ensure OpenAPI types include the endpoint**

```bash
set -a && source .env.local && set +a && bun run gen:api
rg -n 'GetDailySessionStatsResDto|MachineController_getDailySessionStats' src/@types/api-schema.ts | head -20
```

Expected: matches for schema fields `date`, `registeredCount`, `unregisteredCount` and path `/machine/stats/sessions/daily`. If missing: stop and report; do not hand-patch.

Do not commit `api-schema.ts` (gitignored).

- [ ] **Step 2: Write the failing range tests**

Create `src/features/admin/viewmodels/daily-session-stats-range.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { getDailySessionStatsQueryRange } from './daily-session-stats-range';

describe('getDailySessionStatsQueryRange', () => {
  // 2026-11-12 15:30 KST = 2026-11-12 06:30 UTC
  const now = new Date('2026-11-12T06:30:00.000Z');

  it.each([
    [7, '2026-11-06', '2026-11-12'],
    [14, '2026-10-30', '2026-11-12'],
    [30, '2026-10-14', '2026-11-12'],
    [90, '2026-08-15', '2026-11-12'],
  ] as const)('returns inclusive KST range for %i days', (days, from, to) => {
    expect(getDailySessionStatsQueryRange(days, now)).toEqual({ from, to });
  });

  it('uses KST calendar date when UTC is still the previous day', () => {
    // 2026-11-12 00:30 KST = 2026-11-11 15:30 UTC
    const earlyKst = new Date('2026-11-11T15:30:00.000Z');
    expect(getDailySessionStatsQueryRange(7, earlyKst)).toEqual({
      from: '2026-11-06',
      to: '2026-11-12',
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
bunx vitest run src/features/admin/viewmodels/daily-session-stats-range.test.ts
```

Expected: FAIL (module / function not found).

- [ ] **Step 4: Implement helper + model export**

Add to `src/features/admin/models/index.ts` (near other DTO aliases):

```ts
export type DailySessionStat = components['schemas']['GetDailySessionStatsResDto'];
```

Create `src/features/admin/viewmodels/daily-session-stats-range.ts`:

```ts
export type DailySessionStatsRange = 7 | 14 | 30 | 90;

const KST_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Format an instant as a KST calendar `YYYY-MM-DD` (en-CA → ISO date). */
export function formatKstDate(instant: Date): string {
  return KST_DATE.format(instant);
}

/**
 * Inclusive KST `[from, to]` ending today for the given preset length.
 * `to` is today's KST date; `from` is `days - 1` calendar days earlier.
 */
export function getDailySessionStatsQueryRange(
  days: DailySessionStatsRange,
  now: Date = new Date(),
): { from: string; to: string } {
  const to = formatKstDate(now);
  const toNoonKst = new Date(`${to}T12:00:00+09:00`);
  const fromInstant = new Date(toNoonKst.getTime() - (days - 1) * 86_400_000);
  return { from: formatKstDate(fromInstant), to };
}
```

Export from `src/features/admin/viewmodels/index.ts`:

```ts
export * from './daily-session-stats-range';
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
bunx vitest run src/features/admin/viewmodels/daily-session-stats-range.test.ts
```

Expected: PASS (all cases).

- [ ] **Step 6: Commit**

```bash
git add \
  src/features/admin/models/index.ts \
  src/features/admin/viewmodels/daily-session-stats-range.ts \
  src/features/admin/viewmodels/daily-session-stats-range.test.ts \
  src/features/admin/viewmodels/index.ts
git commit -m "$(cat <<'EOF'
feat: add KST range helper for daily session stats

EOF
)"
```

---

### Task 2: `useDailySessionStats` hook

**Files:**
- Create: `src/features/admin/viewmodels/use-daily-session-stats.ts`
- Modify: `src/features/admin/viewmodels/index.ts`

**Interfaces:**
- Consumes: `getDailySessionStatsQueryRange`, `DailySessionStatsRange`, `ApiPaths`, `$api`
- Produces: `useDailySessionStats(days: DailySessionStatsRange)` returning the `$api.useQuery` result for the daily stats endpoint (same shape as other admin hooks: `data`, `isLoading`, `isError`, `isFetching`, `refetch`, …)

- [ ] **Step 1: Implement the hook**

Create `src/features/admin/viewmodels/use-daily-session-stats.ts`:

```ts
import { $api } from '@/common/lib';

import { ApiPaths } from '../models';

import {
  getDailySessionStatsQueryRange,
  type DailySessionStatsRange,
} from './daily-session-stats-range';

export function useDailySessionStats(days: DailySessionStatsRange) {
  const { from, to } = getDailySessionStatsQueryRange(days);

  return $api.useQuery('get', ApiPaths.MachineController_getDailySessionStats, {
    params: { query: { from, to } },
  });
}
```

Add to `src/features/admin/viewmodels/index.ts`:

```ts
export * from './use-daily-session-stats';
```

- [ ] **Step 2: Typecheck the new module**

```bash
bunx tsc --noEmit -p tsconfig.json 2>&1 | rg 'use-daily-session-stats|daily-session-stats' || true
```

Expected: no errors mentioning these new files. (Repo-wide pre-existing tsc noise is OK.)

- [ ] **Step 3: Commit**

```bash
git add \
  src/features/admin/viewmodels/use-daily-session-stats.ts \
  src/features/admin/viewmodels/index.ts
git commit -m "$(cat <<'EOF'
feat: add useDailySessionStats admin hook

EOF
)"
```

---

### Task 3: i18n labels for session stats panel

**Files:**
- Modify: `public/locales/ko/admin.json`
- Modify: `public/locales/en/admin.json`

**Interfaces:**
- Consumes: none
- Produces: translation keys used by Task 4/5

Exact entries (merge into existing JSON; keep valid JSON, no trailing commas):

Korean (`public/locales/ko/admin.json`):

```json
"dailySessionStats": "일별 이용 세션",
"dailySessionStatsRange": "조회 기간",
"registeredSessions": "등록",
"unregisteredSessions": "미등록",
"rangeDays": "{{count}}일"
```

English (`public/locales/en/admin.json`):

```json
"dailySessionStats": "Daily usage sessions",
"dailySessionStatsRange": "Range",
"registeredSessions": "Registered",
"unregisteredSessions": "Unregistered",
"rangeDays": "{{count}} days"
```

Place keys alphabetically among existing `d*` / `r*` keys as fits the file.

- [ ] **Step 1: Add ko/en keys** as above.

- [ ] **Step 2: Regenerate i18n types (local only)**

```bash
bun run gen:i18n
```

Expected: exit 0. Note: until Task 4 adds `t('…')`, `removeUnusedKeys` may strip unused keys — if strip happens, restore the five keys verbatim after extract (same as prior admin i18n task), then run `bunx i18next-cli types` only, or re-add after Task 4’s `gen:i18n`. Prefer adding keys here and re-running `gen:i18n` at end of Task 4 once `t()` exists.

- [ ] **Step 3: Commit tracked locales only**

```bash
git add public/locales/ko/admin.json public/locales/en/admin.json
git commit -m "$(cat <<'EOF'
feat: add admin i18n for daily session stats

EOF
)"
```

---

### Task 4: `DailySessionStatsPanel` + Storybook

**Files:**
- Create: `src/features/admin/views/components/daily-session-stats-panel/index.tsx`
- Create: `src/features/admin/views/components/daily-session-stats-panel/index.stories.tsx`
- Modify: `src/features/admin/views/components/index.ts`
- Possibly re-touch: `public/locales/ko/admin.json`, `public/locales/en/admin.json` (after `gen:i18n`)

**Interfaces:**
- Consumes: `DailySessionStat[]`, `DailySessionStatsRange`, `t('dailySessionStats'|…)`, `panelClass`, `secondaryButtonClass` / `buttonClass`
- Produces: `DailySessionStatsPanel` with props:

```ts
export namespace DailySessionStatsPanel {
  export type Props = {
    days: DailySessionStatsRange;
    onDaysChange: (days: DailySessionStatsRange) => void;
    data: DailySessionStat[];
    isLoading?: boolean;
    isError?: boolean;
  };
}
```

- [ ] **Step 1: Implement the panel**

Create `src/features/admin/views/components/daily-session-stats-panel/index.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { type DailySessionStat } from '../../../models';
import { type DailySessionStatsRange } from '../../../viewmodels';
import { buttonClass, panelClass, secondaryButtonClass } from '../../styles';

const RANGES = [7, 14, 30, 90] as const satisfies readonly DailySessionStatsRange[];

export function DailySessionStatsPanel({
  days,
  onDaysChange,
  data,
  isLoading,
  isError,
}: DailySessionStatsPanel.Props) {
  const { t } = useTranslation('admin');

  return (
    <div className={panelClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{t('dailySessionStats')}</h2>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={t('dailySessionStatsRange')}
        >
          <span className="text-text-secondary text-sm dark:text-slate-400">
            {t('dailySessionStatsRange')}
          </span>
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              className={days === range ? buttonClass : secondaryButtonClass}
              disabled={isLoading}
              onClick={() => onDaysChange(range)}
            >
              {t('rangeDays', { count: range })}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div role="status" className="text-sm">
          {t('loading')}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-6 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {t('requestFailed')}
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                name={t('registeredSessions')}
                type="monotone"
                dataKey="registeredCount"
                stroke="#4f7df3"
                strokeWidth={2}
                dot={data.length <= 14}
                isAnimationActive={false}
              />
              <Line
                name={t('unregisteredSessions')}
                type="monotone"
                dataKey="unregisteredCount"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={data.length <= 14}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export namespace DailySessionStatsPanel {
  export type Props = {
    days: DailySessionStatsRange;
    onDaysChange: (days: DailySessionStatsRange) => void;
    data: DailySessionStat[];
    isLoading?: boolean;
    isError?: boolean;
  };
}
```

Export from `src/features/admin/views/components/index.ts`:

```ts
export * from './daily-session-stats-panel/index';
```

- [ ] **Step 2: Add Storybook stories**

Create `src/features/admin/views/components/daily-session-stats-panel/index.stories.tsx`:

```tsx
import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { type DailySessionStatsRange } from '../../../viewmodels';

import { DailySessionStatsPanel } from '.';

const meta = {
  title: 'Admin/DailySessionStatsPanel',
  component: DailySessionStatsPanel,
} satisfies Meta<typeof DailySessionStatsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

const series = [
  { date: '2026-11-06', registeredCount: 3, unregisteredCount: 8 },
  { date: '2026-11-07', registeredCount: 5, unregisteredCount: 4 },
  { date: '2026-11-08', registeredCount: 0, unregisteredCount: 0 },
  { date: '2026-11-09', registeredCount: 7, unregisteredCount: 2 },
  { date: '2026-11-10', registeredCount: 4, unregisteredCount: 6 },
  { date: '2026-11-11', registeredCount: 9, unregisteredCount: 1 },
  { date: '2026-11-12', registeredCount: 2, unregisteredCount: 5 },
];

function Interactive(args: DailySessionStatsPanel.Props) {
  const [days, setDays] = useState<DailySessionStatsRange>(args.days);
  return <DailySessionStatsPanel {...args} days={days} onDaysChange={setDays} />;
}

export const Default: Story = {
  args: {
    days: 7,
    onDaysChange: () => undefined,
    data: series,
    isLoading: false,
    isError: false,
  },
  render: (args) => <Interactive {...args} />,
};

export const Loading: Story = {
  args: {
    days: 7,
    onDaysChange: () => undefined,
    data: [],
    isLoading: true,
    isError: false,
  },
};

export const ErrorState: Story = {
  args: {
    days: 7,
    onDaysChange: () => undefined,
    data: [],
    isLoading: false,
    isError: true,
  },
};
```

- [ ] **Step 3: Keep i18n keys via extract**

```bash
bun run gen:i18n
rg -n 'dailySessionStats|registeredSessions|rangeDays' public/locales/ko/admin.json public/locales/en/admin.json
```

Expected: keys present with the Task 3 strings (or equivalent after alphabetical reorder).

- [ ] **Step 4: Lint the new component files**

```bash
bun run check
```

Expected: exit 0. Restore unrelated prettier churn before commit if `check` rewrites other files.

- [ ] **Step 5: Commit**

```bash
git add \
  src/features/admin/views/components/daily-session-stats-panel/index.tsx \
  src/features/admin/views/components/daily-session-stats-panel/index.stories.tsx \
  src/features/admin/views/components/index.ts \
  public/locales/ko/admin.json \
  public/locales/en/admin.json
git commit -m "$(cat <<'EOF'
feat: add daily session stats panel for admin overview

EOF
)"
```

---

### Task 5: Wire panel into overview screen

**Files:**
- Modify: `src/features/admin/views/overview-screen/index.tsx`

**Interfaces:**
- Consumes: `useState` for `DailySessionStatsRange` (default `7`), `useDailySessionStats`, `DailySessionStatsPanel`
- Produces: overview renders the chart section below status cards and above room overview

- [ ] **Step 1: Update overview**

In `src/features/admin/views/overview-screen/index.tsx`:

1. Add imports:

```tsx
import { useState } from 'react';

import { DailySessionStatsPanel } from '../components';
import {
  Gender,
  Location,
  getMachineStats,
  useAdminMachines,
  useDailySessionStats,
  type DailySessionStatsRange,
} from '../../viewmodels';
```

(Adjust existing import lines — keep import-order rules: react / external, then internal, blank lines between groups.)

2. Inside `AdminOverviewScreen`, after `useAdminMachines()`:

```tsx
const [statsDays, setStatsDays] = useState<DailySessionStatsRange>(7);
const sessionStats = useDailySessionStats(statsDays);
```

3. After the four status-card grid `</div>`, before the room overview panel, insert:

```tsx
<DailySessionStatsPanel
  days={statsDays}
  onDaysChange={setStatsDays}
  data={sessionStats.data ?? []}
  isLoading={sessionStats.isLoading}
  isError={sessionStats.isError}
/>
```

Do not change room overview or link-check sections.

- [ ] **Step 2: Verify**

```bash
bunx vitest run src/features/admin/viewmodels/daily-session-stats-range.test.ts
bun run check
```

Expected: vitest PASS; check exit 0 (discard unrelated prettier noise).

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/views/overview-screen/index.tsx
git commit -m "$(cat <<'EOF'
feat: show daily session stats on admin overview

EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Regenerated OpenAPI / confirm endpoint types | Task 1 Step 1 |
| `DailySessionStat` model export | Task 1 |
| KST `from`/`to` helper + unit tests (7/14/30/90) | Task 1 |
| `useDailySessionStats` hook | Task 2 |
| Dual LineChart registered/unregistered | Task 4 |
| Presets 7/14/30/90, default 7 | Task 4 + Task 5 |
| Placement below status cards, above room overview | Task 5 |
| i18n ko/en | Task 3 (+ Task 4 gen:i18n) |
| Storybook mocks incl. zeros | Task 4 |
| No sum cards / custom picker / separate page | Not added |

## Self-review notes

- No TBD/TODO placeholders.
- Property names match BE: `date`, `registeredCount`, `unregisteredCount`.
- Range type `7 | 14 | 30 | 90` consistent across helper, hook, panel, overview.
- Inclusive day math covered by vitest fixtures including UTC/KST boundary case.
