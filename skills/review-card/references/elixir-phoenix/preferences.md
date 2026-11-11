# Elixir/Phoenix review preferences

Review preferences for Elixir, Phoenix, LiveView, Ecto,
and Oban. Select this opinionated profile explicitly in `.agents/workflows.md`.
Apply rules only to applicable technologies and project conventions; project
instructions and documented exceptions take precedence. Omit findings that
are merely style preferences under the skill’s conservative judging pass.

## Key Findings Summary

### Testing Philosophy

#### 1. Push Tests Down the Hierarchy

**Definitive rules:**

- Keep browser/end-to-end tests to the minimum needed for main paths and behavior that resists lower-level testing.
- Use LiveView and ConnCase tests for web interactions, handlers, and error paths.
- Test business rules in contexts, schemas, and pure modules.
- Put a pure function's tests at the unit level rather than standing up database fixtures or a LiveView.
- Keep the full test suite fast relative to the project’s documented test budget.

Comprehensive high-level tests are slow and make failures harder to diagnose. Prove each behavior at the lowest layer that owns it, then use a small number of focused web tests to verify routing and integration.

#### 2. Minimal Mocking, Prefer Real Data

**Definitive rules:**

- Do not mock or stub between layers of owned application code.
- Use real structs and database records when they are fast enough.
- Mock genuinely slow or paid operations and external boundaries.
- Prefer a realistic HTTP fake such as `Req.Test` or a local Plug over recorded response cassettes.
- Use Mox for actual boundary behaviours, not to force branches in internal collaborators.

An external fake should return realistic responses and support the basic dynamic behavior of the real service. Internal tests should exercise the real collaboration between application modules.

#### 3. TDD Workflow

**Definitive rule:**

- Always work in a traditional red-green-refactor loop: write a failing test, make it pass, and refactor while green.

#### 4. Test Organization and Clarity

- Put shared setup in `setup` blocks or fixtures.
- Keep each `test` block focused on behavior and intent.
- Cover edge cases and tagged errors explicitly.
- Use the project's existing scenario fixtures before inlining multi-record setup.
- For PubSub-driven LiveView updates, force the broadcast round trip and include a focused routing test.

### Code Organization

#### 1. Separation of Concerns

- Put business rules in contexts, schemas, or focused domain modules.
- Keep controllers, LiveViews, templates, and components focused on web orchestration and presentation.
- Keep domain modules independent of the project’s web/presentation modules.
- Put UI action authorization in domain context predicates so every caller shares the same rule.
- Put external integrations behind focused boundary modules configured through application config.

Business logic hidden in a web module is difficult to reuse, authorize consistently, and test at the right layer.

#### 2. Domain Modules for Complex Operations

Create a focused domain module or context operation when:

- A workflow crosses multiple resources.
- A logical action is larger than ordinary CRUD.
- The workflow benefits from a cohesive, directly testable interface.

Do not create an extra module merely to wrap a single context call. Prefer names that describe the domain action rather than generic `Service` or `Manager` suffixes.

#### 3. Environment and Application Configuration

**Definitive rule:**

- Read environment variables only at configuration boundaries, normally `config/runtime.exs`.
- Read configured values through `Application.fetch_env!/2`, `Application.get_env/3`, or injected options in application code.

This keeps runtime configuration explicit and application modules testable.

#### 4. Background Jobs

**Definitive rule:**

- Keep Oban workers skinny.
- Put domain work in contexts or focused modules with a single responsibility.
- Let workers translate job arguments, invoke the domain operation, and map its result to Oban's contract.

#### 5. DRY With Nuance

- Avoid needless duplication.
- Tolerate small duplication when abstraction would make the code harder to understand.
- Prefer readability over strict DRY.

#### 6. Refactoring Philosophy

Be pragmatic. Call out concrete technical debt, but allow safe follow-up work when it is genuinely outside the PR's scope. Perfect is the enemy of done; vague or speculative cleanup should not block a PR.

#### 7. Function Arity

- Always flag functions with more than four parameters so their interface is reviewed for refactoring.
- Consider whether the arguments form a cohesive options struct or map, or whether the function is doing more than one job.
- Treat this as a refactoring prompt rather than an automatic blocker when the arity is justified, such as a framework callback with a fixed signature.

### Code Quality Standards

#### 1. Database Changes

**Definitive rules:**

- Remove unrelated migration or database changes from the PR.
- Keep schema changes tied to the PR's purpose.
- Add indexes to existing write-active tables concurrently.
- Match custom index names in the corresponding changeset constraints.

#### 2. No Magic Numbers or Values

Use module attributes or well-named functions for canonical values. For enum-like strings, use the schema's validated constants rather than repeating raw literals.

#### 3. Naming Matters

Names should describe the positive meaning of a value. Avoid inverted boolean names that make `true` and `false` difficult to reason about.

#### 4. Nil and Boolean Handling

Treat `nil`, `false`, empty collections, and empty strings deliberately. Elixir only treats `nil` and `false` as falsy; do not rely on truthiness when the distinction is part of the contract.

#### 5. Security Awareness

Check authorization, tenant isolation, information leakage, unsafe interpolation, and other OWASP patterns. A user-scoped action must apply the scope rather than merely accept it.

### Database and Performance

#### 1. N+1 Queries

**Definitive rule:**

- N+1 queries almost always block the PR.
- This is a strong opinion held loosely when a measured or clearly justified tradeoff exists.

#### 2. Ecto and Raw SQL

**Definitive rules:**

- Prefer Ecto query APIs when practical.
- Do not use Ecto schema structs or runtime data-access APIs from point-in-time migrations.
- Use migration schema primitives or migration-owned SQL for data changes that must remain stable over time.
- Escape user or LLM input before interpolating it into `LIKE` or `ILIKE`.
- Keep indexed columns bare in predicates unless a matching functional index exists.

#### 3. Database Indexes

- Indexes may land with the initial change or later when justified.
- Minimize migrations reasonably.
- When adding an index to an existing write-active table, use concurrent create and drop operations with migration locking disabled.

### API Design

#### 1. REST Conventions

- Prefer REST as the default.
- Allow pragmatic deviations when a forced resource shape would be awkward.
- Return correct HTTP status codes.
- Include useful content in error responses.
- Apply the same authorization and tenant scoping used by the UI.

#### 2. API Versioning

Keep versioning simple. Most APIs do not need a complex versioning strategy.

### Elixir, Phoenix, and LiveView Patterns

#### 1. LiveView as the Default

- Prefer LiveView for interactive server-rendered features.
- Keep LiveViews focused on presentation and orchestration.
- Push domain rules and visibility predicates into contexts.

#### 2. Phoenix Contexts

- Context granularity is flexible and may be broader than one resource.
- Every user-scoped context function takes the project scope first and applies it.
- Keep cross-tenant ownership checks close to the query or mutation they protect.

#### 3. Ecto Patterns

- Keep changeset functions pure; never call `Repo` from a changeset.
- Let the Ecto schema own routine UUID generation through its configured `autogenerate`. Flag context or service code that calls `Uniq.UUID.uuid7()`, `Ecto.UUID.generate()`, or an equivalent solely to populate the new row's own ID before passing it into a changeset. Do not require a PostgreSQL column default when schema autogeneration is configured. Explicit preallocation is acceptable only when a concrete workflow needs the ID before the row is inserted.
- Use scoped queries and explicit ownership filters.
- Preload every association read by a visibility predicate.
- Reuse canonical status groups and validated string constants.

#### 4. Module Attributes

- Remember that module attributes are evaluated at compile time.
- Use a function when a value must be calculated dynamically at runtime.

#### 5. LiveView Rendering and Components

- Keep `render/1` small and readable.
- Extract substantial or mixed-concern markup into focused function components.
- Pass only the assigns a component needs.
- When adding a required attr to a multi-clause component, confirm every clause uses it.
- Preserve every modifier when replacing raw component-library markup with a shared component.

#### 6. PubSub and Session Safety

- Broadcast IDs for persisted-resource invalidation, then reload through a scoped context.
- Broadcast complete payloads for ephemeral or self-contained results.
- Re-derive dependent assigns during refresh, not only at mount.
- Gate initiator-only side effects so passive viewers do not receive flashes, pushed events, or navigation.
- Unsubscribe from an old parameter-dependent topic before subscribing to the new one.

### Development Environment

#### 1. Low-Configuration Development

Minimize external keys and services needed for a new developer. Prefer realistic local fakes and useful defaults that keep development close to zero configuration.

#### 2. Cross-Platform Support

Keep non-Linux environments usable outside the dev container when practical. Follow the project’s documented Windows/WSL support policy.

## Review Tone and Style

### Tone Distribution

- Directive: use “should,” “must,” and “need to” for concrete issues.
- Positive: acknowledge good work without diluting actionable feedback.
- Questioning: ask questions when they help expose a design assumption.
- Suggestive: reserve “could” and “consider” for non-blocking improvements.
- Cautionary: explain specific risks rather than expressing vague concern.

### Review Style Characteristics

1. Balance positive feedback with constructive criticism.
2. Be pragmatic about technical debt and allow safe follow-up work.
3. Call out AI-generated over-engineering, unnecessary mocking, and abstractions without a clear purpose.
4. Prefer a small number of high-confidence findings over a wall of noise.

## Error Handling and Observability

### 1. Error Handling Philosophy

- Fail fast whenever possible.
- For large batch operations, accumulate validation errors and present them together so the user can decide how to proceed.
- Use tagged tuples for expected failures.

### 2. Rescuing Exceptions

- Rescue only at boundaries such as controllers and external-service adapters.
- Rescuing in ordinary domain code is usually a smell.
- Do not use broad rescue clauses to convert unrelated failures into a misleading expected error.

### 3. Web and Tool Boundaries

- Do not bare-match fallible calls in controllers or LiveView handlers.
- Use one `with` or `case` and handle every expected tagged error.
- Include a catch-all `{:error, _}` arm when a context call may return an unexpected tagged error.
- Return a user-safe response rather than allowing a `MatchError` or `CaseClauseError`.

### 4. Logging

- Decide what to log case by case.
- Avoid enough noise that the important events disappear.
- Do not require one structured logging format without a concrete need.

## Documentation and Communication

### 1. Code Comments and Documentation

- Prefer self-documenting code with good names and concise structure.
- Use `@moduledoc` and `@doc` for public contracts.
- Use inline comments only to explain non-obvious intent or a deliberate exception.
- Do not restate the code or narrate edit history.

### 2. Pull Request Descriptions

- Explain why the change exists and its important tradeoffs.
- Include a concise executive summary.
- Use checklists when helpful.
- Include a manual test plan only when automated coverage is not practical.

### 3. Git Commit Messages and History

- Use semantic commits in imperative mood.
- Prefer a linear history.
- Rebase and squash when they improve the story of the change.

## Summary: High-Priority Review Focuses

### Always Check

1. N+1 queries.
2. Cross-tenant authorization and ignored scopes.
3. Unrelated database or migration changes.
4. Schema structs or runtime data-access APIs used by migrations.
5. Repository access inside changesets.
6. Magic values instead of canonical constants.
7. Environment variables read outside configuration.
8. Rescuing exceptions in non-boundary code.
9. Context or service code manually generating a row ID that the Ecto schema's `autogenerate` should own.
10. Functions with more than four parameters, to assess whether their interface should be refactored.

### Strong Preferences

1. TDD in a red-green-refactor loop.
2. Tests at the lowest layer that proves the behavior.
3. Real database data and minimal mocking of owned code.
4. Realistic HTTP fakes for external APIs.
5. Skinny Oban workers.
6. Domain logic in contexts or focused modules.
7. LiveView as the interactive UI default.
8. Self-documenting code over explanatory comments.
9. Linear git history.

### Context-Dependent

1. Duplication when it improves readability.
2. Technical debt that can safely move to follow-up work.
3. Database indexes in the initial change or a later focused change.
4. Pragmatic deviations from REST.

### Tone

- Start positive when deserved.
- Be directive about concrete issues.
- Ask questions that reveal assumptions.
- Give permission to defer genuinely non-blocking work.
- Call out AI over-engineering.
