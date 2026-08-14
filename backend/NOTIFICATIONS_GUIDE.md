# In-App Notifications

## TL;DR

A `super_user` can notify **every** account on the platform. An `admin_user` can notify
**only the users they created** (`users.created_by_user_id == admin.id`). Everyone else
receives notifications but cannot send them.

That rule is enforced in **one place** — `services/notifications.py::_audience_pool_query`.
Every send path funnels through it, so an audience can never be widened by a crafted
request body.

---

## Authority Matrix

| Sender role     | `audience: "all"` | `audience: "my_users"`     | `audience: "selected"`            | Receives? |
| --------------- | ----------------- | -------------------------- | --------------------------------- | --------- |
| `super_user`    | ✅ every user      | accounts it created        | ✅ any user                        | ✅         |
| `admin_user`    | ❌ 403             | its created users          | ✅ only its created users          | ✅         |
| `general_user`  | ❌ 403             | ❌ 403                      | ❌ 403                             | ✅         |
| `demo_user`     | ❌ 403             | ❌ 403                      | ❌ 403                             | ✅         |

Two deliberate behaviours worth knowing:

- **The sender is excluded from their own broadcast.** A super user sending to "all"
  does not land a copy in their own inbox.
- **Out-of-scope ids are rejected wholesale, not silently dropped.** If an admin posts
  `user_ids: [own_user, someone_elses_user]`, the whole request returns `403` rather than
  delivering to the one legal recipient. An admin should learn they targeted someone
  outside their scope instead of believing the message reached everyone they listed.

---

## Data Model

Two tables — the message is stored once, with one row per recipient:

```
notifications                     notification_recipients
  id                                id
  sender_user_id  -> users.id       notification_id -> notifications.id
  title           VARCHAR(200)      user_id         -> users.id
  message         VARCHAR(2000)     is_read         BOOL   (default 0)
  category        info|success|     read_at         DATETIME NULL
                  warning|alert     created_at
  audience        all|my_users|
                  selected        UNIQUE (notification_id, user_id)
  recipient_count INT             INDEX ix_notification_recipients_inbox (user_id, is_read)
  created_at
```

**Why two tables rather than one row per recipient with the text duplicated:** read state
is per-user, so it needs its own row; but the body should not be copied N times. This shape
also makes the sender's "24 recipients, 12 read" stat a single indexed `GROUP BY`.

**Why recipients are frozen at send time:** the audience is resolved and written into
`notification_recipients` when the message is sent. If a user is later reassigned to a
different admin (`created_by_user_id` changes), they neither gain access to that admin's
older messages nor lose the ones already delivered to them.

`ix_notification_recipients_inbox (user_id, is_read)` serves both hot reads: the unread
badge count and the paginated inbox.

---

## Migration

The tables ship three ways, matching the precedent set by `user_page_permissions`:

| Path | File |
| ---- | ---- |
| Alembic | `alembic/versions/j7k8l9m0n1o2_add_notification_tables.py` (down_revision `i6j7k8l9m0n1`) |
| Raw SQL (Postgres/SQLite) | `db/migrations/004_notifications.sql` |
| Raw SQL (MySQL) | `db/migrations/004_notifications_mysql.sql` |

⚠️ **`db/session.py::init_db()` calls `Base.metadata.create_all()` on startup**, so in
practice the tables appear from the model definitions alone the first time the app boots
after deploy — which is how they were created in the current environment. The Alembic
revision and SQL files exist so a fresh/managed environment can be provisioned explicitly.
See `MIGRATION_STATUS.md` for the wider note that Alembic has drifted from the models.

Deleting a user is handled: `services/users.py::delete_user` calls
`purge_user_notifications`, which clears the user's inbox rows plus any message they sent
(and that message's remaining recipient rows), so the FKs never block account deletion.

---

## API

All routes are under `/api/v3/notifications`.

```bash
# --- Any authenticated role -------------------------------------------------
GET    /api/v3/notifications/?limit=50&offset=0&unread_only=false
       -> {total, unread, limit, offset, items:[{id, notification_id, title,
                                                 message, category, is_read,
                                                 read_at, created_at, sender}]}

GET    /api/v3/notifications/unread-count          -> {unread}

POST   /api/v3/notifications/read                  -> {updated, unread}
       Body: {"ids": [12, 13]}   # omit "ids" to mark the whole inbox read

# --- super_user + admin_user only -------------------------------------------
GET    /api/v3/notifications/audience              -> {scope, total, items:[...]}
       # scope is "all" for super_user, "created_by_me" for admin_user.
       # Populates the recipient picker — it IS the sender's permitted pool.

GET    /api/v3/notifications/sent?limit=50&offset=0
       -> {total, limit, offset, items:[{..., recipient_count, read_count}]}
       # super_user sees every notification sent platform-wide;
       # admin_user sees only its own. (Mirrors the points giving-history rule.)

POST   /api/v3/notifications/                      -> 201 {id, audience,
                                                           recipient_count, created_at}
       Body: {"title": "...", "message": "...",
              "category": "info|success|warning|alert",
              "audience": "all|my_users|selected",
              "user_ids": [4, 7]}          # required when audience == "selected"

DELETE /api/v3/notifications/{id}                  -> 204
       # Retracts from every inbox. Sender may delete their own; super_user any.
```

### Status codes

| Code | When |
| ---- | ---- |
| `403` | non-sender role tries to send; admin targets a user outside its pool; admin uses `audience: "all"`; non-super tries to delete someone else's message |
| `400` | `audience: "selected"` with an empty `user_ids`; audience matched zero users |
| `422` | empty/oversized `title` or `message`; unknown `category` or `audience` |

Read routes are always scoped to `user_id == caller`, so a caller cannot flip another
user's read state by guessing recipient row ids.

---

## Frontend

| Piece | File |
| ----- | ---- |
| API client + types + `color-mix` category styles | `frontend/lib/notifications.ts` |
| Bell dropdown (used by both headers) | `frontend/components/notifications/NotificationBell.tsx` |
| Shared inbox row + empty state | `frontend/components/notifications/InboxItems.tsx` |
| Admin compose / sent / inbox | `frontend/app/admin/notifications/page.tsx` |
| User inbox | `frontend/app/user/notifications/page.tsx` |

- The previously **dead** bell buttons in `AdminHeader.tsx` and `UserHeader.tsx` (hardcoded
  red dot, no `onClick`) are now the live `<NotificationBell />`.
- The badge polls `/unread-count` every **60s**, and also listens for the
  `notificationunreadchange` window event so marking something read on the notifications
  page updates the header badge instantly, without a refetch. This mirrors the existing
  `accountsettingschange` / `pageaccesschange` pattern.
- Nav entries were added to `AdminSidebar.tsx` and `UserSidebar.tsx`, and both pages are
  registered in `core/pages.py` (`admin_notifications`, `dashboard_notifications`) so they
  can be toggled per-user from the API Permissions screen like any other page.

### ⚠️ Styling constraint observed in this feature

`tailwind.config.ts` maps `primary`/`background`/`foreground`/`border`/`card` to bare
`var(--x)` strings, which Tailwind cannot parse into channels. **Any opacity modifier on
those colors silently compiles to no CSS at all** — `bg-primary/10`, `text-foreground/60`,
`ring-primary/20`, `from-primary/0` all emit nothing (~105 such dead classes already exist
across the app).

The notification UI therefore uses:

- `bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]` for primary tints,
- solid `bg-primary` / `text-primary` / `border-primary` where full strength is wanted,
- fixed `slate`/`blue`/`emerald`/`amber`/`rose` scales (which *do* support `/N`) for
  neutral and category colors.

Card, hero, stat-tile, banner, and button classes are otherwise copied verbatim from
`app/admin/point/page.tsx` so the pages sit inside the existing design system.

---

## Verification

Both layers were tested against a temporary SQLite database (no production data touched):

- **28 service-level assertions** — audience pools per role, admin blocked from other
  admins' users / orphan users / peers / the super user, mixed legal+illegal id lists
  rejected wholesale, fan-out counts, read-state isolation between users, sent-history
  scoping, retract permissions, FK purge on account deletion.
- **36 HTTP-level assertions** — the same rules through the real routes, plus response
  shapes, `422` validation, and the `201`/`204`/`400`/`403` status codes above.

All passed. Re-run them by pointing `PYTHONPATH` at `backend/` and executing the scripts in
the session scratchpad, or port them into `backend/tests/`.
