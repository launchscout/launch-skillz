---
name: record-demo
description: Record a short captioned demo of a change in a running web app, rehearse and reset the flow, trim dead air, visually inspect the result, and optionally attach it to a Launch Box card. Use for record-demo, record a demo, or make a demo video.
---

# Record a demo

Produce a 20–60 second captioned video that shows the starting state, user action,
and result. Follow **prep → rehearse → reset → record → trim → verify → deliver**.
Do not attach a recording you have not visually inspected.

## Load project settings and capabilities

Read applicable project instructions and `.agents/workflows.md` from the consuming
repository root if present. Discover the app URL, startup procedure, development
login, demo data, reset procedure, scratch directory, and attachment destination.
Project-relative paths resolve from that root; links below resolve from this skill.
Do not assume a framework, localhost port, seeded account, or organization.

Required capabilities:

- Browser navigation, page evaluation, screenshots, and actual video recording.
  Chrome DevTools MCP's `evaluate_script`, `navigate_page`, `screencast_start`,
  and `screencast_stop` are the reference implementation. Inspect available tools
  and their schemas rather than hardcoding an agent-specific MCP prefix.
- `ffmpeg` and `ffprobe` in the environment that can access the recording.
- Image viewing to inspect contact sheets and screenshots.
- Launch Box card/file-upload tools only when a card attachment is requested.

Another browser recorder can be used if it provides these capabilities. If video
recording or image viewing is unavailable, explain what is missing and prepare
the script if useful; do not claim to have recorded or verified a video. A local
video request does not require Launch Box. A request to record a card's demo
includes attaching it to that card unless the user requests local output only.

## 1. Prep

1. Understand the change from the supplied card, PR, or current diff. Resolve the
   actual PR base or configured/default branch; do not assume `main`. Fetch card
   comments and linked PR context when a card is supplied. Select the user role
   and page that demonstrate the change.
2. Confirm the app is running with disposable development data. Use the configured
   startup/service and approved seed/migration procedure. Confirm the URL is
   reachable from the browser's environment; its localhost may differ from the
   shell's. Do not disable authentication controls or reset an entire database
   as a generic troubleshooting step.
3. Create a task-specific scratch directory in the workspace, using the configured
   location or an ignored directory such as `tmp/demos/<task>/`. Verify it is ignored
   before placing recordings there; add a local exclude entry if appropriate.
   Avoid collisions with existing runs. Do not commit demo-only data or artifacts.
4. Copy [templates/segments.js](templates/segments.js) into the scratch directory.
   Prepare a reset procedure using [templates/reset.md](templates/reset.md) and
   the project's supported application APIs. Restore only demo-owned changes;
   preserve unrelated data and use the appropriate actor/authorization scope.
5. Plan 3–6 captioned beats with stable selectors: IDs, roles, test IDs, and form
   names. Avoid CSS framework utility classes. Keep credentials out of scripts,
   captions, screenshots, and recordings.

End a segment at every full document navigation: login, ordinary links, form
redirects, and controller-rendered pages. An in-page evaluation does not survive
a document unload. SPA/LiveView navigation may keep the document, but verify it.
Keep the demo in the recorded tab; navigate there instead of opening another tab.

## 2. Log in and install helpers

Log in before recording using the project's development account procedure. Do not
copy a sample account from another application. An isolated browser session can
lose authentication when its server restarts.

Read [references/browser-helpers.md](references/browser-helpers.md). After the
page body exists, pass the complete [helpers.js](helpers.js) function to the page
evaluation tool. It returns `installed` or `already installed`. Reinstall after
each full page load. It hides the Tidewave toolbar when present; hide other
configured development overlays as needed.

The helper's `click` and `type` default to waiting for LiveView. On any other app,
pass `settle: false` and wait for the actual expected result with `find` or
`waitUntil`. Do not replace readiness checks with arbitrary long sleeps.

## 3. Rehearse

Execute every segment without recording, reinstalling helpers after document
loads. Fix selectors and timing until each segment reaches its expected result.
Use screenshots to check caption placement, UI readiness, and the visible outcome.
If a helper-generated action does not work with the app's input framework, use
the browser's native input/click capability and keep captions around that action.

## 4. Reset

Restore the demo's starting state with the prepared reset procedure. Re-establish
login if needed, navigate to the opening page, and install the helpers. Verify the
initial state before recording; do not demonstrate a pre-completed flow.

## 5. Record

For Chrome DevTools MCP, use an isolated headless browser at about 1280×800 with
screencasting enabled. Consult the installed server's options; the original setup
used `--headless --isolated --viewport 1280x800 --experimentalScreencast` and
`--no-usage-statistics`. Do not silently reconfigure or restart a shared session.

1. Start recording to an absolute workspace path ending in `raw.webm`. Prefer
   WebM for this backend: the original workflow encountered crashes/empty output
   with MP4. Other backends may produce a different supported input format.
2. Execute the rehearsed segments, navigating and reinstalling helpers between
   document loads. Do not record login or unrelated browser activity.
3. Stop recording even if a segment fails. Wait for encoding to complete (nonzero,
   stable file size and a readable stream). Use bounded waits and report an encoder
   that does not finish, rather than waiting forever or uploading partial output.

## 6. Trim and inspect

Use [references/video-processing.md](references/video-processing.md) to detect
frozen seams, generate contact sheets spanning the entire recording, and remove
dead air. Preserve caption reading time and genuine waiting states needed to
understand the feature. Export the final video as `demo.webm`.

Inspect contact sheets across the full final duration, plus individual frames
where a sheet leaves doubt. Check every beat: no unready pages or toolbar flashes,
no missing actions, readable captions, correct outcome, and no exposed credentials
or unrelated private data. Verify duration and playable, nonempty output. If the
result fails inspection, fix the script/trim and inspect the new output again.

## 7. Deliver

For local output, return the video path and duration. For a card demo, confirm the
destination card and use available Launch Box tools with their actual schemas:

1. Request a card attachment upload URL for `<task>-demo.webm`, `video/webm`.
2. PUT the file bytes to the returned signed URL with the required content type.
   Verify the HTTP success result before creating an attachment. Treat the URL
   as an opaque credential; do not put it in a committed script or report.
3. Attach the uploaded storage key to that same card using the exact filename,
   content type, and byte size. For portable byte counting, Python's
   `Path(video_path).stat().st_size` avoids GNU/BSD `stat` flag differences.
4. Verify the attachment exists. After an ambiguous upload/attach response, inspect
   state before retrying so the card does not receive duplicate attachments.

If upload tools are missing or fail, retain the verified local video and report
that attachment remains incomplete. Report the artifact/attachment and duration,
and leave the scripts and reset procedure in the ignored scratch directory for
re-recording. Do not claim an upload succeeded until attachment is confirmed.
