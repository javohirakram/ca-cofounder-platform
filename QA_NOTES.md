# QA Notes — CoFound Central Asia

## Fixed Issues

### P0 — Functional Bugs

| # | Issue | Fix |
|---|-------|-----|
| P0.1 | Country + City not required in onboarding | Added `validateStep()` with inline errors; progression blocked until filled |
| P0.2 | Users could self-connect from Discover | `currentUserId` threaded through to `ProfileCard`; Connect button hidden + "(You)" label shown |
| P0.3 | Connection status showing "Pending" incorrectly | Accept/Decline in notifications updates connection status in DB |
| P0.4 | No Accept/Decline on connection request notifications | `NotificationItem` rewritten with Accept (creates thread + notifies requester) and Decline actions |
| P0.5 | No success/failure feedback on Connect modal | Added `toast.success`/`toast.error` + self-connect prevention |
| P0.6 | Ideas upvote/interested could spam-increment | Already correctly implemented — toggle guard with `upvoting` state |
| P0.7 | Password fields appeared prefilled in Settings | Changed to proper `autoComplete` attributes (`current-password`, `new-password`) |

### P1 — UX Correctness

| # | Issue | Fix |
|---|-------|-----|
| P1.1 | No active filter chips above results | Added removable filter chips with "Clear all" in `DiscoverContent` |
| P1.2 | Duplicate progress bars on Edit Profile | Removed page-level bar; kept `ProfileForm` internal one |
| P1.3 | Tag selection deduplication | Array toggle logic already prevents duplicates |
| P1.4 | Notification items not actionable | Accept/Decline buttons added (same as P0.4) |
| P1.5 | Messages empty state unclear | Updated description to explain connection requirement |

### P2 — Visual Polish

| # | Area | Changes |
|---|------|---------|
| P2.1 | Design tokens | Refined HSL values for better light/dark contrast; added focus ring polish, `card-hover` utility |
| P2.2 | Card components | `ProfileCard` + `IdeaCard`: subtle border-on-hover (`border-primary/20`), group hover on avatar ring |
| P2.3 | Empty states | Gradient icon background with ring accent; improved spacing |
| P2.4 | Navigation | Sidebar: backdrop-blur, bolder active state; Navbar: softer border, stronger blur |
| P2.5 | Forms | Completeness bar: color-coded border + background (emerald/amber); bold tabular-nums percentage |
| P2.6 | Auth | Auth card: stronger shadow, subtler border |

### Profile Editing

| Issue | Fix |
|-------|-----|
| Experience/Education not editable | Added full CRUD UI to `ProfileForm` (add/remove/edit work experience and education entries) |

## Known Remaining Items

- **Telegram login**: Abandoned due to bot API limitations in dev environment. Email/password auth works.
- **Match scoring**: `POST /api/matches` runs on-demand; no cron-based auto-matching yet.
- **Real-time messaging**: Messages require page refresh; no WebSocket/Supabase realtime subscription yet.
- **Image uploads**: Avatar upload depends on Supabase Storage bucket being configured.
- **Playwright E2E tests**: Not yet added (requires test Supabase instance or mocking).
- **i18n coverage**: Some UI strings are hardcoded in English (filter chip labels, empty states).

## Test Coverage

- **Unit tests**: Not yet added. Key candidates:
  - `calculateCompleteness()` in `ProfileForm`
  - Connection status derivation logic
  - `parseJsonArray<T>()` helper
  - `formatRelativeTime()` utility
- **E2E tests**: Not yet added. Critical flows:
  - Signup → onboarding → discover
  - Send connection → accept → thread created
  - Upvote toggle (no double-count)
  - Password change in settings
