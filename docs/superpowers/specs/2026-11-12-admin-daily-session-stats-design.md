# Admin overview: daily session stats

## Goal

Surface BE `GET /machine/stats/sessions/daily` on the admin overview (dashboard) so admins can see per-KST-day registered vs unregistered machine usage session counts as a dual-line chart, with range presets.

## Context

- BE (merged `#107`) returns an array of `{ date, registeredCount, unregisteredCount }` for inclusive `from`/`to` (`YYYY-MM-DD`, KST). Empty days are zeros. Max span 90 days. Admin only.
- FE OpenAPI types already include `MachineController_getDailySessionStats` / `GetDailySessionStatsResDto` (regenerate with `bun run gen:api` if missing locally).
- Overview today only shows live machine status cards, per-room breakdown, and link-check summary. Power screen already uses recharts `LineChart`.

## Approach

Add a chart section on overview. Fetch via a dedicated viewmodel hook with preset day ranges. Do not add a separate stats page or summary total cards in this change.

## Data / schema

1. Prefer regenerated types from swagger (`bun run gen:api`); do not hand-edit `api-schema.ts` as the primary path.
2. Model: export `DailySessionStat` as `components['schemas']['GetDailySessionStatsResDto']` from admin models (pass-through; no normalization needed for these numeric/string fields).
3. ViewModel: `useDailySessionStats(days: DailySessionStatsRange)` where `DailySessionStatsRange = 7 | 14 | 30 | 90`.
   - Compute KST calendar `to` = today, `from` = `to - (days - 1)` as `YYYY-MM-DD`.
   - Call `$api.useQuery('get', ApiPaths.MachineController_getDailySessionStats, { params: { query: { from, to } } })`.
   - Default range: `7`.

### Date helper

- Use Asia/Seoul calendar dates for `from`/`to` (same timezone semantics as BE). Prefer existing dayjs setup plus a timezone/UTC plugin if not already available; keep the helper unit-testable (pure `days` → `{ from, to }`).

## UI

- File: `src/features/admin/views/overview-screen/index.tsx` (+ small presentational pieces under `views/components/` as needed).
- Placement: below the four machine status cards, above the room overview panel.
- Panel contents:
  - Title (i18n).
  - Preset control: **7 / 14 / 30 / 90** days (same interaction tone as `PowerLookbackButtons`).
  - recharts `LineChart` with two lines: `registeredCount`, `unregisteredCount`; X axis = `date`.
  - Loading / error states aligned with existing admin patterns (`loading` / `requestFailed`).
- No custom date picker. No stacked/grouped bars. No period-total summary cards.

## i18n

Keys in `public/locales/ko/admin.json` and `public/locales/en/admin.json` (exact copy may be refined in plan):

| Key | ko | en |
|-----|----|----|
| Section title | 일별 이용 세션 | Daily usage sessions |
| Registered legend | 등록 | Registered |
| Unregistered legend | 미등록 | Unregistered |
| Preset labels | 7일 / 14일 / 30일 / 90일 | 7 days / 14 days / 30 days / 90 days |

Run `bun run gen:i18n` so extract keeps keys used via `t()`.

## Stories / tests

- Unit-test the KST `from`/`to` range helper for each preset (inclusive day count).
- Optional Storybook for the chart/preset presentational component with mock series (including zeros).
- Hook can stay thin; no new viewmodel business logic beyond range → query params.

## Out of scope

- Separate admin stats route
- Period sum / average cards
- Filtering by laundry room / gender / machine type
- Custom arbitrary date range picker
- Changing BE validation or semantics

## Success criteria

- Overview shows dual-line daily registered/unregistered session counts.
- Presets 7 / 14 / 30 / 90 refetch with correct inclusive KST `from`/`to` (≤ 90 days).
- Types come from regenerated OpenAPI schema; ko/en labels present.
