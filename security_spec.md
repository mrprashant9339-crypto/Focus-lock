# FocusLock Security Specification & TDD Matrix

## 1. Data Invariants
1. A user can only access, create, read, update, or delete sub-collections located directly under their own `/users/{uid}` path where `request.auth.uid == uid`.
2. Document IDs must conform to `isValidId(id)` (alphanumeric, dash, underscore, max 128 chars) to prevent ID poisoning and Denial-of-Wallet attacks.
3. Subscription records cannot be arbitrarily altered or escalated by clients; verified tiers and statuses are server-authoritative or owner-constrained with schema validation.
4. Outbound mail queue (`/mail/{mailId}`) writes require authentication and strict schema to prevent spam relaying.
5. All updates must satisfy schema constraints and not introduce unbounded arrays or arbitrary fields (`affectedKeys().hasOnly(...)`).

## 2. The Dirty Dozen Payloads & Invariant Tests
1. **Unauthenticated Read on User Document**: GET `/users/otherUser123` with no auth token. Expect `PERMISSION_DENIED`.
2. **Cross-Tenant Document Read**: Auth UID `user_alice` attempts to read `/users/user_bob/selectedApps/instagram`. Expect `PERMISSION_DENIED`.
3. **Cross-Tenant Document Write**: Auth UID `user_alice` attempts to write to `/users/user_bob/focusSessions/session1`. Expect `PERMISSION_DENIED`.
4. **ID Poisoning Attack**: Auth UID `user_alice` attempts to create `/users/user_alice/devices/` with a 2KB garbage string as `deviceId`. Expect `PERMISSION_DENIED`.
5. **Ghost Field Injection (Shadow Update)**: User attempts to update `UserProfile` with `{ isSystemAdmin: true, bypassAllLocks: true }`. Expect `PERMISSION_DENIED`.
6. **Self-Escalation on Subscription**: User attempts to update `/users/{uid}/subscriptions/current` with arbitrary unbounded tier payload. Expect `PERMISSION_DENIED`.
7. **Blanket Query Scraping**: User attempts `getDocs(collection(db, 'users'))`. Expect `PERMISSION_DENIED`.
8. **Unbounded Array Injection**: User attempts to inject an array of 5,000 app strings into a `FocusProfile`. Expect `PERMISSION_DENIED`.
9. **Mail Relaying Spam Attack**: Unauthenticated user attempts to create doc in `/mail`. Expect `PERMISSION_DENIED`.
10. **Orphan Session Write**: User attempts to write session for another user ID inside payload. Expect `PERMISSION_DENIED`.
11. **Negative Time / Malformed Daily Usage Injection**: User attempts to inject negative duration or non-number screen time into `/users/{uid}/usageDaily/{date}`. Expect `PERMISSION_DENIED`.
12. **Tampering with Other User's Rules Cache**: User attempts to override `/users/{otherUid}/selectedApps`. Expect `PERMISSION_DENIED`.
