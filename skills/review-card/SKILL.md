---
name: review-card
description: Review the GitHub PR linked to a Launch Box card, or a supplied PR URL, using focused rule-group passes and a conservative judging pass. Publish concrete findings inline with a summary fallback. Use for review-card or a requested structured card/PR review.
---

# Review a card's PR

Review the change in a real checkout, consolidate high-confidence findings, and
post them to the PR. Honor a user request for a local-only review: in that mode,
return findings without PR comments, tags, or board transitions.

## Load context and resolve the PR

1. Identify the consuming project root. Read applicable project instructions and
   `.agents/workflows.md` if present. Resolve project-relative references before
   changing directories. Bundled paths below are relative to this skill.
2. Load configured review preferences and rule groups. An explicit project file
   overrides the corresponding profile file; a missing explicitly configured file
   is a configuration error, not permission to silently use different rules.
   Without overrides, use [preferences](references/review-preferences.md) and
   [rule groups](references/rule-groups.md). If the project selects the
   `elixir-phoenix` profile, use [Elixir preferences](references/elixir-phoenix/preferences.md)
   and [Elixir rule groups](references/elixir-phoenix/rule-groups.md) instead.
3. Accept a direct GitHub PR URL, or resolve the supplied card through available
   Launch Box tools. Read its description, plan, comments, suggested branch,
   repository links, and board placement. If multiple PRs are linked, select the
   one matching the requested repository/task; do not blindly take the first.
4. A missing `github_links` field is not proof that the card has no PR. Use the
   checkout's remote to identify the repository, then search its PRs (including
   closed PRs) for an exact suggested-branch match, followed by the card code in
   the title. Verify branch/title/card scope. Paginate as needed; a fixed first
   page is not an exhaustive search. Do not infer a repository from a card prefix.
5. If publishing a card review, apply the configured review-start tag if enabled.
   Do not mutate boards or tags when reviewing a direct PR without a card.

Use equivalent GitHub tools or `gh`; tools need not have a particular MCP prefix.
If access is missing, report it and retain any useful local findings. Do not claim
the PR or card was inspected when it was not available.

## Prepare an isolated checkout

Create a temporary clone/worktree owned by this review. Fetch the actual PR head
and base (including fork PRs); `gh pr checkout NUMBER --repo OWNER/REPO` in a
temporary clone is one option. Capture the head SHA and base ref, verify the
checkout HEAD matches, and review the merge-base diff. Do not switch or reset
the user's working branch. Load applicable instructions from the review checkout.

For a small diff, provide it inline to review passes. For a large diff (roughly
100 KB or more), supply a changed-file list and have passes read per-file diffs
with context. Avoid repeatedly loading the entire diff.

## Run focused passes

Cover every configured rule group, one pass per group. There is no fixed number
of groups. Record a reason for groups that do not apply to the stack/change.

Use delegated passes when supported and permitted, sequential local passes
otherwise, or a mixture. Inherit the environment's model; do not require a named
provider, model selector, or a particular concurrency limit. The main agent judges
all findings regardless of execution mode.

Each pass receives the full rule group, relevant preferences, checkout path,
reviewed SHA and base, and diff or per-file diff instructions. Include this boundary
verbatim in delegated prompts and apply it during local passes:

> Review passes are read-only. Inspect local files, searches, diffs, logs, and
> documentation only. Do not modify files, run tests or installs, commit, push,
> migrate, or use network tools. Return findings; do not post comments or change
> cards. Review only your assigned rule group.

Record each pass's result before moving to another group:

```json
{"findings": [{"file": "path/in/repo", "line": 42, "severity": "high", "issue": "Concrete defect and triggering condition", "suggestion": "Specific fix"}]}
```

Use `critical`, `high`, `medium`, or `low` severity and paths relative to the repo.
Choose a relevant added diff line when possible. If no added line can represent
a real omission or deletion-related defect, retain the finding with `line: null`
for the summary. Do not invent a line or drop a valid finding merely to make it
fit an inline comment. Empty findings are `{"findings": []}`.

## Judge the results

Verify each candidate against the actual checkout. Remove duplicates, false
positives, speculative concerns, style nitpicks, and out-of-scope preferences.
Retain concrete regressions with a clear trigger, impact, and actionable fix.
Lower-severity findings survive only when demonstrably useful. A rule group's
priority guides attention; it does not automatically determine issue severity.
Project conventions and documented exceptions take precedence over profile
preferences. Do not claim TDD was absent merely because squashed history hides it.

## Publish and finish

1. Before publishing, recheck the PR head. If it changed, inspect the update and
   refresh affected review passes and anchors. Do not post stale findings or
   mark an unreviewed head clean. If the PR keeps changing, report the reviewed
   SHA and defer publication rather than chasing it indefinitely.
2. With no findings and all applicable passes complete, post one concise clean
   review comment. Do not claim tests passed: this review is read-only. With
   findings, post each inline against the reviewed commit where a valid anchor
   exists, and post one summary listing the findings.
3. Include the full issue and suggestion for any finding that cannot be attached
   inline. GitHub rejecting an anchor must not lose the finding. Use structured
   arguments or a body file for comment text, not shell-interpolated prose.
4. After a timeout or ambiguous response, inspect existing comments before
   retrying so the review is not duplicated. Report partial posting failures;
   do not mark review complete while findings remain unpublished.
5. Remove only the temporary checkout created for this review, including on error.
   Do not remove the user's checkout or a pre-existing directory.
6. For a successfully published card review, apply the configured completion tag.
   Only with zero findings, move to the configured clean-review column if enabled.
   Resolve destinations from project config/card state, not a hardcoded board.
7. Report the reviewed PR/SHA, coverage, number of retained findings, posting
   status, and any limitation. In local-only mode, return the consolidated findings.

Do not terminate or release a hosted development environment unless its lifecycle
instructions explicitly require it and all work and reporting are complete.
