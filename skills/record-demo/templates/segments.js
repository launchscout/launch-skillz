// <card>: <card title>
// Copy to the project’s ignored per-demo scratch directory as segments.js. Pass each block as evaluate_script's
// `function`, after installing helpers.js on the page. A segment must end at a full
// page load (log-in, regular href, target=_blank, a controller-rendered page).
// Verify whether client-side navigation preserves the document in this app.

// --- segment: <name> (starts on <path>) ---
async () => {
  const D = window.__demo

  // For LiveView, settle: true enables its readiness check. Otherwise wait for
  // the actual app result after actions. Split before full document navigation.

  await D.caption("What the viewer is looking at", { ms: 1200 })
  await D.highlight("[data-role=the-thing]", { ms: 2000 })

  await D.caption("What the user does next", { ms: 800 })
  await D.click("[data-role=the-button]", { settle: false })
  await D.type("#some-form input[name='thing[title]']", "A realistic value", { delay: 40, settle: false })
  await D.click("#some-form button[type=submit]", { settle: false })
  await D.find("[data-role=the-result]")

  await D.caption("The result", { ms: 800 })
  await D.highlight("[data-role=the-result]", { ms: 2500 })
  await D.hideCaption()
  return "ok"
}

// --- segment: <name> (after navigate_page to <path>, then install helpers.js) ---
async () => {
  const D = window.__demo

  // Not a LiveView page: pass { settle: false } to click and type here.
  await D.caption("Where the change shows up next", { ms: 800 })
  await D.highlight(".the-changed-part", { ms: 3000 })
  await D.hideCaption()
  return "ok"
}
