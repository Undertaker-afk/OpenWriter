import db from './db';

export async function createConversation(title: string, model: string, systemPrompt: string) {
  return db.conversations.create(title, model, systemPrompt);
}

export async function saveMessage(conversationId: number, role: string, content: string) {
  return db.messages.add(conversationId, role, content);
}

export async function fetchConversations() {
  return db.conversations.getAll();
}

export async function fetchConversation(id: number) {
  return db.conversations.get(id);
}

export async function deleteConversation(id: number) {
  return db.conversations.delete(id);
}

export async function deleteAllConversations() {
  return db.conversations.deleteAll();
}
