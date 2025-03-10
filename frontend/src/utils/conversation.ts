import db from '@/utils/db';

// Create a new conversation
export async function createConversation(title: string, model: string, systemPrompt: string) {
  return db.conversations.create(title, model, systemPrompt);
}

// Save a message to a conversation
export async function saveMessage(conversationId: number, role: string, content: string) {
  return db.messages.add(conversationId, role, content);
}

// Fetch all conversations
export async function fetchConversations() {
  return db.conversations.getAll();
}

// Fetch a specific conversation by id
export async function fetchConversation(id: number) {
  return db.conversations.get(id);
}

// Delete a specific conversation by id
export async function deleteConversation(id: number) {
  return db.conversations.delete(id);
}

// Delete all conversations
export async function deleteAllConversations() {
  return db.conversations.deleteAll();
}
