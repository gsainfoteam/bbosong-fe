# Admin users: machine usage count

## Goal

Surface BE `GET /auth/users` field `machineUsageCount` in the admin permissions user table so admins can see how many washer/dryer usage sessions each user has registered (open and completed; unlinked sessions excluded).

## Context

- BE branch `feat/users-machine-usage-count` adds `machineUsageCount: number` to `GetUsersResDto`.
- FE already consumes `GetUsersResDto` as `AdminUserWithSubscriptions` and renders users in `UserTable` on the permissions screen.
- Machines admin already reflects `currentUsage`; this change is users/permissions only.

## Approach

Regenerate OpenAPI types from swagger (`bun run gen:api`), then add a display column. Do not hand-edit the schema unless generation cannot obtain the field.

## Data / schema

1. Run `bun run gen:api` using existing `.env.local` swagger credentials (`SWAGGER_URL`, `SWAGGER_USER`, `SWAGGER_PASSWORD`).
2. Confirm `components['schemas']['GetUsersResDto']` includes `machineUsageCount: number`.
3. Keep importing the type via `AdminUserWithSubscriptions` from admin models (no new model layer).

### Fallback

If staging swagger does not yet expose `machineUsageCount` (BE unmerged/undeployed):

- Prefer generating against a local BE that serves the updated OpenAPI document, or
- Wait until the BE change is on the swagger source used by `gen:api`.

Do not permanently hand-maintain the field in `api-schema.ts` as the primary path.

## UI

- File: `src/features/admin/views/components/user-table/index.tsx`
- Add a column between **role** and **push devices**.
- Cell content: numeric `user.machineUsageCount` (including `0`).
- No filter or sort by usage count in this change.
- Update empty-state `colSpan` to match the new column count.

## i18n

- Keys in `public/locales/ko/admin.json` and `public/locales/en/admin.json`:
  - `machineUsageCount`: `"이용 횟수"` / `"Usage count"`
- Regenerate i18n types if the project workflow requires (`bun run gen:i18n`).

## Stories / tests

- Update `UserTable` Storybook mocks with `machineUsageCount` values (e.g. non-zero and `0`).
- No new viewmodel logic required; existing `useAdminUsers` passes API data through.

## Out of scope

- Filtering or sorting by usage count
- Rewriting permissions page copy beyond what’s needed for the column label
- Other unmerged BE admin features

## Success criteria

- Regenerated schema includes `machineUsageCount`.
- Permissions user table shows the count for each user.
- ko/en labels present; Storybook builds with typed mocks.
