# Review preferences

These defaults preserve the original review's emphasis on correctness, readable
code, focused tests, and a small number of actionable findings. Project-specific
preferences and documented tradeoffs take precedence.

- Prove the triggering condition and impact before reporting an issue. Distinguish
  an introduced regression from unrelated existing debt.
- Test behavior at the lowest layer that owns it. Keep browser tests for important
  user flows and integration behavior that lower-level tests cannot establish.
- Prefer real collaborators when cheap and reliable. Mock slow/paid external
  boundaries; avoid mocking application internals just to force a test seam.
- A caller's tests prove its own decisions and integration, not all its callee's
  persistence, job execution, or delivery guarantees again.
- Keep domain logic separate from transport/presentation, and keep background-job
  adapters focused. Do not demand extra abstraction without a concrete benefit.
- Favor clear names, cohesive interfaces, and simple control flow. Small duplication
  can be better than an abstraction that obscures behavior.
- Check authorization, tenant isolation, query cost, migrations, expected errors,
  and compatibility carefully. Apply framework-specific rules only to that stack.
- Preserve the project's established API and configuration conventions unless the
  change demonstrates a reason to alter them.
- TDD is a development practice; a final diff alone cannot establish test order.
- Return a specific location, trigger, consequence, and fix. Omit vague cleanup
  requests and speculative defensive coding. Zero findings is a valid result.
