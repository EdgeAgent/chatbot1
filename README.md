
# Chatbot Snippet Generator & Manager

Generate, save, and serve chatbot embed snippets for your clients.  
Stack: **Node.js + Express + SQLite (better-sqlite3)**. Frontend is vanilla HTML/JS.

## Quick Start

```bash
unzip chatbot-snippet-generator.zip
cd mnt/data/botgen   # or the unzipped folder
npm install
npm run dev
# open http://localhost:3000
```

> If you downloaded a zip, unzip it and run from the extracted folder.

## How it works

- **Create bots** in the admin UI (`/`).
- Each bot gets a **public_id**.
- Your client pastes a single line on their site:

```html
<script src="https://YOUR_HOST/embed/PUBLIC_ID.js" async></script>
```

- That script loads `widget.js` and inlines the config (color, position, greeting, and iframe URL).

## Endpoints

- `GET /api/bots` — list saved bots
- `POST /api/bots` — create a bot (JSON body: name, client_name?, domain?, bot_url, color?, position?, greeting?)
- `PUT /api/bots/:publicId` — update bot
- `DELETE /api/bots/:publicId` — delete bot
- `GET /embed/:publicId.js` — dynamic JS your clients embed
- `GET /preview/:publicId` — quick preview page

## Notes

- **Bot URL** should point to your hosted chat UI (an iframe-capable page). If you don't have one yet, you can point to any placeholder URL to test.
- You can customize `public/widget.js` to change the chat button shape, size, animations, etc.
- For HTTPS and a domain, deploy to Render, Railway, Fly.io, or a VPS.

---

Generated on 2025-08-22T10:10:30.088754 UTC.
