const conversations: any[] = [];
const messages: any[] = [];

// Database operations for conversations
export const conversationsDb = {
  // Create a new conversation
  create: (title: string, model: string, systemPrompt: string) => {
    const timestamp = Date.now();
    
    // Generate a new ID (simulate auto-increment)
    const maxId = conversations.length > 0 
      ? Math.max(...conversations.map((c: any) => c.id))
      : 0;
    const newId = maxId + 1;
    
    const newConversation = {
      id: newId,
      title,
      created_at: timestamp,
      updated_at: timestamp,
      model,
      system_prompt: systemPrompt
    };
    
    conversations.push(newConversation);
    
    return newId;
  },
  
  // Get all conversations
  getAll: () => {
    // Sort by updated_at descending
    return conversations.sort((a: any, b: any) => b.updated_at - a.updated_at);
  },
  
  // Get a conversation by ID
  get: (id: number) => {
    return conversations.find((c: any) => c.id === id);
  },
  
  // Update a conversation
  update: (id: number, data: {title?: string, model?: string, systemPrompt?: string}) => {
    const timestamp = Date.now();
    
    const index = conversations.findIndex((c: any) => c.id === id);
    if (index === -1) return false;
    
    if (data.title !== undefined) {
      conversations[index].title = data.title;
    }
    
    if (data.model !== undefined) {
      conversations[index].model = data.model;
    }
    
    if (data.systemPrompt !== undefined) {
      conversations[index].system_prompt = data.systemPrompt;
    }
    
    conversations[index].updated_at = timestamp;
    
    return true;
  },
  
  // Delete a conversation
  delete: (id: number) => {
    const filteredConversations = conversations.filter((c: any) => c.id !== id);
    
    if (filteredConversations.length === conversations.length) {
      return false; // No conversation was deleted
    }
    
    // Also delete associated messages
    const filteredMessages = messages.filter((m: any) => m.conversation_id !== id);
    
    return true;
  },
  
  // Delete all conversations
  deleteAll: () => {
    conversations.length = 0;
    messages.length = 0; // Also clear all messages
    return true;
  }
};

// Database operations for messages
export const messagesDb = {
  // Add a new message to a conversation
  add: (conversationId: number, role: string, content: string) => {
    const timestamp = Date.now();
    
    // Debug log for message addition
    console.log(`Adding message to conversation ${conversationId} with role ${role}`);
    
    // Update the conversation's updated_at timestamp
    const conversationIndex = conversations.findIndex((c: any) => c.id === conversationId);
    
    if (conversationIndex !== -1) {
      conversations[conversationIndex].updated_at = timestamp;
    } else {
      console.error(`Attempted to add message to non-existent conversation: ${conversationId}`);
      return false;
    }
    
    // Generate a new ID (simulate auto-increment)
    const maxId = messages.length > 0 
      ? Math.max(...messages.map((m: any) => m.id))
      : 0;
    const newId = maxId + 1;
    
    const newMessage = {
      id: newId,
      conversation_id: conversationId,
      role,
      content,
      created_at: timestamp
    };
    
    console.log(`Created new message with ID ${newId} for conversation ${conversationId}`);
    
    messages.push(newMessage);
    
    return { lastInsertRowid: newId };
  },
  
  // Get all messages for a conversation
  getByConversation: (conversationId: number) => {
    console.log(`Reading messages for conversation ${conversationId}. Total messages in DB: ${messages.length}`);
    
    const conversationMessages = messages
      .filter((m: any) => {
        // Debug information about each message
        console.log(`Message ID: ${m.id}, Conversation ID: ${m.conversation_id}, Role: ${m.role}, 
          Matches current conversation: ${m.conversation_id === conversationId}`);
        return m.conversation_id === conversationId;
      })
      .sort((a: any, b: any) => a.created_at - b.created_at); // Sort by created_at ascending
      
    console.log(`Found ${conversationMessages.length} messages for conversation ${conversationId}`);
    return conversationMessages;
  }
};

// No need for open/close database functions with in-memory storage
export default {
  conversations: conversationsDb,
  messages: messagesDb
};
