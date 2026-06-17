import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Package,
  Loader2,
  Clock,
  IndianRupee,
  ExternalLink,
  User as UserIcon,
  CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest, User } from '../../data/types';

import { format } from 'date-fns';

export function TravellerTracking() {
  const { user } = useAuth();
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [selected, setSelected] = useState<DeliveryRequest | null>(null);
  const [sender, setSender] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    deliveryService.getRequestsForTraveller(user.user_id).then(async (reqs) => {
      const active = reqs.filter((r) => ['matched', 'picked_up', 'in_transit'].includes(r.status));
      setActiveDeliveries(active);
      if (active.length > 0) {
        const first = active[0];
        setSelected(first);
        const senderUser = await deliveryService.getUserById(first.sender_id);
        if (senderUser) setSender(senderUser);
      }
      setIsLoading(false);
    });
  }, [user]);

  // Update sender info when selected delivery changes
  useEffect(() => {
    if (!selected) return;
    deliveryService.getUserById(selected.sender_id).then((senderUser) => {
      setSender(senderUser || null);
    });
  }, [selected]);

  // Live GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => setLiveCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  const openGoogleMaps = (req: DeliveryRequest) => {
    const origin = `${req.pickup_location.lat},${req.pickup_location.lng}`;
    const dest = `${req.drop_location.lat},${req.drop_location.lng}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`,
      '_blank'
    );
  };

  const statusSteps = [
    { key: 'matched', label: 'Accepted', sub: 'Request accepted by you' },
    { key: 'picked_up', label: 'Picked Up', sub: 'Package collected from sender' },
    { key: 'in_transit', label: 'In Transit', sub: 'On the way to destination' },
    { key: 'delivered', label: 'Delivered', sub: 'Package delivered successfully' }
  ];
  const getStepIndex = (status: string) =>
    statusSteps.findIndex((s) => s.key === status);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activeDeliveries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-2">Tracking</h1>
        <p className="text-muted-foreground mb-8">Monitor your active delivery routes in real time.</p>
        <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
          <p className="text-muted-foreground text-sm">Accept a delivery request to start tracking.</p>
        </div>
      </div>
    );
  }

  const stepIdx = selected ? getStepIndex(selected.status) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-1 flex items-center gap-2">
          <Navigation className="h-7 w-7 text-primary" /> Delivery Tracking
        </h1>
        <p className="text-muted-foreground">Real-time tracking for your active deliveries.</p>
      </div>

      {/* Delivery Selector Tabs */}
      {activeDeliveries.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {activeDeliveries.map((req) => (
            <button
              key={req.request_id}
              onClick={() => setSelected(req)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                selected?.request_id === req.request_id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {req.item_name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* ── LEFT: Map + Route ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl overflow-hidden"
          >
            {/* OpenStreetMap iframe showing pickup → dropoff */}
            <div className="relative h-72 md:h-96 bg-muted">
              <iframe
                title="delivery-map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(selected.pickup_location.lng, selected.drop_location.lng) - 0.5},${Math.min(selected.pickup_location.lat, selected.drop_location.lat) - 0.5},${Math.max(selected.pickup_location.lng, selected.drop_location.lng) + 0.5},${Math.max(selected.pickup_location.lat, selected.drop_location.lat) + 0.5}&layer=mapnik&marker=${selected.drop_location.lat},${selected.drop_location.lng}`}
              />

              {/* Live GPS badge */}
              {liveCoords && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-green-700 flex items-center gap-1.5 shadow z-10">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live GPS Active
                </div>
              )}

              {/* Navigate button */}
              <button
                onClick={() => openGoogleMaps(selected)}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-xs font-semibold shadow hover:bg-primary/90 transition-colors z-10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Navigate in Google Maps
              </button>
            </div>

            {/* ── Pickup → Destination ── */}
            <div className="p-5 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Delivery Route
              </h3>

              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="h-3 w-3 rounded-full bg-primary border-2 border-primary" />
                  <div className="w-0.5 h-8 bg-border" />
                  <div className="h-3 w-3 rounded-full bg-secondary border-2 border-secondary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                      📦 Pickup Location (Sender's Address)
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selected.pickup_location.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                      🏁 Destination (User's Drop Address)
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {selected.drop_location.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Details ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Sender Info Card */}
            {sender && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" /> Sender Details
                </h3>
                <div className="flex items-center gap-3">
                  <img
                    src={sender.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.name)}&background=1f5e5b&color=fff`}
                    alt={sender.name}
                    className="h-12 w-12 rounded-full border border-border object-cover"
                  />
                  <div>
                    <p className="font-semibold">{sender.name}</p>
                    <p className="text-xs text-muted-foreground">{sender.email}</p>
                    {sender.phone && (
                      <p className="text-xs text-muted-foreground">{sender.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Package Info */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Package Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Item Name</span>
                  <span className="text-sm font-semibold text-right max-w-[180px]">{selected.item_name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <span className="text-sm text-right max-w-[180px] text-muted-foreground">{selected.item_description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deliver By</span>
                  <span className="text-sm font-semibold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(selected.delivery_date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Your Earnings</span>
                  <span className="text-base font-bold text-secondary flex items-center gap-0.5">
                    <IndianRupee className="h-4 w-4" />
                    {selected.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-5">Delivery Progress</h3>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
                <div
                  className="absolute left-4 top-4 w-0.5 bg-primary transition-all duration-700"
                  style={{
                    height: stepIdx > 0
                      ? `${(stepIdx / (statusSteps.length - 1)) * 100}%`
                      : '0%'
                  }}
                />
                <div className="space-y-5">
                  {statusSteps.map((step, i) => {
                    const done = stepIdx >= i;
                    const current = stepIdx === i;
                    return (
                      <div key={step.key} className="flex items-start gap-4 relative z-10">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          done
                            ? 'bg-primary border-primary text-white'
                            : 'bg-card border-border text-muted-foreground'
                        }`}>
                          {done ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-bold">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className={`text-sm font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                            {current && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
