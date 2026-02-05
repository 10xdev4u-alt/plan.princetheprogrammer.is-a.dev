import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Telegram webhook:', body);

    // Telegram sends updates with a 'message' object for new messages
    if (body.message) {
      const { text, chat } = body.message;
      const chatId = chat.id;

      // For now, just log and send a simple echo response back to Telegram
      console.log(`Message from ${chatId}: ${text}`);

      // You would typically send a response using Telegram Bot API
      // e.g., via `fetch('https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage', ...)`
      // For this step, just acknowledging receipt is enough.
    }

    return NextResponse.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// We also need to set up the webhook URL with Telegram.
// This is done via a GET request or a POST request to:
// https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WEBHOOK_URL>
// We'll leave this manual for now, or implement a separate script/page to set it.
