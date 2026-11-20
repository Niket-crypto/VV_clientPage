export async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    return response.ok
  } catch (error) {
    console.error("Помилка відправки в Telegram:", error)
    return false
  }
}