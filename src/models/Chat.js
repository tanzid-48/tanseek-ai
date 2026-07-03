import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function createChat(userId, title = "New chat") {
  const db = await getDb();
  const result = await db.collection("chats").insertOne({
    userId,
    title,
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { _id: result.insertedId, userId, title, pinned: false };
}

export async function getChatsByUser(userId) {
  const db = await getDb();
  return db
    .collection("chats")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getChatById(chatId, userId) {
  const db = await getDb();
  return db.collection("chats").findOne({
    _id: new ObjectId(chatId),
    userId,
  });
}

export async function touchChat(chatId) {
  const db = await getDb();
  await db
    .collection("chats")
    .updateOne(
      { _id: new ObjectId(chatId) },
      { $set: { updatedAt: new Date() } },
    );
}

export async function renameChat(chatId, userId, title) {
  const db = await getDb();
  const result = await db
    .collection("chats")
    .updateOne({ _id: new ObjectId(chatId), userId }, { $set: { title } });
  return result.matchedCount > 0;
}

export async function togglePinChat(chatId, userId, pinned) {
  const db = await getDb();
  const result = await db
    .collection("chats")
    .updateOne({ _id: new ObjectId(chatId), userId }, { $set: { pinned } });
  return result.matchedCount > 0;
}

export async function deleteChat(chatId, userId) {
  const db = await getDb();
  const chat = await db.collection("chats").findOne({
    _id: new ObjectId(chatId),
    userId,
  });
  if (!chat) return false;

  await db.collection("messages").deleteMany({ chatId: new ObjectId(chatId) });
  await db.collection("chats").deleteOne({ _id: new ObjectId(chatId) });
  return true;
}
