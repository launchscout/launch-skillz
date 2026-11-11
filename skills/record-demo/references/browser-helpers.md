# Browser helpers

`helpers.js` is a function expression to evaluate in the page, not a Node script.
Install after `<body>` exists and again after every full page load. Installation
is idempotent while `window.__demo` remains present. Do not install using an early
init script that runs before the body exists.

The helper adds a caption, animated cursor, click ripple, and highlight box. Its
style hides `#tidewave-toolbar` if present. It makes no application data requests
on its own; its click/type actions invoke the application's own handlers.

| Method on `window.__demo` | Behavior |
| --- | --- |
| `caption(text, { ms })` | Display a caption and wait for its reading time |
| `hideCaption()` | Fade the caption out |
| `highlight(target, { ms, pad })` | Outline an element for the specified time |
| `moveTo(target, { move })` | Scroll into view and glide the cursor to it |
| `click(target, { move, pause, settle })` | Animate and call the element's DOM `click()` |
| `type(target, text, { move, delay, settle })` | Replace input text with input/change events; append in supported CodeMirror editors |
| `find(target, options)` | Wait for a selector; element arguments are returned directly |
| `waitUntil(predicate, { timeout, poll, what })` | Wait for a synchronous page predicate (default timeout 10 seconds) |
| `waitForLiveView(options)` | Wait for the main LiveView to be connected with no loading classes |
| `shadow(host, inner, options)` | Wait for an element inside an open shadow root |
| `sleep(ms)` | Pause for intentional reading/animation time |

Targets can be CSS selectors or elements except for `shadow`, which takes two
selectors. `click` and `type` default `settle` to `true`, which waits specifically
for LiveView. Other pages must pass `{ settle: false }` and then wait for the
expected state. A connected LiveView alone does not prove a particular operation
succeeded; check its visible result too.

Submit forms via the real submit button so framework submit handlers run. Avoid
`form.submit()`. DOM-generated input/click events are not trusted browser events;
file pickers, some controlled inputs, and browser security features need native
browser tools. The typing helper supports input/textarea fields and its existing
CodeMirror integration, not arbitrary contenteditable editors.

When a click unloads the document, end that segment at the click; the evaluation
may be interrupted. Wait for the new document using the browser tool, then
reinstall helpers. Record one tab; opening a new tab can leave the action offscreen.
