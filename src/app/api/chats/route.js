import { auth } from "@/lib/auth";
import { getChatsByUser } from "@/models/Chat";

export async function GET(req) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chats = await getChatsByUser(session.user.id);

  return Response.json({
    chats: chats.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      pinned: c.pinned,
    })),
  });
}
