
async function fetchBots() {
  const res = await fetch("/api/bots");
  return await res.json();
}

async function createBot(bot) {
  const res = await fetch("/api/bots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bot)
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    alert("Failed to create bot: " + (err.error || res.status));
    throw new Error("create failed");
  }
  return await res.json();
}

async function deleteBot(publicId) {
  await fetch(`/api/bots/${publicId}`, { method: "DELETE" });
  await render();
}

function embedSnippet(origin, publicId) {
  return `<script src="${origin}/embed/${publicId}.js" async></script>`;
}

function copy(text) {
  navigator.clipboard.writeText(text);
  alert("Copied!");
}

async function render() {
  const list = document.getElementById("bots");
  list.innerHTML = "<p>Loading...</p>";
  const bots = await fetchBots();
  const origin = window.location.origin;
  list.innerHTML = "";
  if (!bots.length) {
    list.innerHTML = "<p>No bots yet. Create one above.</p>";
    return;
  }
  bots.forEach(b => {
    const wrap = document.createElement("div");
    wrap.className = "bot";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div><strong>${b.name}</strong> — <span class="small">${b.client_name || "No client"}</span></div>
      <div class="small">Public ID: ${b.public_id} • Domain: ${b.domain || "any"} • Created: ${new Date(b.created_at).toLocaleString()}</div>
      <div class="small">Button ${b.position} • Color ${b.color} • Greeting "${b.greeting}"</div>
      <div class="small">Bot URL: ${b.bot_url}</div>
      <hr/>
      <label>Embed code:</label>
      <textarea readonly>${embedSnippet(origin, b.public_id)}</textarea>
      <div class="small"><a href="${origin}/preview/${b.public_id}" target="_blank">Preview</a></div>
    `;
    const actions = document.createElement("div");
    actions.className = "actions";
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy Embed";
    copyBtn.onclick = () => copy(embedSnippet(origin, b.public_id));
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "#ef4444";
    delBtn.onclick = () => deleteBot(b.public_id);
    actions.appendChild(copyBtn);
    actions.appendChild(delBtn);
    wrap.appendChild(meta);
    wrap.appendChild(actions);
    list.appendChild(wrap);
  });
}

document.getElementById("createBtn").addEventListener("click", async () => {
  const payload = {
    name: document.getElementById("name").value.trim(),
    client_name: document.getElementById("client_name").value.trim(),
    domain: document.getElementById("domain").value.trim(),
    bot_url: document.getElementById("bot_url").value.trim(),
    color: document.getElementById("color").value,
    position: document.getElementById("position").value,
    greeting: document.getElementById("greeting").value.trim()
  };
  if (!payload.name || !payload.bot_url) {
    alert("Please fill Bot Name and Bot URL.");
    return;
  }
  await createBot(payload);
  ["name","client_name","domain","bot_url","greeting"].forEach(id => document.getElementById(id).value = "");
  await render();
});

render();
