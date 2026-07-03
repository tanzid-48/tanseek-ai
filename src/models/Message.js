import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function addMessage({
  chatId,
  userId,
  role,
  content,
  model = null,
}) {
  const db = await getDb();
  const result = await db.collection("messages").insertOne({
    chatId: new ObjectId(chatId),
    userId,
    role,
    content,
    model,
    createdAt: new Date(),
  });
  return { _id: result.insertedId, chatId, userId, role, content, model };
}

export async function getMessagesByChat(chatId) {
  const db = await getDb();
  return db
    .collection("messages")
    .find({ chatId: new ObjectId(chatId) })
    .sort({ createdAt: 1 })
    .toArray();
}
