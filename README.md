# Quote Management System

## Concurrency model: optimistic concurrency control

The quote editing flow uses optimistic concurrency control with a `version` column on each quote.

### Why this approach
Users typically edit a quote over several minutes and do not want a lock to block other users from reading the quote while they are making changes. A pessimistic lock would add unnecessary contention for a normal quote-editing workflow. Instead, the app loads the quote with its current `version`, and any save attempt must include that client-side version.

The backend performs an atomic conditional update:

- `UPDATE quotes SET ... , version = version + 1 WHERE id = ? AND version = ?`

If the row count is `0`, the version was stale and the request is rejected with `409 Conflict`.

### How it works
1. A quote is loaded from the API with its current `version` value.
2. The frontend keeps that version while the user edits the form.
3. On save, the frontend sends the quote `version` back to the backend.
4. The backend updates only when the current database version still matches the submitted one.
5. If another user already saved a newer version, the backend refuses the write and returns:

```json
{
  "success": false,
  "code": "QUOTE_CONFLICT",
  "message": "This quote was modified by another user. Please reload the latest version before saving."
}
```

### Why this is safe
This pattern avoids the unsafe sequence:

- read the quote
- check the version in application code
- update the row later

That sequence can race between two requests. The atomic conditional update ensures the database itself decides whether the write is valid, so only the first writer succeeds.

### Operational note
The system still enforces the existing quote rules before saving:

- the user must be authenticated
- the user must own the quote
- the quote must still be editable
- stale clients cannot overwrite newer versions
