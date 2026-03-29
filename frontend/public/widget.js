(function () {
  // ─── Configuration ───────────────────────────────────────
  const script  = document.currentScript
  const BOT_KEY = script.getAttribute("data-bot")
  const API_URL = "http://localhost:8000/api"

  if (!BOT_KEY) {
    console.error("[ChatFlow] Attribut data-bot manquant.")
    return
  }

  // ─── Variables d'état ────────────────────────────────────
  let convId    = null
  let isOpen    = false
  let isLoading = false
  let botConfig = null

  // ─── Styles ──────────────────────────────────────────────
  const style = document.createElement("style")
  style.textContent = `
    #cf-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #cf-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; z-index: 99999;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #cf-btn:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,0.22); }
    #cf-window {
      position: fixed; bottom: 92px; right: 24px;
      width: 360px; height: 520px;
      background: #fff; border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex; flex-direction: column;
      z-index: 99998; overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    #cf-window.cf-hidden { opacity: 0; transform: translateY(16px) scale(0.97); pointer-events: none; }
    #cf-header {
      padding: 14px 16px;
      display: flex; align-items: center; gap: 10px;
      color: #fff;
    }
    #cf-header-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    #cf-header-info { flex: 1; }
    #cf-header-name { font-weight: 700; font-size: 15px; }
    #cf-header-sub  { font-size: 11px; opacity: 0.8; margin-top: 1px; }
    #cf-header-dot  { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
    #cf-close {
      background: rgba(255,255,255,0.2); border: none;
      color: #fff; width: 28px; height: 28px; border-radius: 50%;
      cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    #cf-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f8f9fb;
    }
    #cf-messages::-webkit-scrollbar { width: 4px; }
    #cf-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    .cf-msg { display: flex; }
    .cf-msg.cf-user { justify-content: flex-end; }
    .cf-bubble {
      max-width: 78%; padding: 10px 14px;
      border-radius: 18px; font-size: 14px;
      line-height: 1.5; word-break: break-word;
    }
    .cf-msg.cf-bot  .cf-bubble { background: #fff; color: #1a1a1a; border-radius: 18px 18px 18px 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
    .cf-msg.cf-user .cf-bubble { color: #fff; border-radius: 18px 18px 4px 18px; }
    .cf-feedback { display: flex; gap: 6px; margin-top: 4px; }
    .cf-fb-btn {
      background: none; border: 1px solid #e5e7eb;
      border-radius: 20px; padding: 2px 8px;
      font-size: 12px; cursor: pointer;
      transition: background 0.15s;
    }
    .cf-fb-btn:hover { background: #f3f4f6; }
    .cf-fb-btn.active { background: #f3f4f6; }
    .cf-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
    .cf-dot { width: 7px; height: 7px; border-radius: 50%; background: #9ca3af; animation: cf-bounce 1.2s infinite; }
    .cf-dot:nth-child(2) { animation-delay: 0.2s; }
    .cf-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cf-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-6px); }
    }
    #cf-footer {
      padding: 10px 12px;
      border-top: 1px solid #f1f1f1;
      display: flex; gap: 8px; align-items: center;
      background: #fff;
    }
    #cf-input {
      flex: 1; border: 1.5px solid #e5e7eb;
      border-radius: 24px; padding: 9px 16px;
      font-size: 14px; outline: none;
      transition: border 0.15s;
      background: #f8f9fb;
    }
    #cf-input:focus { border-color: #8b5cf6; background: #fff; }
    #cf-send {
      width: 38px; height: 38px; border-radius: 50%;
      border: none; cursor: pointer; color: #fff;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.15s, transform 0.15s;
    }
    #cf-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #cf-send:not(:disabled):hover { transform: scale(1.08); }
    #cf-powered {
      text-align: center; padding: 4px;
      font-size: 10px; color: #bbb;
      background: #fff;
    }
    #cf-powered a { color: #8b5cf6; text-decoration: none; }
    @media (max-width: 420px) {
      #cf-window { width: calc(100vw - 16px); right: 8px; bottom: 80px; }
    }
  `
  document.head.appendChild(style)

  // ─── DOM ─────────────────────────────────────────────────
  const widget = document.createElement("div")
  widget.id    = "cf-widget"

  widget.innerHTML = `
    <!-- Bouton flottant -->
    <button id="cf-btn">💬</button>

    <!-- Fenêtre chat -->
    <div id="cf-window" class="cf-hidden">

      <!-- Header -->
      <div id="cf-header">
        <div id="cf-header-avatar">🤖</div>
        <div id="cf-header-info">
          <div id="cf-header-name">Assistant</div>
          <div id="cf-header-sub">En ligne</div>
        </div>
        <div id="cf-header-dot"></div>
        <button id="cf-close">✕</button>
      </div>

      <!-- Messages -->
      <div id="cf-messages"></div>

      <!-- Footer -->
      <div id="cf-footer">
        <input id="cf-input" type="text" placeholder="Écrivez un message..." />
        <button id="cf-send" disabled>➤</button>
      </div>

      <!-- Powered by -->
      <div id="cf-powered">
        Propulsé par <a href="https://chatflow.ai" target="_blank">ChatFlow</a>
      </div>
    </div>
  `
  document.body.appendChild(widget)

  // ─── Refs ─────────────────────────────────────────────────
  const btn      = document.getElementById("cf-btn")
  const win      = document.getElementById("cf-window")
  const closeBtn = document.getElementById("cf-close")
  const messages = document.getElementById("cf-messages")
  const input    = document.getElementById("cf-input")
  const send     = document.getElementById("cf-send")
  const header   = document.getElementById("cf-header")
  const avatar   = document.getElementById("cf-header-avatar")
  const name_    = document.getElementById("cf-header-name")
  const sub_     = document.getElementById("cf-header-sub")

  // ─── Charger config du bot ────────────────────────────────
  fetch(`${API_URL}/bots/public/${BOT_KEY}/`)
    .then((r) => r.json())
    .then((config) => {
      botConfig = config
      btn.style.backgroundColor   = config.color
      header.style.backgroundColor = config.color
      send.style.backgroundColor   = config.color
      name_.textContent            = config.name
      sub_.textContent             = config.model === "claude" ? "Claude AI" : "GPT-4o"
    })
    .catch(() => {
      btn.style.backgroundColor    = "#6366f1"
      header.style.backgroundColor = "#6366f1"
      send.style.backgroundColor   = "#6366f1"
    })

  // ─── Helpers ──────────────────────────────────────────────
  function addMessage(role, content, msgId) {
    const div    = document.createElement("div")
    div.className = `cf-msg cf-${role}`

    const bubble = document.createElement("div")
    bubble.className = "cf-bubble"
    bubble.textContent = content

    if (role === "user" && botConfig) {
      bubble.style.backgroundColor = botConfig.color
    }

    const wrapper = document.createElement("div")
    wrapper.style.display        = "flex"
    wrapper.style.flexDirection  = "column"
    wrapper.style.alignItems     = role === "user" ? "flex-end" : "flex-start"
    wrapper.style.gap            = "4px"
    wrapper.appendChild(bubble)

    // ✅ Feedback sur les messages IA
    if (role === "assistant" && msgId) {
      const fb = document.createElement("div")
      fb.className = "cf-feedback"

      const like    = document.createElement("button")
      like.className = "cf-fb-btn"
      like.textContent = "👍"
      like.onclick = () => sendFeedback(msgId, "like", like, dislike)

      const dislike    = document.createElement("button")
      dislike.className = "cf-fb-btn"
      dislike.textContent = "👎"
      dislike.onclick = () => sendFeedback(msgId, "dislike", dislike, like)

      fb.appendChild(like)
      fb.appendChild(dislike)
      wrapper.appendChild(fb)
    }

    div.appendChild(wrapper)
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
  }

  function addTyping() {
    const div    = document.createElement("div")
    div.className = "cf-msg cf-bot"
    div.id        = "cf-typing"

    const bubble = document.createElement("div")
    bubble.className = "cf-bubble cf-typing"
    bubble.innerHTML = `
      <div class="cf-dot"></div>
      <div class="cf-dot"></div>
      <div class="cf-dot"></div>
    `
    div.appendChild(bubble)
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
  }

  function removeTyping() {
    const t = document.getElementById("cf-typing")
    if (t) t.remove()
  }

  function addWelcome() {
    const name = botConfig?.name || "Assistant"
    addMessage("bot", `Bonjour ! Je suis ${name}. Comment puis-je vous aider ? 👋`)
  }

  async function sendFeedback(msgId, feedback, activeBtn, otherBtn) {
    try {
      await fetch(`${API_URL}/conversations/feedback/${msgId}/`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ feedback }),
      })
      activeBtn.classList.add("active")
      otherBtn.classList.remove("active")
    } catch (e) {
      console.error("[ChatFlow] Feedback error:", e)
    }
  }

  // ─── Démarrer conversation ────────────────────────────────
  async function startConversation() {
    try {
      const res  = await fetch(`${API_URL}/conversations/start/${BOT_KEY}/`, { method: "POST" })
      const data = await res.json()
      convId     = data.id
      send.disabled = false
      addWelcome()
    } catch (e) {
      console.error("[ChatFlow] Start error:", e)
    }
  }

  // ─── Envoyer message ──────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim()
    if (!text || !convId || isLoading) return

    input.value   = ""
    isLoading     = true
    send.disabled = true

    addMessage("user", text)
    addTyping()

    try {
      const res  = await fetch(`${API_URL}/conversations/chat/${convId}/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text }),
      })
      const data = await res.json()
      removeTyping()
      addMessage("assistant", data.content, data.id)
    } catch (e) {
      removeTyping()
      addMessage("bot", "Désolé, une erreur est survenue. Réessayez.")
      console.error("[ChatFlow] Chat error:", e)
    } finally {
      isLoading     = false
      send.disabled = false
      input.focus()
    }
  }

  // ─── Toggle ───────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen
    win.classList.toggle("cf-hidden", !isOpen)
    btn.textContent = isOpen ? "✕" : "💬"

    if (isOpen && !convId) {
      startConversation()
    }
    if (isOpen) input.focus()
  }

  // ─── Events ───────────────────────────────────────────────
  btn.addEventListener("click", toggleChat)
  closeBtn.addEventListener("click", toggleChat)

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  input.addEventListener("input", () => {
    send.disabled = !input.value.trim() || isLoading
  })

  send.addEventListener("click", sendMessage)

})()