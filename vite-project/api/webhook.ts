export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false })
  }

  const BOT_TOKEN = process.env.TG_BOT_TOKEN
  if (!BOT_TOKEN) {
    return res.status(500).json({ ok: false })
  }

  const callbackQuery = req.body?.callback_query
  if (!callbackQuery) {
    return res.status(200).json({ ok: true })
  }

  const { id: callbackId, data, message } = callbackQuery

  if (data === "mark_done" && message) {
    const chatId = message.chat.id
    const messageId = message.message_id

    // Экранируем спецсимволы, чтобы HTML-парсер Telegram не упал
    const safeText = (message.text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    const updatedText = `${safeText}\n\n<b>✅ СТАТУС: ОБРОБЛЕНО</b>`

    // 1. Обновляем сообщение и убираем кнопку
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: updatedText,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [] },
      }),
    })

    // 2. Убираем иконку загрузки на кнопке и показываем всплывашку
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackId,
        text: "Заявку відмічено як оброблену!",
      }),
    })
  }

  return res.status(200).json({ ok: true })
}