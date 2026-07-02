import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireSession() {
  const { redirect } = await import("next/navigation");
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function getAuthHeaders() {
  return await headers();
}
