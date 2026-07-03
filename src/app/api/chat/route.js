import { streamText, convertToModelMessages } from "ai";
import { chatModel } from "@/lib/ai-client";
import { getSession } from "@/lib/auth-session";
import { createChat, getChatById, touchChat } from "@/models/Chat";
import { addMessage, getMessagesByChat } from "@/models/Message";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId, message } = await req.json();
  const userId = session.user.id;

  // Create a new chat if none provided yet
  let activeChatId = chatId;
  if (!activeChatId) {
    const newChat = await createChat(userId, message.slice(0, 60));
    activeChatId = newChat._id.toString();
  } else {
    const chat = await getChatById(activeChatId, userId);
    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }
  }

  // Save the user's message
  await addMessage({
    chatId: activeChatId,
    userId,
    role: "user",
    content: message,
  });

  // Build context from recent history (capped)
  const history = await getMessagesByChat(activeChatId);
  const recent = history
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  const result = streamText({
    model: chatModel,
    messages: recent,
    onFinish: async ({ text }) => {
      await addMessage({
        chatId: activeChatId,
        userId,
        role: "assistant",
        content: text,
        model: process.env.AI_MODEL,
      });
      await touchChat(activeChatId);
    },
  });

  return result.toTextStreamResponse({
    headers: { "X-Chat-Id": activeChatId },
  });
}
