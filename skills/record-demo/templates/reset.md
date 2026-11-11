# Demo reset procedure

Use this outline to write the consuming project's reset script in its own
language. The generic package intentionally contains no application module names,
database credentials, sample login, or executable database-reset command.

1. Verify the target is the intended local development environment.
2. Obtain the development actor and any required authorization scope using the
   project's documented account setup. Do not embed credentials in this script.
3. Find the records owned by this demo using stable IDs or a unique demo marker.
4. Restore only the fields/records the demo changes, through supported application
   APIs. Preserve unrelated records and exercise the app's usual invariants.
5. Make reruns safe: already-reset state should succeed without creating duplicate
   records, messages, uploads, jobs, or other side effects.
6. Check the resulting state and print the non-sensitive start URL(s).

Record the exact command in the per-demo notes. Run before rehearsal and again
before recording. For a read-only demo, explicitly note that no reset is needed.
Do not implement this by dropping or rebuilding the project's database.
