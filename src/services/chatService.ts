import { Message, MessageType } from '../data/types';
import { supabase } from '../lib/supabase';

// In-memory fallback store in case Supabase messages table doesn't exist
const localMessages: Message[] = [];
let useLocal = false;

/**
 * Converts a file or blob to base64 data URL for fallback local storage
 */
const fileToDataUrl = (file: Blob | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const chatService = {
  /**
   * Upload an image or audio file to Supabase Storage, with automatic Data URL fallback.
   */
  async uploadMedia(file: Blob | File, folder: 'images' | 'audio'): Promise<string> {
    try {
      const ext = file.type.split('/')[1] || (folder === 'images' ? 'jpg' : 'webm');
      const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filename, file, { cacheControl: '3600', upsert: true });

      if (error || !data) {
        console.warn('Supabase storage upload failed, using Data URL fallback:', error?.message);
        return await fileToDataUrl(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filename);

      return publicUrlData.publicUrl;
    } catch {
      return await fileToDataUrl(file);
    }
  },

  /**
   * Get all messages for a delivery request, sorted by time.
   */
  async getMessagesForRequest(requestId: string): Promise<Message[]> {
    if (useLocal) {
      return localMessages
        .filter((m) => m.request_id === requestId)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('delivery_id', requestId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Messages table not available, using in-memory chat:', error.message);
        useLocal = true;
        return localMessages
          .filter((m) => m.request_id === requestId)
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
      }

      return (data || []).map((row: any) => ({
        message_id: row.id,
        request_id: row.delivery_id,
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        message: row.content || '',
        message_type: row.message_type || 'text',
        media_url: row.media_url,
        audio_duration: row.audio_duration,
        timestamp: row.created_at
      }));
    } catch {
      useLocal = true;
      return localMessages
        .filter((m) => m.request_id === requestId)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }
  },

  /**
   * Send a message (text, image, or voice).
   */
  async sendMessage(
    requestId: string,
    senderId: string,
    receiverId: string,
    text: string,
    messageType: MessageType = 'text',
    mediaUrl?: string,
    audioDuration?: number
  ): Promise<Message> {
    const newMessage: Message = {
      message_id: `m${Date.now()}_${Math.random().toString(36).substring(2)}`,
      request_id: requestId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: text,
      message_type: messageType,
      media_url: mediaUrl,
      audio_duration: audioDuration,
      timestamp: new Date().toISOString()
    };

    if (useLocal) {
      localMessages.push(newMessage);
      return newMessage;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          delivery_id: requestId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: text,
          message_type: messageType,
          media_url: mediaUrl,
          audio_duration: audioDuration
        })
        .select()
        .single();

      if (error) {
        console.warn('Failed to save message to Supabase, using local fallback:', error.message);
        useLocal = true;
        localMessages.push(newMessage);
        return newMessage;
      }

      return {
        message_id: data.id,
        request_id: data.delivery_id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        message: data.content || '',
        message_type: data.message_type || 'text',
        media_url: data.media_url,
        audio_duration: data.audio_duration,
        timestamp: data.created_at
      };
    } catch {
      useLocal = true;
      localMessages.push(newMessage);
      return newMessage;
    }
  },

  /**
   * Subscribe to real-time messages for a delivery.
   */
  subscribeToMessages(
    requestId: string,
    currentUserId: string,
    onNewMessage: (msg: Message) => void
  ): () => void {
    if (useLocal) {
      return () => {
        // Local cleanup stub
      };
    }

    const channel = supabase
      .channel(`messages:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `delivery_id=eq.${requestId}`
        },
        (payload: any) => {
          const row = payload.new;
          if (row.sender_id !== currentUserId) {
            onNewMessage({
              message_id: row.id,
              request_id: row.delivery_id,
              sender_id: row.sender_id,
              receiver_id: row.receiver_id,
              message: row.content || '',
              message_type: row.message_type || 'text',
              media_url: row.media_url,
              audio_duration: row.audio_duration,
              timestamp: row.created_at
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};