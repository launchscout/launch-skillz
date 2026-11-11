# General review rule groups

Each level-two heading defines a focused pass. Review all groups, recording those
that do not apply. Priority guides attention; severity depends on actual impact.

## Correctness and contracts
Priority: high

Trace changed behavior and its callers. Check boundary values, null/false/empty
distinctions, ordering, concurrency, state transitions, and backwards compatibility.
Look for unmet acceptance criteria and incorrect assumptions about dependency
contracts. Do not infer correctness solely from a happy-path test.

## Authorization and data safety
Priority: critical

Check server-side authorization, per-resource ownership, tenant scoping, unsafe
input handling, information leakage, secret exposure, and destructive operations.
Scope parameters must actually restrict reads and writes. UI visibility alone is
not access control. Show an attainable failure path for a security finding.

## Testing strategy
Priority: high

Check behavior coverage, regression cases, and useful failure assertions. Prefer
tests at the owning layer, minimal browser coverage for main flows, and realistic
external fakes. Flag brittle implementation coupling and missing meaningful cases
when their impact is concrete; do not demand coverage of every private helper.

## Code organization
Priority: medium

Check domain boundaries, cohesive interfaces, transport/presentation concerns,
configuration access, and unnecessary abstractions. Keep job handlers focused on
adapting the job contract to domain operations. Respect the project's architecture.

## Database and performance
Priority: high

Check repeated queries/N+1 patterns, unbounded work, transaction boundaries,
indexes and query predicates, data integrity, migration compatibility and locking.
Point-in-time migrations should not depend on evolving application behavior.
Account for the actual database and deployment model rather than prescribing a
database-specific index strategy everywhere.

## API and integration behavior
Priority: high

Check request/response contracts, status codes, useful errors, timeouts, retries,
idempotency, pagination, and external-service failure behavior. Ensure retries do
not duplicate side effects. Keep versioning proportionate to real compatibility needs.

## UI and asynchronous state
Priority: high

Check loading/error/empty states, accessible controls, subscriptions and cleanup,
stale derived state, race conditions, and effects intended only for the initiating
user. Reload shared data through the appropriate authorization boundary. Apply
only to UI/event-driven changes.

## Error handling and observability
Priority: medium

Check expected failures at boundaries, misleading blanket exception handling,
partial batch results, and actionable logs. Avoid swallowing failures or logging
sensitive data. Do not require a new logging framework without a demonstrated need.

## Code quality
Priority: medium

Check names and control flow that obscure behavior, inconsistent canonical values,
unnecessarily large interfaces, and comments that contradict the implementation.
Flag these only when they cause a concrete maintenance or correctness problem;
omit formatting and subjective style preferences.
