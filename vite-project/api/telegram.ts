export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false })
  }

  if (typeof req.body?.text !== "string" || !req.body.text.trim()) {
    return res.status(400).json({ ok: false })
  }

  const BOT_TOKEN = process.env.TG_BOT_TOKEN
  const CHAT_ID = process.env.TG_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Не знайдено ключі Telegram у файлі .env")
    return res.status(500).json({ ok: false })
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: req.body.text,
        parse_mode: "HTML",
      }),
    })

    if (!resp.ok) {
      console.error("Помилка Telegram API:", await resp.text())
      return res.status(500).json({ ok: false })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error("Помилка відправки в Telegram:", error)
    return res.status(500).json({ ok: false })
  }
}