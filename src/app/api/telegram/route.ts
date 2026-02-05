import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// This is a placeholder user ID. In a real application, you would
// link Telegram chat IDs to actual user IDs in your database.
// For now, ideas captured via Telegram will be attributed to this user.
// PrinceTheProgrammer: Replace this with your actual user_id from auth.users table in Supabase.
const TELEGRAM_DEFAULT_USER_ID = process.env.TELEGRAM_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'; // Placeholder UUID

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Telegram webhook:', body);

    const supabase = createServiceRoleClient(); // Use the service role client

    // Telegram sends updates with a 'message' object for new messages
    if (body.message && body.message.text) {
      const { text, chat } = body.message;
      const chatId = chat.id;

      // Extract idea title from the message (e.g., first sentence, or entire message)
      const ideaTitle = text.split('\n')[0].substring(0, 255); // Max 255 chars for title
      const ideaDescription = text;

      // Insert the new idea into the 'ideas' table
      const { error: insertError } = await supabase
        .from('ideas')
        .insert({
          title: ideaTitle,
          description: ideaDescription,
          user_id: TELEGRAM_DEFAULT_USER_ID, // Assign to default user
          category: 'random', // Default category for now
          status: 'captured', // Default status
        });

      if (insertError) {
        console.error('Error inserting idea from Telegram:', insertError);
        // Respond to Telegram with an error message
        await sendTelegramMessage(chatId, '🚨 Failed to capture your idea. Please try again later.');
        return NextResponse.json({ success: false, error: 'Failed to insert idea' }, { status: 500 });
      }

      // Respond to Telegram with a success message
      await sendTelegramMessage(chatId, `🚀 Idea "${ideaTitle}" captured successfully!`);
      return NextResponse.json({ success: true, message: 'Idea captured' });
    }

    // Handle other types of Telegram updates or messages without text
    return NextResponse.json({ success: true, message: 'Webhook received, no text message processed' });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    // Respond to Telegram with a generic error
    // For this, we'd need to extract chatId from body.message.chat.id
    // But if body.message is null, then chat.id would fail.
    // So, we'll log the error and send a generic internal server error.
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to send messages back to Telegram
async function sendTelegramMessage(chatId: number, message: string) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramBotToken) {
    console.error('TELEGRAM_BOT_TOKEN is not set.');
    return;
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

// You also need to set up the webhook URL with Telegram.
// This is done manually via a GET request or a POST request to:
// https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WEBHOOK_URL>
// This is outside the scope of this file. You can use a tool like Postman, curl, or a separate script.
// Example curl command:
// curl -F "url=https://your-domain.vercel.app/api/telegram" "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook"