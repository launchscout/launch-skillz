() => {
  if (window.__demo) return "already installed"

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const overlay = (id, css) => {
    const el = document.createElement("div")
    el.id = id
    el.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;${css}`
    document.body.appendChild(el)
    return el
  }

  const devTools = document.createElement("style")
  devTools.textContent = "#tidewave-toolbar { display: none !important; }"
  document.head.appendChild(devTools)

  const captionEl = overlay(
    "__demo-caption",
    "left:50%;bottom:32px;transform:translateX(-50%);max-width:80%;padding:12px 20px;" +
      "border-radius:10px;background:rgba(15,23,42,.88);color:#fff;" +
      "font:600 22px/1.35 system-ui,sans-serif;text-align:center;opacity:0;transition:opacity .25s"
  )

  // Resolves after `ms` so segments can `await` a caption as reading time.
  const caption = async (text, { ms = 2500 } = {}) => {
    captionEl.textContent = text
    captionEl.style.opacity = "1"
    await sleep(ms)
  }

  const hideCaption = async ({ ms = 250 } = {}) => {
    captionEl.style.opacity = "0"
    await sleep(ms)
  }

  const waitUntil = async (check, { timeout = 10000, poll = 50, what = "condition" } = {}) => {
    const deadline = Date.now() + timeout
    while (!check()) {
      if (Date.now() > deadline) throw new Error(`Timed out waiting for ${what}`)
      await sleep(poll)
    }
  }

  const liveViewSettled = () => {
    const main = document.querySelector("[data-phx-main]")
    if (!main || !main.classList.contains("phx-connected")) return false
    return ![main, ...main.querySelectorAll("[class*='-loading']")].some((el) =>
      [...el.classList].some((c) => c === "phx-loading" || /^phx-[a-z]+-loading$/.test(c))
    )
  }

  // Call after any click or keystroke that makes a server round trip.
  const waitForLiveView = (opts = {}) => waitUntil(liveViewSettled, { what: "LiveView", ...opts })

  const find = async (target, opts = {}) => {
    if (typeof target !== "string") return target
    await waitUntil(() => document.querySelector(target), { what: target, ...opts })
    return document.querySelector(target)
  }

  const cursorEl = overlay(
    "__demo-cursor",
    "left:-40px;top:-40px;width:24px;height:24px;transition-property:left,top;" +
      "transition-timing-function:ease-in-out"
  )
  cursorEl.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 2l7 19 2.5-7.5L20 11z" ' +
    'fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'

  const center = (el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  const reveal = async (el) => {
    const r = el.getBoundingClientRect()
    // The caption covers the bottom of the viewport.
    if (r.top >= 0 && r.bottom <= window.innerHeight - 120) return
    el.scrollIntoView?.({ behavior: "smooth", block: "center" })
    await sleep(600)
  }

  const moveTo = async (target, { move = 600 } = {}) => {
    const el = await find(target)
    await reveal(el)
    const { x, y } = center(el)
    cursorEl.style.transitionDuration = `${move}ms`
    cursorEl.style.left = `${x - 3}px`
    cursorEl.style.top = `${y - 2}px`
    await sleep(move)
    return el
  }

  const ripple = ({ x, y }) => {
    const el = overlay(
      "",
      `left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;border-radius:50%;` +
        "border:3px solid rgba(59,130,246,.9);transition:transform .5s,opacity .5s"
    )
    el.removeAttribute("id")
    el.className = "__demo-ripple"
    requestAnimationFrame(() => {
      el.style.transform = "scale(1.8)"
      el.style.opacity = "0"
    })
    setTimeout(() => el.remove(), 600)
  }

  // A real `click()` so phx-click, links and form buttons behave as they do for a user.
  const click = async (target, { move, pause = 250, settle = true } = {}) => {
    const el = await moveTo(target, { move })
    ripple(center(el))
    el.click()
    await sleep(pause)
    if (settle) await waitForLiveView()
    return el
  }

  const typeIntoCodeMirror = async (cm, text, delay) => {
    cm.focus()
    cm.setCursor(cm.lineCount(), 0)
    for (const char of text) {
      cm.replaceSelection(char)
      await sleep(delay)
    }
  }

  // Replaces the field's value, firing `input` per character so phx-change sees each keystroke.
  // In a markdown editor (EasyMDE) it appends instead, and the editor syncs its textarea.
  const type = async (target, text, { move, delay = 60, settle = true } = {}) => {
    const el = await moveTo(target, { move })
    const cm = (el.closest(".CodeMirror") || el.querySelector(".CodeMirror"))?.CodeMirror
    if (cm) {
      await typeIntoCodeMirror(cm, text, delay)
      if (settle) await waitForLiveView()
      return el
    }

    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement
    const setValue = Object.getOwnPropertyDescriptor(proto.prototype, "value").set
    el.focus()
    setValue.call(el, "")
    for (const char of text) {
      setValue.call(el, el.value + char)
      el.dispatchEvent(new Event("input", { bubbles: true }))
      await sleep(delay)
    }
    el.dispatchEvent(new Event("change", { bubbles: true }))
    if (settle) await waitForLiveView()
    return el
  }

  const shadow = async (host, inner, opts = {}) => {
    const query = () => document.querySelector(host)?.shadowRoot?.querySelector(inner)
    await waitUntil(query, { what: `${host} >>> ${inner}`, ...opts })
    return query()
  }

  const highlightEl = overlay(
    "__demo-highlight",
    "display:none;border:3px solid #f59e0b;border-radius:8px;box-shadow:0 0 0 6px rgba(245,158,11,.25)"
  )

  const highlight = async (target, { ms = 1500, pad = 6 } = {}) => {
    const el = await find(target)
    await reveal(el)
    const r = el.getBoundingClientRect()
    Object.assign(highlightEl.style, {
      display: "block",
      left: `${r.left - pad}px`,
      top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`,
      height: `${r.height + pad * 2}px`
    })
    await sleep(ms)
    highlightEl.style.display = "none"
    return el
  }

  window.__demo = {
    sleep,
    caption,
    hideCaption,
    waitUntil,
    waitForLiveView,
    find,
    shadow,
    moveTo,
    click,
    type,
    highlight
  }
  return "installed"
}
