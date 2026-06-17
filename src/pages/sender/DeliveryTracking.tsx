import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import {
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Search
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest, User } from '../../data/types';

import { format } from 'date-fns';
// Custom Map Icons
const pickupIcon = new Icon({
  iconUrl:
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
const dropIcon = new Icon({
  iconUrl:
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
const travellerIcon = new Icon({
  iconUrl:
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
export function DeliveryTracking() {
  const { id } = useParams<{
    id: string;
  }>();
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [traveller, setTraveller] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0.1);

  const statuses = [
    'requested',
    'matched',
    'picked_up',
    'in_transit',
    'delivered'
  ];

  const currentStatusIndex = request ? statuses.indexOf(request.status) : -1;

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const req = await deliveryService.getRequestById(id);
        if (req) {
          setRequest(req);
          if (req.traveller_id) {
            const t = await deliveryService.getUserById(req.traveller_id);
            if (t) setTraveller(t);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (currentStatusIndex >= 2 && currentStatusIndex < 4) {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(0.95, p + 0.02));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStatusIndex]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!request) {
    return <div className="text-center py-20">Delivery not found.</div>;
  }

  // Mock traveller location (simulating movement)
  const travellerLoc = {
    lat: request.pickup_location.lat + (request.drop_location.lat - request.pickup_location.lat) * progress,
    lng: request.pickup_location.lng + (request.drop_location.lng - request.pickup_location.lng) * progress
  };
  const centerLat =
  (request.pickup_location.lat + request.drop_location.lat) / 2;
  const centerLng =
  (request.pickup_location.lng + request.drop_location.lng) / 2;
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/sender"
          className="p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors">
          
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">
            Tracking: {request.item_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            ID: {request.request_id.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden h-[400px] relative z-0">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={8}
              style={{
                height: '100%',
                width: '100%'
              }}
              zoomControl={false}>
              
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
              
              <Marker
                position={[
                request.pickup_location.lat,
                request.pickup_location.lng]
                }
                icon={pickupIcon}>
                
                <Popup className="custom-popup">
                  Pickup: {request.pickup_location.address}
                </Popup>
              </Marker>
              <Marker
                position={[
                request.drop_location.lat,
                request.drop_location.lng]
                }
                icon={dropIcon}>
                
                <Popup>Drop-off: {request.drop_location.address}</Popup>
              </Marker>

              {currentStatusIndex >= 2 && currentStatusIndex < 4 &&
              <Marker
                position={[travellerLoc.lat, travellerLoc.lng]}
                icon={travellerIcon}>
                
                  <Popup>Traveller Location</Popup>
                </Marker>
              }

              <Polyline
                positions={[
                [request.pickup_location.lat, request.pickup_location.lng],
                [request.drop_location.lat, request.drop_location.lng]]
                }
                color="#22d3ee"
                weight={3}
                dashArray="10, 10"
                opacity={0.5} />
              
            </MapContainer>

            {/* Status Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[400] bg-card/90 backdrop-blur border border-border rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Estimated Delivery
                </span>
                <span className="text-sm font-medium">
                  {format(new Date(request.delivery_date), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2.5 mb-1 overflow-hidden">
                <motion.div
                  className="bg-primary h-2.5 rounded-full"
                  initial={{
                    width: 0
                  }}
                  animate={{
                    width: `${Math.max(5, currentStatusIndex / (statuses.length - 1) * 100)}%`
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut'
                  }}>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-6">Delivery Status</h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {[
              {
                id: 'requested',
                label: 'Request Created',
                desc: 'Waiting for traveller',
                icon: Package
              },
              {
                id: 'matched',
                label: 'Traveller Assigned',
                desc: traveller ?
                `${traveller.name} accepted` :
                'Matching...',
                icon: ShieldCheck
              },
              {
                id: 'picked_up',
                label: 'Item Picked Up',
                desc: 'Traveller has the item',
                icon: MapPin
              },
              {
                id: 'in_transit',
                label: 'In Transit',
                desc: 'Heading to destination',
                icon: Clock
              },
              {
                id: 'delivered',
                label: 'Delivered',
                desc: 'Item reached destination',
                icon: CheckCircle2
              }].
              map((step, i) => {
                const isCompleted = currentStatusIndex >= i;
                const isCurrent = currentStatusIndex === i;
                return (
                  <div
                    key={step.id}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors ${isCompleted ? 'border-primary/20 bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                      
                      <step.icon className="h-4 w-4" />
                    </div>

                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-background/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          
                          {step.label}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>);

              })}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Traveller */}
        <div className="space-y-6">
          {/* Traveller Card */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Your Traveller
            </h3>
            {traveller ?
            <div>
                <div className="flex items-center gap-4 mb-6">
                  <img
                  src={traveller.profile_image}
                  alt={traveller.name}
                  className="h-16 w-16 rounded-full border border-border" />
                
                  <div>
                    <h4 className="font-semibold text-lg">{traveller.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-500" />{' '}
                      Verified Partner
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                  to="/sender/chat"
                  className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                  
                    <MessageSquare className="h-4 w-4" /> Chat
                  </Link>
                  <button className="flex-1 bg-card border border-border hover:bg-muted py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                    <Phone className="h-4 w-4" /> Call
                  </button>
                </div>
              </div> :

            <div className="text-center py-6">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Finding the perfect traveller for your delivery...
                </p>
                <Link
                to="/sender/search"
                state={{
                  requestId: request.request_id
                }}
                className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
                
                  Browse Travellers
                </Link>
              </div>
            }
          </div>

          {/* Delivery Details */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Delivery Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Item</p>
                <p className="font-medium">{request.item_name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {request.item_description}
                </p>
              </div>
              <div className="h-px bg-border"></div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pickup</p>
                <p className="font-medium text-sm">
                  {request.pickup_location.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Drop-off</p>
                <p className="font-medium text-sm">
                  {request.drop_location.address}
                </p>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Agreed Price</p>
                <p className="font-bold text-lg flex items-center gap-0.5">
                  <span className="text-base">₹</span>{request.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}