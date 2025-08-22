
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { customAlphabet } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "db.sqlite");
const db = new Database(dbPath);
const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS bots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT,
    domain TEXT,
    bot_url TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#0066ff',
    position TEXT NOT NULL DEFAULT 'right',
    greeting TEXT NOT NULL DEFAULT 'Hi 👋 How can I help you?',
    created_at TEXT NOT NULL
  );
`);

// Helpers
const getBotByPublicId = db.prepare("SELECT * FROM bots WHERE public_id = ?");
const listBots = db.prepare("SELECT * FROM bots ORDER BY datetime(created_at) DESC");
const insertBot = db.prepare(`
  INSERT INTO bots (public_id, name, client_name, domain, bot_url, color, position, greeting, created_at)
  VALUES (@public_id, @name, @client_name, @domain, @bot_url, @color, @position, @greeting, @created_at);
`);
const deleteBotStmt = db.prepare("DELETE FROM bots WHERE public_id = ?");
const updateBotStmt = db.prepare(`
  UPDATE bots SET name=@name, client_name=@client_name, domain=@domain, bot_url=@bot_url, color=@color, position=@position, greeting=@greeting
  WHERE public_id=@public_id
`);

// API routes
app.get("/api/bots", (req, res) => {
  const rows = listBots.all();
  res.json(rows);
});

app.post("/api/bots", (req, res) => {
  try {
    const { name, client_name, domain, bot_url, color, position, greeting } = req.body || {};
    if (!name || !bot_url) {
      return res.status(400).json({ error: "name and bot_url are required" });
    }
    const bot = {
      public_id: nanoid(),
      name,
      client_name: client_name || null,
      domain: domain || null,
      bot_url,
      color: color || "#0066ff",
      position: position === "left" ? "left" : "right",
      greeting: greeting || "Hi 👋 How can I help you?",
      created_at: new Date().toISOString()
    };
    insertBot.run(bot);
    res.status(201).json(bot);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create bot" });
  }
});

app.put("/api/bots/:publicId", (req, res) => {
  try {
    const { publicId } = req.params;
    const existing = getBotByPublicId.get(publicId);
    if (!existing) return res.status(404).json({ error: "bot not found" });
    const { name, client_name, domain, bot_url, color, position, greeting } = req.body || {};
    const updated = {
      public_id: publicId,
      name: name ?? existing.name,
      client_name: client_name ?? existing.client_name,
      domain: domain ?? existing.domain,
      bot_url: bot_url ?? existing.bot_url,
      color: color ?? existing.color,
      position: position ?? existing.position,
      greeting: greeting ?? existing.greeting
    };
    updateBotStmt.run(updated);
    res.json({ ...existing, ...updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update bot" });
  }
});

app.delete("/api/bots/:publicId", (req, res) => {
  const { publicId } = req.params;
  deleteBotStmt.run(publicId);
  res.json({ ok: true });
});

// Serve dynamic embed JS that inlines the config
app.get("/embed/:publicId.js", (req, res) => {
  const { publicId } = req.params;
  const bot = getBotByPublicId.get(publicId);
  if (!bot) {
    res.setHeader("Content-Type", "application/javascript");
    return res.status(404).send(`console.error("Chatbot embed: bot not found");`);
  }
  res.setHeader("Content-Type", "application/javascript");
  const widgetUrl = `${req.protocol}://${req.get("host")}/widget.js`;
  const code = `
    (function(){
      function loadWidget(cb){
        var s = document.createElement("script");
        s.src = "${widgetUrl}";
        s.async = true;
        s.onload = cb;
        document.head.appendChild(s);
      }
      function init(){
        if (!window.initChatbot) return setTimeout(init, 50);
        window.initChatbot({
          botId: ${JSON.stringify(bot.bot_url)},
          color: ${JSON.stringify(bot.color)},
          position: ${JSON.stringify(bot.position)},
          greeting: ${JSON.stringify(bot.greeting)}
        });
      }
      if (window.initChatbot) { init(); } else { loadWidget(init); }
    })();
  `;
  res.send(code);
});

// Convenience route to preview an embed page
app.get("/preview/:publicId", (req, res) => {
  const { publicId } = req.params;
  const origin = `${req.protocol}://${req.get("host")}`;
  res.send(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>Preview ${publicId}</title></head>
      <body>
        <h3>Preview for Bot ${publicId}</h3>
        <p>This page loads the same embed code your client will paste.</p>
        <script src="${origin}/embed/${publicId}.js" async></script>
      </body>
    </html>
  `);
});

// Simple health
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
