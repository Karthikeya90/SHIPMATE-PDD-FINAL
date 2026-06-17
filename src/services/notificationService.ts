import { Notification } from '../data/types';
import { supabase } from '../lib/supabase';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => ({
      notification_id: row.id,
      user_id: row.user_id,
      title: row.title,
      message: row.message,
      read: row.read,
      created_at: row.created_at,
      link: row.link || undefined
    }));
  },

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  }
};