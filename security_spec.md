# Security Specification & Test Payloads (MovieFlix)

## 1. Data Invariants & Authorization Matrix

1. **User Profile Ownership & Self-Promotion Prevention**:
   - A user document `/users/{userId}` can only be created by an authenticated user whose `request.auth.uid == userId`.
   - New user registrations **must always** receive `role = "user"`.
   - Non-admin users cannot promote themselves or set `role = "admin"`.
   - Non-admin users cannot alter `uid`, `email`, `role`, or `createdAt` on updates.
   - Non-admin users can only update safe fields: `username`, `displayName`, `avatar`, `photoURL`, `updatedAt`.
   - Only verified administrators (`isAdmin()`) can change user roles between `user` and `admin`.

2. **Movie Catalog Admin Sovereignty**:
   - Any public user can read published movie documents at `/movies/{movieId}`.
   - Only verified administrators (`isAdmin()`) can create, update, or delete movies.
   - Movie document data must pass strict structural and boundary validation (`isValidMovie`).
   - Movie titles must not exceed 200 characters, ratings must stay within `[0.0, 10.0]`, and years must be valid integers between `1888` and `2100`.

3. **Genre & Category Control**:
   - Any user can read `/genres/{genreId}`.
   - Only verified administrators (`isAdmin()`) can create, update, or delete genre categories.
   - Payloads must satisfy `isValidGenre` (name between 2 and 64 characters, non-empty).

4. **Audit Log Immutability**:
   - `/adminLogs/{logId}` can only be created by an administrator recording an action.
   - Admin logs cannot be updated or deleted by any user or administrator (strict append-only audit trail).

5. **Watchlist Isolation**:
   - Authenticated users can only read, create, list, and delete their own watchlist items at `/watchlist/{watchId}`.
   - Every watchlist document must have `userId == request.auth.uid`.
   - Users cannot list or query another user's personal watchlist.

6. **Like Authenticity**:
   - Movie likes at `/likes/{likeId}` can only be created or deleted by the user whose UID matches `userId`.
   - Users cannot create likes on behalf of others or spoof another user's like count.

7. **Community Comments & Moderation**:
   - Comments at `/comments/{commentId}` are publicly readable.
   - Only authenticated users can submit comments, and `userId` must strictly match `request.auth.uid`.
   - Comment content must be non-empty, between 2 and 500 characters, and sanitized against injection.
   - Authors can only edit their own comment's `content` or delete their comment.
   - Non-authors can only report a comment by incrementing `reportCount` by exactly 1.
   - Administrators can delete/moderate any comment regardless of author.

8. **Catch-All Default Deny**:
   - All paths and subcollections not explicitly whitelisted are closed with `allow read, write: if false;`.

---

## 2. The Dirty Dozen Test Payloads

1. **Payload 1 (Self-Promotion to Admin on Registration)**:
   - Request: `POST /users/attacker_uid` with payload `{ uid: "attacker_uid", email: "attacker@example.com", role: "admin", createdAt: "2026-10-01T00:00:00Z" }` by user `attacker_uid`.
   - Expected Result: `PERMISSION_DENIED` (only `role: "user"` permitted for normal users).

2. **Payload 2 (Role Escalation via Profile Update)**:
   - Request: `PATCH /users/attacker_uid` with `{ role: "admin" }` by user `attacker_uid`.
   - Expected Result: `PERMISSION_DENIED` (`affectedKeys().hasOnly` rejects changes to `role`).

3. **Payload 3 (Cross-User Profile Hijacking)**:
   - Request: `PATCH /users/victim_uid` with `{ username: "hacked" }` by user `attacker_uid`.
   - Expected Result: `PERMISSION_DENIED` (owner UID mismatch).

4. **Payload 4 (Unauthorized Movie Creation by Normal User)**:
   - Request: `POST /movies/movie_pirate` with `{ title: "Illegal Movie", status: "published", rating: 9.9, year: 2026 }` by standard authenticated user `user_123`.
   - Expected Result: `PERMISSION_DENIED` (requires `isAdmin()`).

5. **Payload 5 (Movie Poisoning - Out-of-Bounds Rating)**:
   - Request: `POST /movies/m_test` with `{ title: "Test", rating: 99.0, year: 2026 }` by administrator.
   - Expected Result: `PERMISSION_DENIED` (rating > 10.0 violates `isValidMovie`).

6. **Payload 6 (Genre Deletion by Non-Admin)**:
   - Request: `DELETE /genres/action` by standard authenticated user `user_123`.
   - Expected Result: `PERMISSION_DENIED` (requires `isAdmin()`).

7. **Payload 7 (Watchlist Snooping / Blanket Query)**:
   - Request: `GET /watchlist` without `where("userId", "==", request.auth.uid)` filter.
   - Expected Result: `PERMISSION_DENIED` (enforced resource-level query filter).

8. **Payload 8 (Watchlist Spoofing)**:
   - Request: `POST /watchlist/item_1` with `{ userId: "victim_uid", movieId: "cine-01", movieTitle: "Tears of Steel" }` by user `attacker_uid`.
   - Expected Result: `PERMISSION_DENIED` (`userId != request.auth.uid`).

9. **Payload 9 (Comment Identity Hijacking)**:
   - Request: `POST /comments/c_spoof` with `{ userId: "admin_uid", movieId: "cine-01", userName: "Admin", content: "Fake comment" }` by user `attacker_uid`.
   - Expected Result: `PERMISSION_DENIED` (`userId != request.auth.uid`).

10. **Payload 10 (Comment Content Mutation by Third Party)**:
    - Request: `PATCH /comments/c_victim` with `{ content: "Defaced text" }` by user `user_stranger`.
    - Expected Result: `PERMISSION_DENIED` (only author or admin allowed).

11. **Payload 11 (Audit Log Tampering / Deletion)**:
    - Request: `DELETE /adminLogs/log_123` by any user or administrator.
    - Expected Result: `PERMISSION_DENIED` (admin logs are strictly immutable).

12. **Payload 12 (Path Traversal / Junk ID Injection)**:
    - Request: `POST /movies/../../../evil%20id` or with 2KB string document ID.
    - Expected Result: `PERMISSION_DENIED` (`isValidId` enforces length <= 128 and strict regex `^[a-zA-Z0-9_\-]+$`).
