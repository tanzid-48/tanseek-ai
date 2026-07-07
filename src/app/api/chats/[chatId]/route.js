import { auth } from "@/lib/auth";
import {
  getChatById,
  renameChat,
  togglePinChat,
  deleteChat,
} from "@/models/Chat";
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
    messages: messages.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      content: m.content,
    })),
  });
}

export async function PATCH(req, { params }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId } = await params;
  const body = await req.json();

  let success = false;
  if (typeof body.title === "string") {
    success = await renameChat(
      chatId,
      session.user.id,
      body.title.trim().slice(0, 100),
    );
  }
  if (typeof body.pinned === "boolean") {
    success = await togglePinChat(chatId, session.user.id, body.pinned);
  }

  if (!success) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId } = await params;
  const success = await deleteChat(chatId, session.user.id);

  if (!success) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json({ success: true });
}
