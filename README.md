# Launch Skillz

Reusable development workflows packaged as standard
[Agent Skills](https://agentskills.io/specification). Each directory under
`skills/` is independently installable and includes its own supporting files.

| Skill | Workflow | Required capabilities |
| --- | --- | --- |
| `dothework` | Take a Launch Box card through implementation, tests, a GitHub PR, and review handoff | Repository shell, Git, GitHub access, Launch Box tools |
| `review-card` | Review a card's PR or a direct GitHub PR, consolidate findings, and publish comments | Repository shell, Git, GitHub access; Launch Box for card input |
| `record-demo` | Rehearse, record, trim, inspect, and optionally attach a captioned demo | Browser automation with recording and image inspection, ffmpeg/ffprobe; Launch Box for card attachment |

## Install when ready

From a consuming project, with this repository checked out beside it:

```sh
npx skills add ../launch-skillz --skill dothework review-card record-demo --agent codex claude-code
```

The [Skills CLI](https://github.com/vercel-labs/skills) supports project installs
by default, `--global` for personal installs across projects, and `--agent '*'`
for all supported agents. Omit `--agent` to choose interactively. Installation
does not configure MCP connections, credentials, browser tooling, or ffmpeg.

Once this directory is published as a Git repository, replace the local path
with its Git URL or `owner/repository`. A release can be pinned with
`owner/repository@v1.0.0`. No registry publishing or npm package is needed.
Use `npx skills check` and `npx skills update` to manage updates.

Agents without a supported installer can load an individual `SKILL.md` and its
adjacent resources directly. Automatic discovery and invocation syntax depend
on the host agent; tool capability is still required to execute the workflow.

## Configure a project

Copy [examples/workflows.md](examples/workflows.md) to `.agents/workflows.md`
in the consuming repository and fill in the relevant sections. This is a
Launch Skillz convention, explicitly loaded by these skills, not a built-in
agent configuration format. It is Markdown for the agent to read, not an
executable configuration file.

- Project paths resolve from the consuming repository root.
- Bundled references, templates, and helpers resolve from the installed skill
  directory, regardless of the shell's current directory.
- Explicit user instructions and the host's instruction hierarchy govern the
  task. The project configuration supplies workflow defaults.
- Missing settings should be discovered from repository documentation, scripts,
  and the selected card/PR. Ask only for ambiguities that affect the next action;
  never invent a board, organization, account, or command.
- A value of `none` disables an optional action, such as a board transition.

The skills use tool capabilities rather than hardcoded MCP namespace names or
agent-specific question tools. Review passes work sequentially when delegation
is unavailable. Browser instructions retain a concrete Chrome DevTools recipe;
another recorder may be used when it supplies the same capabilities.

## Review profiles

`review-card` includes general review preferences and rule groups. Projects can
override either with their own files. Setting **Review profile: elixir-phoenix**
selects the bundled Elixir/Phoenix/Ecto/Oban preferences and nine
rule groups. These are opinionated defaults, not universal framework rules;
project instructions and documented exceptions take precedence.

The name `review-card` is retained so it can coexist with an existing
`code-review` skill. It also accepts a PR URL without a Launch Box card.

## Maintaining the package

Keep app startup, tests, credentials, board identity, seeded data, and reset
implementation in the consuming project. Keep reusable procedures and resources
inside each skill so installing just one skill does not break its references.
Do not add absolute workstation paths or links to sibling skills as mandatory
dependencies. Examples may contain fields for the consuming project to fill in;
the installed skill entrypoints must be usable without editing them.

The demo helpers include optional LiveView waiting and
CodeMirror support. Non-LiveView callers must pass `settle: false` and wait for
their own visible result. See the recorder's helper reference for limitations.

This package contains instructions and helper assets. Creating it does not
install or invoke the workflows, publish a repository, or connect services.
