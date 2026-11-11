# Code Review Rule Groups

Nine focused review groups adapted from Condel. Use delegated or sequential
passes according to available capabilities. Apply rules only to the relevant
stack and established project conventions. Priority guides attention; actual
impact determines severity. Project instructions and documented exceptions
take precedence over these opinionated defaults.

---

## Blocking Issues
Priority: critical

Rules:
- N+1 queries almost always block, though context matters
- Unrelated database or migration changes in the PR
- Ecto schema structs or runtime data-access APIs used from point-in-time migrations
- Cross-tenant authorization gaps or user scopes accepted but not applied
- `Repo` calls inside changeset functions
- Magic numbers or values without constants or descriptive names
- Environment variables read outside configuration boundaries
- Rescuing exceptions in non-boundary code
- Context or service code manually generating a new row's UUID when the Ecto schema's configured `autogenerate` can own it

Context:
You are reviewing code for blocking issues that should almost always prevent merge.
Be strict about these rules; they represent strong technical opinions held by the reviewer.

For each issue found:
- Quote the exact code location
- Explain why it is problematic
- Suggest a specific fix

Remember: N+1 is a strong opinion held loosely. Acknowledge a sound reason when one exists.

---

## Testing Strategy
Priority: high

Rules:
- Follow TDD in a red-green-refactor loop
- Keep browser/end-to-end tests to the minimum needed for main paths
- Use LiveView and ConnCase tests for web interactions, handlers, and error paths
- Push domain rules into context, schema, or pure module tests
- Test persisted behavior through the database only at the layer that owns the write; avoid mocking owned application code
- Test one behavioral owner at a time. Stop at collaborator boundaries: caller tests must not inspect a callee's persisted state, workflow topology, delivered events, or other downstream behavior
- Use Mox only at real external boundaries or for genuinely slow or paid operations
- Prefer realistic HTTP fakes such as `Req.Test` or a local Plug over recorded cassettes
- Keep setup in `setup` blocks or fixtures and make each `test` block communicate intent
- Keep the full suite within the project’s documented test budget

Context:
You are reviewing testing approach and test quality.

Key philosophy:
- Push tests to the lowest layer that proves the behavior
- Stop at collaborator boundaries
- Use real data for owned code
- Mock only external boundaries
- Expect a fast test suite and a TDD workflow

Check for:
- Browser or LiveView tests used where a context or pure-function test would suffice
- Excessive mocking between application modules
- Tests that reach through a context, pipeline, worker, or library to assert behavior owned by that collaborator. Do not recommend internal mocks merely to create an observation seam; remove the redundant assertion or use the smallest necessary integration test
- Tests coupled to implementation details rather than behavior
- Missing error and cross-tenant cases
- Tests not written first when the commit history makes that evident

---

## Code Organization
Priority: high

Rules:
- Put multi-resource workflows and domain actions in contexts or focused domain modules
- Keep Oban workers skinny; put domain work in contexts or dedicated modules
- Keep business rules out of controllers, LiveViews, templates, and components
- Keep external integrations behind focused boundary modules configured through application config
- Read environment variables only in configuration, normally `config/runtime.exs`
- Keep domain modules independent of web/presentation modules
- Put UI action authorization in domain context predicates
- Prefer readable code over strict DRY
- Prefer a single `with` chain for linear fallible workflows; flag nested `case`/`cond`/`if` ladders or `do_*` trampoline helpers when they only sequence checks/steps that could be read top-to-bottom

Context:
You are reviewing code organization and architecture.

Look for:
- Business logic hidden in web modules
- Fat workers or controllers
- Environment-variable reads in application modules
- Domain modules depending on web modules
- Unnecessary abstractions that reduce readability
- `do_*` helpers that only hide a linear happy path

---

## Database & Performance
Priority: high

Rules:
- N+1 queries almost always block, though context matters
- Prefer Ecto query APIs over raw SQL when practical
- Preload ordinary associations in the parent read; flag follow-up queries that manually reconstruct an association or re-query already-loaded data. Separate loaders are valid when they apply viewer-specific filtering or transformation
- Do not use Ecto schema structs or runtime data-access APIs from migrations
- Use concurrent indexes when adding an index to an existing write-active table
- Keep indexed columns bare in predicates unless a matching functional index exists
- Escape user or LLM input before interpolating it into `LIKE` or `ILIKE` patterns
- Keep database changes related to the PR's purpose
- Prefer Ecto schema `autogenerate` for routine UUID creation; do not require a PostgreSQL column default when schema autogeneration is configured
- Flag context or service code that generates and passes a row's own UUID without a concrete need for the ID before insertion

Context:
You are reviewing database queries, migrations, and performance.

Check for:
- Missing preloads or repeated queries
- Post-fetch `Repo` calls used in place of an ordinary association preload
- Schema structs or runtime data-access calls in migration files
- Non-concurrent indexes on write-active tables
- Non-sargable predicates
- Unescaped wildcard input
- Unrelated schema drift

---

## API Design
Priority: medium

Rules:
- Prefer REST conventions, but allow pragmatic deviations
- Use correct HTTP status codes
- Include useful content in error responses
- Keep versioning simple unless complexity is justified
- Enforce the same authorization and tenant scoping as the UI

Context:
You are reviewing API design and HTTP conventions.

Philosophy:
- Follow REST when it fits
- Do not force awkward resource shapes
- Return correct status codes and useful errors
- Treat authorization as part of the endpoint contract

---

## Phoenix & LiveView Patterns
Priority: high

Rules:
- Prefer LiveView for interactive server-rendered features
- Keep LiveViews focused on presentation and orchestration; put domain rules in contexts
- Keep `render/1` small and extract substantial markup into focused function components
- Pass only required assigns to components and verify every clause uses required attrs
- Classify PubSub payloads: persisted-resource invalidations carry IDs; ephemeral results carry complete data
- Reload persisted resources through scoped contexts after PubSub events
- Gate user-specific side effects on initiator state
- Unsubscribe from old parameter-dependent topics before subscribing to new ones

Context:
You are reviewing Phoenix and LiveView architecture.

Check for:
- Domain logic implemented in a LiveView or component
- Large mixed-concern render blocks
- Stale derived assigns after PubSub refresh
- Broadcast payloads that leak stale or unauthorized state
- Passive viewers receiving initiator-only flashes, events, or navigation
- Topic changes that leave old subscriptions active

---

## Elixir & Ecto Patterns
Priority: high

Rules:
- Remember that module attributes are evaluated at compile time; use functions for dynamic values
- Keep changeset functions pure and free of repository access
- Use tagged tuples and pattern matching for expected failures
- Prefer a single `with` chain for sequential fallible operations
- Handle every expected error in controllers, LiveViews, and tool executors
- Apply policy scoping and resource ownership checks consistently
- Preload every association read by visibility predicates
- Reuse validated string constants instead of raw enum-like literals
- Let Ecto schema `autogenerate` own routine persisted UUID creation; context or service code should not generate and pass a row's own ID unless the workflow concretely needs it before insertion

Context:
You are reviewing Elixir and Ecto correctness.

Check for:
- Runtime calculations frozen into module attributes
- `Repo` calls in changesets
- Bare matches on fallible calls
- Missing catch-all `{:error, _}` handling at web or tool boundaries
- Scope arguments that are ignored
- Visibility predicates reading unloaded associations
- Raw string literals duplicating canonical status constants
- Calls such as `Uniq.UUID.uuid7()` or `Ecto.UUID.generate()` in context or service code whose result is used only to populate a new row's own ID
- Missing schema `autogenerate` configuration for an ordinary UUID primary key; do not require a PostgreSQL column default

---

## Error Handling & Logging
Priority: medium

Rules:
- Fail fast whenever possible
- For batch operations, accumulate validation errors and let the user decide how to proceed
- Rescue exceptions only at boundaries such as controllers or external-service adapters
- Return tagged errors for expected conditions
- Do not bare-match fallible calls in request or event handlers
- Keep logging useful enough that the big picture remains visible

Context:
You are reviewing error handling and logging.

Look for:
- Exception rescuing deep in domain code
- Valid expected failures converted into crashes
- Missing error accumulation in batch operations
- Handlers without user-safe error responses
- Overly verbose logging

---

## Code Quality
Priority: medium

Rules:
- Self-documenting code preferred: good names, clear structure, short methods
- Comments only for 'why' when needed, not 'what'
- Confusing variable names should be fixed
- Distinguish nil, false, empty strings, and empty collections according to the contract
- Security awareness (OWASP patterns, information leakage)
- No magic numbers - use constants or descriptive names
- Avoid `do_*` helper names for ordinary workflow extraction; use names that describe the domain step
- Avoid nested conditions, use a `with` chain instead
- Always flag functions with more than four parameters for refactoring review; consider a cohesive options struct/map or splitting responsibilities, but do not automatically block
Context:
You are reviewing code quality and readability.

Watch for:
- Magic numbers or strings
- Confusing or inverted variable names
- Comments explaining obvious code
- Security anti-patterns
- Linear workflows obscured by nested `case`, `cond`, or `if` blocks
- Function definitions with more than four parameters

Do not flag:
- Branching logic whose alternatives are genuinely different workflows
