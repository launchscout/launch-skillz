# Project workflows

Copy this file to `.agents/workflows.md` in a consuming project. Replace the
bracketed fields, remove examples that do not apply, and use `none` to disable
optional actions. Do not put passwords, tokens, or signed URLs in this file.
These settings are read by Launch Skillz skills; there is no config parser.

## Project

- Project instructions: [paths to existing instructions and relevant docs]
- Base branch: [branch, or discover the remote default branch]
- Dependency setup: [command; for example `mix deps.get` or `npm ci`]
- Focused tests: [command pattern for a test file or individual test]
- Full tests: [command]
- Full-test cadence: [for example after each completed TDD cycle]
- Final delivery gate: [command(s), or full tests if no separate gate exists]
- Gate success evidence: [exit status and any required success marker]
- Commit conventions: [existing convention; include the card code]

## Launch Box

- Organization: [exact name or ID; or resolve from the supplied card]
- Board: [exact name or ID; or use the card's existing board]
- In-progress column: [exact name or ID, or none]
- Delivery column: [exact name or ID, or none]
- Delivery automation: [what moving to that column triggers, or none]
- Review-start tag: [exact name, or none]
- Review-complete tag: [exact name, or none]
- Clean-review column: [destination only when there are zero findings, or none]

Do not create board columns or change an unrelated organization's state to make
these settings fit. Resolve identities before mutation.

## Review

- Review profile: general
- Review preferences: [optional project-relative file, or use profile defaults]
- Review rule groups: [optional project-relative file, or use profile defaults]

The optional `elixir-phoenix` profile retains the original review approach for
Elixir, Phoenix, LiveView, Ecto, and Oban projects. Each level-two heading in a
rule-groups file identifies one focused review pass. There is no fixed required
number of groups. State local exceptions in the preferences or project docs.

## Demos

- App URL: [URL reachable from the browser's environment]
- Startup: [command or existing service; do not start a duplicate server]
- Seed/migration procedure: [approved local development setup, or none]
- Login: [login route and where to obtain a development account; or public app]
- Browser: [recording-capable connection and any local setup instructions]
- Scratch directory: [ignored path inside the workspace; e.g. `tmp/demos`]
- Reset procedure: [project script/command that restores only demo-owned data,
  or describe how to write one through supported application APIs]
- UI readiness: [LiveView, or the visible condition to wait for after actions]
- Hide during recording: [development-only toolbar selectors, or none]
- Attachment destination: [supplied Launch Box card, or local artifact only]

Use disposable development data. Document any dev-only authentication bypass
explicitly; the generic recorder must not disable a security control on its own.
