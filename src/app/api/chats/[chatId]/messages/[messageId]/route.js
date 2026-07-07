import { auth } from "@/lib/auth";
import { getChatById } from "@/models/Chat";
import { getMessageById, deleteMessagesFrom } from "@/models/Message";

export async function DELETE(req, { params }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId, messageId } = await params;

  const chat = await getChatById(chatId, session.user.id);
  if (!chat) {
    return new Response("Not found", { status: 404 });
  }

  const message = await getMessageById(messageId);
  if (!message || message.chatId.toString() !== chatId) {
    return new Response("Not found", { status: 404 });
  }

  await deleteMessagesFrom(chatId, message.createdAt);

  return Response.json({ success: true });
}
