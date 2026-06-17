export type Role = 'sender' | 'traveller';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: Role;
  profile_image?: string;
  location?: Location;
  created_at: string;
}

export interface SenderDetails {
  sender_id: string;
  address: string;
  preferences: string[];
}

export interface Route {
  from: Location;
  to: Location;
  date: string;
}

export interface TravellerDetails {
  traveller_id: string;
  routes: Route[];
  availability: boolean;
  rating: number;
  earnings: number;
  completed_deliveries: number;
}

export type DeliveryStatus =
'requested' |
'matched' |
'picked_up' |
'in_transit' |
'delivered' |
'cancelled';

export interface DeliveryRequest {
  request_id: string;
  sender_id: string;
  traveller_id?: string;
  item_name: string;
  item_description: string;
  pickup_location: Location;
  drop_location: Location;
  delivery_date: string;
  status: DeliveryStatus;
  price: number;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  payer_id: string;      // sender who pays
  receiver_id: string;   // traveller who earns
  request_id: string;
  amount: number;        // in INR ₹
  description: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Message {
  message_id: string;
  request_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: string;
}

export interface Review {
  review_id: string;
  request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}