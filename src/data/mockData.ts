import {
  User,
  TravellerDetails,
  DeliveryRequest,
  Message,
  Notification,
  Review,
  Payment } from
'./types';

const initialMockUsers: User[] = [
{
  user_id: 'u1',
  name: 'Alex Sender',
  email: 'alex@example.com',
  phone: '+91 98765 43210',
  city: 'Mumbai',
  role: 'sender',
  profile_image: 'https://i.pravatar.cc/150?u=u1',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  location: { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra' }
},
{
  user_id: 'u2',
  name: 'Sarah Traveller',
  email: 'sarah@example.com',
  phone: '+91 87654 32109',
  city: 'Delhi',
  role: 'traveller',
  profile_image: 'https://i.pravatar.cc/150?u=u2',
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  location: { lat: 28.6139, lng: 77.2090, address: 'New Delhi, Delhi' }
},
{
  user_id: 'u3',
  name: 'Mike Driver',
  email: 'mike@example.com',
  phone: '+91 76543 21098',
  city: 'Bengaluru',
  role: 'traveller',
  profile_image: 'https://i.pravatar.cc/150?u=u3',
  created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  location: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka' }
}];

export const mockUsers: User[] = (() => {
  const stored = localStorage.getItem('mockUsers');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored mockUsers', e);
    }
  }
  return [...initialMockUsers];
})();


export const mockTravellerDetails: Record<string, TravellerDetails> = {
  u2: {
    traveller_id: 'u2',
    routes: [
    {
      from: { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra' },
      to: { lat: 28.6139, lng: 77.2090, address: 'New Delhi, Delhi' },
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }],
    availability: true,
    rating: 4.8,
    earnings: 8500,
    completed_deliveries: 42
  },
  u3: {
    traveller_id: 'u3',
    routes: [
    {
      from: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka' },
      to: { lat: 17.3850, lng: 78.4867, address: 'Hyderabad, Telangana' },
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    }],
    availability: true,
    rating: 4.5,
    earnings: 5200,
    completed_deliveries: 28
  }
};

export const mockDeliveryRequests: DeliveryRequest[] = [
{
  request_id: 'r1',
  sender_id: 'u1',
  traveller_id: 'u2',
  item_name: 'Vintage Camera',
  item_description: 'Fragile Canon DSLR with lens. Needs careful handling.',
  pickup_location: {
    lat: 19.0760,
    lng: 72.8777,
    address: '123 Marine Lines, Mumbai, Maharashtra'
  },
  drop_location: {
    lat: 28.6139,
    lng: 77.2090,
    address: '456 Connaught Place, New Delhi, Delhi'
  },
  delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'in_transit',
  price: 3500,
  created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
},
{
  request_id: 'r2',
  sender_id: 'u1',
  item_name: 'Important Documents',
  item_description: 'Sealed envelope, urgent delivery required.',
  pickup_location: {
    lat: 19.0760,
    lng: 72.8777,
    address: '789 Bandra West, Mumbai, Maharashtra'
  },
  drop_location: {
    lat: 12.9716,
    lng: 77.5946,
    address: '101 MG Road, Bengaluru, Karnataka'
  },
  delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'requested',
  price: 8000,
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
}];


export const mockMessages: Message[] = [
{
  message_id: 'm1',
  request_id: 'r1',
  sender_id: 'u2',
  receiver_id: 'u1',
  message: 'Hi Alex! I just picked up the camera. It is safely secured.',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
},
{
  message_id: 'm2',
  request_id: 'r1',
  sender_id: 'u1',
  receiver_id: 'u2',
  message:
  'Awesome, thanks Sarah! Let me know when you are close to San Jose.',
  timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString()
}];


export const mockNotifications: Notification[] = [
{
  notification_id: 'n1',
  user_id: 'u1',
  title: 'Delivery Picked Up',
  message: 'Sarah has picked up your Vintage Camera.',
  read: false,
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  link: '/sender/tracking/r1'
}];


export const mockPayments: Payment[] = [
{
  payment_id: 'pay1',
  payer_id: 'u1',
  receiver_id: 'u2',
  request_id: 'r1',
  amount: 3500,
  description: 'Payment for Vintage Camera delivery - Mumbai to New Delhi',
  payment_status: 'completed',
  created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
}];


export const mockReviews: Review[] = [
{
  review_id: 'rev1',
  request_id: 'r0',
  reviewer_id: 'u1',
  reviewee_id: 'u2',
  rating: 5,
  comment: 'Sarah was incredibly fast and communicative. Highly recommend!',
  created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
}];