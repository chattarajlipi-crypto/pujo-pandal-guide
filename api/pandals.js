// Vercel serverless function: stores pandals added by visitors in Upstash Redis (REST).
// Env vars (set automatically when you connect Upstash Redis to the project):
//   KV_REST_API_URL + KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
// Optional: ADMIN_KEY, used to remove a pandal (see README).

const crypto = require("crypto");

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST = "pujo:pandals";
const MAX_ITEMS = 500;
const MAX_POSTS_PER_HOUR = 10;
const AREAS = ["North Kolkata", "Central Kolkata", "South Kolkata", "Dum Dum & Lake Town", "Districts"];

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) {
    return res.status(503).json({ error: "Storage is not connected yet." });
  }
  try {
    if (req.method === "GET") {
      const raw = await redis(["LRANGE", LIST, "0", String(MAX_ITEMS - 1)]);
      const items = (raw || []).map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      if (b.website) return res.status(200).json({ item: { id: "x", name: "Thanks" } }); // honeypot filled: bot

      const name = clean(b.name, 80);
      const place = clean(b.place, 120);
      if (!name || !place) return res.status(400).json({ error: "Enter the pandal name and its locality." });

      const ip = clean((req.headers["x-forwarded-for"] || "").split(",")[0], 60) || "unknown";
      const key = "pujo:rl:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24);
      const n = await redis(["INCR", key]);
      if (n === 1) await redis(["EXPIRE", key, "3600"]);
      if (n > MAX_POSTS_PER_HOUR) return res.status(429).json({ error: "Too many additions. Try again later." });

      const item = {
        id: crypto.randomUUID(),
        name,
        area: AREAS.includes(b.area) ? b.area : "Districts",
        place,
        theme: clean(b.theme, 140),
        metro: clean(b.metro, 80),
        rail: clean(b.rail, 80),
        bus: clean(b.bus, 80),
        reach: clean(b.reach, 240),
        createdAt: Date.now(),
      };
      await redis(["LPUSH", LIST, JSON.stringify(item)]);
      await redis(["LTRIM", LIST, "0", String(MAX_ITEMS - 1)]);
      return res.status(201).json({ item });
    }

    if (req.method === "DELETE") {
      if (!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: "Not allowed." });
      }
      const id = clean(req.query && req.query.id, 80);
      const raw = await redis(["LRANGE", LIST, "0", String(MAX_ITEMS - 1)]);
      const hit = (raw || []).find((s) => { try { return JSON.parse(s).id === id; } catch (e) { return false; } });
      if (!hit) return res.status(404).json({ error: "Not found." });
      await redis(["LREM", LIST, "1", hit]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
};
