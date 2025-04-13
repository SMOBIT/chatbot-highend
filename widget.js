window.addEventListener("load", async () => {
  const client = window.CLIENT;
  if (!client) {
    console.error("❌ Kein 'CLIENT' definiert. Bitte vorher window.CLIENT = 'xyz' setzen.");
    return;
  }

  const configUrl = `https://smobit.github.io/chatbot-highend/config/${client}.json`;
  const styleUrl = `https://smobit.github.io/chatbot-highend/styles/${client}.css`;

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = styleUrl;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "chat-widget";
  container.innerHTML = `
    <button id="chat-button">💬</button>
    <div id="chat-box" style="display:none">
      <div id="chat-header">🤖 <span id="chat-title">Chat</span> <span id="chat-close">✖</span></div>
      <div id="chat-body"><div class="chat-msg bot">Lade...</div></div>
      <div id="chat-footer">
        <input type="text" id="chat-input" placeholder="Nachricht eingeben..." />
        <button id="chat-send">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  const cfg = await fetch(configUrl).then(r => r.json());
  document.getElementById("chat-title").textContent = cfg.title || "Chat";
  const chatBody = document.getElementById("chat-body");
  chatBody.innerHTML = '<div class="chat-msg bot">' + cfg.intro + '</div>' + 
    cfg.quickReplies.map(q => `<div class="chat-quick" data-msg="${q}">${q}</div>`).join('');

  const send = async (text) => {
    const userMsg = document.createElement("div");
    userMsg.className = "chat-msg user";
    userMsg.textContent = text;
    chatBody.appendChild(userMsg);

    const res = await fetch(cfg.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "chat_" + client,
        chatInput: text
      })
    }).then(r => r.json());

    const botMsg = document.createElement("div");
    botMsg.className = "chat-msg bot";
    botMsg.textContent = res.output || "🤖 Keine Antwort.";
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  document.getElementById("chat-button").onclick = () => {
    document.getElementById("chat-box").style.display = "block";
    document.getElementById("chat-button").style.display = "none";
  };
  document.getElementById("chat-close").onclick = () => {
    document.getElementById("chat-box").style.display = "none";
    document.getElementById("chat-button").style.display = "block";
  };
  document.getElementById("chat-send").onclick = () => {
    const input = document.getElementById("chat-input");
    const msg = input.value.trim();
    if (msg) {
      send(msg);
      input.value = "";
    }
  };
  document.getElementById("chat-box").addEventListener("click", e => {
    if (e.target.classList.contains("chat-quick")) {
      send(e.target.dataset.msg);
    }
  });
});