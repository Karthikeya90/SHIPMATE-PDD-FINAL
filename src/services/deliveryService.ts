import {
  DeliveryRequest,
  DeliveryStatus,
  Location,
  Notification,
  Payment,
  TravellerDetails,
  User
} from '../data/types';
import { supabase } from '../lib/supabase';

// Helper: convert a Supabase delivery row to our DeliveryRequest type
function toDeliveryRequest(row: any): DeliveryRequest {
  return {
    request_id: row.id,
    sender_id: row.sender_id,
    traveller_id: row.traveller_id || undefined,
    item_name: row.item_name,
    item_description: row.item_description || '',
    pickup_location: {
      lat: row.pickup_lat,
      lng: row.pickup_lng,
      address: row.pickup_address
    },
    drop_location: {
      lat: row.drop_lat,
      lng: row.drop_lng,
      address: row.drop_address
    },
    delivery_date: row.delivery_date,
    status: row.status as DeliveryStatus,
    price: parseFloat(row.price),
    created_at: row.created_at
  };
}

function toNotification(row: any): Notification {
  return {
    notification_id: row.id,
    user_id: row.user_id,
    title: row.title,
    message: row.message,
    read: row.read,
    created_at: row.created_at,
    link: row.link || undefined
  };
}

function toPayment(row: any): Payment {
  return {
    payment_id: row.id,
    payer_id: row.payer_id,
    receiver_id: row.receiver_id,
    request_id: row.delivery_id,
    amount: parseFloat(row.amount),
    description: row.description || '',
    payment_status: row.payment_status,
    created_at: row.created_at
  };
}

function toUser(profile: any): User {
  return {
    user_id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || undefined,
    city: profile.city || undefined,
    role: profile.role,
    profile_image: profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1f5e5b&color=fff`,
    location: profile.location_lat ? {
      lat: profile.location_lat,
      lng: profile.location_lng,
      address: profile.location_address || ''
    } : undefined,
    created_at: profile.created_at
  };
}

export const deliveryService = {
  async getRequestsForSender(senderId: string): Promise<DeliveryRequest[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toDeliveryRequest);
  },

  async getRequestsForTraveller(travellerId: string): Promise<DeliveryRequest[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('traveller_id', travellerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toDeliveryRequest);
  },

  async getAvailableRequests(): Promise<DeliveryRequest[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('status', 'requested')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toDeliveryRequest);
  },

  async getRequestById(requestId: string): Promise<DeliveryRequest | undefined> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) return undefined;
    return toDeliveryRequest(data);
  },

  async createRequest(
    request: Omit<DeliveryRequest, 'request_id' | 'status' | 'created_at'>
  ): Promise<DeliveryRequest> {
    const { data, error } = await supabase
      .from('deliveries')
      .insert({
        sender_id: request.sender_id,
        traveller_id: request.traveller_id || null,
        item_name: request.item_name,
        item_description: request.item_description,
        pickup_lat: request.pickup_location.lat,
        pickup_lng: request.pickup_location.lng,
        pickup_address: request.pickup_location.address,
        drop_lat: request.drop_location.lat,
        drop_lng: request.drop_location.lng,
        drop_address: request.drop_location.address,
        delivery_date: request.delivery_date,
        price: request.price
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Notify all travellers
    const { data: travellers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'traveller');

    if (travellers && travellers.length > 0) {
      const notifications = travellers.map((t: any) => ({
        user_id: t.id,
        title: '📦 New Delivery Request Available!',
        message: `A new delivery request for "${request.item_name}" from ${request.pickup_location.address} to ${request.drop_location.address} has been posted.`,
        link: '/traveller/search'
      }));

      await supabase.from('notifications').insert(notifications);
    }

    return toDeliveryRequest(data);
  },

  async updateRequestStatus(
    requestId: string,
    status: DeliveryStatus
  ): Promise<DeliveryRequest> {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDeliveryRequest(data);
  },

  /** Traveller accepts a sender's request → notifies the sender */
  async acceptRequest(
    requestId: string,
    travellerId: string
  ): Promise<DeliveryRequest> {
    // Get traveller name
    const { data: travellerProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', travellerId)
      .single();

    const { data, error } = await supabase
      .from('deliveries')
      .update({ traveller_id: travellerId, status: 'matched' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const req = toDeliveryRequest(data);

    // Notify sender
    await supabase.from('notifications').insert({
      user_id: req.sender_id,
      title: '🎉 Traveller Accepted Your Request!',
      message: `${travellerProfile?.name || 'A traveller'} has accepted your delivery request for "${req.item_name}". They will pick it up soon.`,
      link: `/sender/tracking/${requestId}`
    });

    return req;
  },

  /** Traveller marks delivery as completed → transfers payment */
  async markDelivered(
    requestId: string,
    travellerId: string
  ): Promise<DeliveryRequest> {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status: 'delivered' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const req = toDeliveryRequest(data);

    // Get traveller name
    const { data: travellerProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', travellerId)
      .single();

    // Create payment record
    await supabase.from('payments').insert({
      payer_id: req.sender_id,
      receiver_id: travellerId,
      delivery_id: requestId,
      amount: req.price,
      description: `Payment for "${req.item_name}" delivery`,
      payment_status: 'completed'
    });

    // Notify sender
    await supabase.from('notifications').insert({
      user_id: req.sender_id,
      title: '✅ Package Delivered!',
      message: `Your "${req.item_name}" has been delivered successfully by ${travellerProfile?.name || 'the traveller'}. ₹${req.price.toLocaleString('en-IN')} has been transferred.`,
      link: '/sender/history'
    });

    // Notify traveller
    await supabase.from('notifications').insert({
      user_id: travellerId,
      title: '💰 Payment Received!',
      message: `₹${req.price.toLocaleString('en-IN')} has been added to your earnings for delivering "${req.item_name}".`,
      link: '/traveller/earnings'
    });

    return req;
  },

  async searchTravellers(
    _pickup: Location,
    _drop: Location,
    _date: string
  ): Promise<(User & TravellerDetails)[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'traveller');

    if (error) throw new Error(error.message);

    return (data || []).map((t: any) => ({
      ...toUser(t),
      traveller_id: t.id,
      routes: [],
      availability: true,
      rating: 4.5,
      earnings: 0,
      completed_deliveries: 0
    }));
  },

  async assignTraveller(
    requestId: string,
    travellerId: string
  ): Promise<DeliveryRequest> {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ traveller_id: travellerId, status: 'matched' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDeliveryRequest(data);
  },

  /** Get notifications for a user */
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toNotification);
  },

  /** Mark notification as read */
  async markNotificationRead(notifId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId);
  },

  /** Get payments for a user */
  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .or(`payer_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toPayment);
  },

  /** Get completed deliveries for a sender (history) */
  async getDeliveryHistory(senderId: string): Promise<DeliveryRequest[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('sender_id', senderId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(toDeliveryRequest);
  },

  /** Get a user profile by ID */
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return toUser(data);
  }
};