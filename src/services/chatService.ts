import { Message } from '../data/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Chat is kept as local/in-memory for now since it's a real-time feature.
// For a production app, you would use Supabase Realtime or a messages table.
const localMessages: Message[] = [];

export const chatService = {
  async getMessagesForRequest(requestId: string): Promise<Message[]> {
    await delay(400);
    return localMessages
      .filter((m) => m.request_id === requestId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  },

  async sendMessage(
    requestId: string,
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<Message> {
    await delay(300);
    const newMessage: Message = {
      message_id: `m${Date.now()}`,
      request_id: requestId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: text,
      timestamp: new Date().toISOString()
    };
    localMessages.push(newMessage);
    return newMessage;
  },

  simulateIncomingMessage(
    requestId: string,
    senderId: string,
    receiverId: string,
    text: string,
    delayMs = 3000
  ): Promise<Message> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: Message = {
          message_id: `m${Date.now()}`,
          request_id: requestId,
          sender_id: senderId,
          receiver_id: receiverId,
          message: text,
          timestamp: new Date().toISOString()
        };
        localMessages.push(newMessage);
        resolve(newMessage);
      }, delayMs);
    });
  }
};