import type { VercelRequest, VercelResponse } from "@vercel/node"

type Lang = "vi" | "en"

const isLang = (v: unknown): v is Lang => v === "vi" || v === "en"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const body = (req.body ?? {}) as { q?: unknown; target?: unknown }
  const q = typeof body.q === "string" ? body.q.trim() : ""
  const target = isLang(body.target) ? body.target : null

  if (!q || !target) {
    res.status(400).json({ error: "Missing q/target" })
    return
  }

  const upstream = process.env.LIBRETRANSLATE_URL || "https://libretranslate.de/translate"

  try {
    const upstreamRes = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, source: "auto", target, format: "text" }),
    })

    const text = await upstreamRes.text()
    if (!upstreamRes.ok) {
      res.status(502).json({ error: "Upstream translate failed", status: upstreamRes.status, body: text })
      return
    }

    // libretranslate returns JSON: { translatedText: string }
    res.setHeader("Content-Type", "application/json")
    res.status(200).send(text)
  } catch (e) {
    res.status(500).json({ error: (e as Error)?.message ?? "Translate failed" })
  }
}

