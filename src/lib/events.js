// Lightweight cross-component event bus using native browser events.
// Used so the sidebar can refresh its chat list when a chat is created,
// renamed, or its title is auto-generated elsewhere in the app.

export function emitChatsChanged() {
  window.dispatchEvent(new Event("chats:changed"));
}

export function onChatsChanged(callback) {
  window.addEventListener("chats:changed", callback);
  return () => window.removeEventListener("chats:changed", callback);
}
