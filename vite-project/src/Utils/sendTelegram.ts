const BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN
const CHAT_ID = import.meta.env.VITE_TG_CHAT_ID

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Не знайдено ключі Telegram у файлі .env")
    return false
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  try {
    const response = await fetch(url, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "HTML", 
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Помилка відправки в Telegram:", error)
    return false
  }
}