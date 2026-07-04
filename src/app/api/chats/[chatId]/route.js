import { auth } from "@/lib/auth";
import { getChatById } from "@/models/Chat";
import { getMessagesByChat } from "@/models/Message";

export async function GET(req, { params }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId } = await params;
  const chat = await getChatById(chatId, session.user.id);
  if (!chat) {
    return new Response("Not found", { status: 404 });
  }

  const messages = await getMessagesByChat(chatId);

  return Response.json({
    chat: { id: chat._id.toString(), title: chat.title },
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}
