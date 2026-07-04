import { streamText, createTextStreamResponse, generateText } from "ai";
import { chatModel } from "@/lib/ai-client";
import { auth } from "@/lib/auth";
import { createChat, getChatById, touchChat, renameChat } from "@/models/Chat";
import { addMessage, getMessagesByChat } from "@/models/Message";

const SYSTEM_PROMPT = `You are TanSeek AI, a helpful assistant. Formatting rules:
- When comparing two or more things (e.g. "differences between X and Y"), always use a markdown table instead of a bullet or numbered list.
- Use proper markdown code fences (triple backticks with language name) for all code.
- Keep prose concise and well-structured with headings when appropriate.`;

async function generateTitle(firstMessage) {
  try {
    const { text } = await generateText({
      model: chatModel,
      prompt: `Generate a short chat title (max 5 words, no quotes, no punctuation at the end) summarizing this user message:\n\n"${firstMessage}"`,
    });
    return text
      .trim()
      .replace(/^["']|["']$/g, "")
      .slice(0, 60);
  } catch {
    return firstMessage.slice(0, 60);
  }
}

export async function POST(req) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId, message } = await req.json();
  const userId = session.user.id;

  let activeChatId = chatId;
  let isNewChat = false;

  if (!activeChatId) {
    const newChat = await createChat(userId, message.slice(0, 60));
    activeChatId = newChat._id.toString();
    isNewChat = true;
  } else {
    const chat = await getChatById(activeChatId, userId);
    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }
  }

  await addMessage({
    chatId: activeChatId,
    userId,
    role: "user",
    content: message,
  });

  const history = await getMessagesByChat(activeChatId);
  const recent = history
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
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

      if (isNewChat) {
        const title = await generateTitle(message);
        await renameChat(activeChatId, userId, title);
      }
    },
  });

  return createTextStreamResponse({
    stream: result.textStream,
    headers: { "X-Chat-Id": activeChatId, "X-Is-New-Chat": String(isNewChat) },
  });
}
