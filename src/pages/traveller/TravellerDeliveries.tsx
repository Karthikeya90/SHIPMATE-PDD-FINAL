import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  IndianRupee,
  CheckCircle,
  Loader2,
  Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest } from '../../data/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function TravellerDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!user) return;
    deliveryService.getRequestsForTraveller(user.user_id).then((data) => {
      setDeliveries(data);
      setIsLoading(false);
    });
  }, [user]);

  const active = deliveries.filter((r) => ['matched', 'picked_up', 'in_transit'].includes(r.status));
  const completed = deliveries.filter((r) => r.status === 'delivered');
  const displayed = activeTab === 'active' ? active : completed;

  const handleMarkDelivered = async (req: DeliveryRequest) => {
    if (!user) return;
    setUpdatingId(req.request_id);
    try {
      await deliveryService.markDelivered(req.request_id, user.user_id);
      toast.success(`✅ Delivery complete! ₹${req.price.toLocaleString('en-IN')} added to earnings.`);
      const updated = await deliveryService.getRequestsForTraveller(user.user_id);
      setDeliveries(updated);
    } catch {
      toast.error('Failed to mark as delivered');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor: Record<string, string> = {
    matched: 'bg-purple-500/10 text-purple-600',
    picked_up: 'bg-secondary/10 text-secondary',
    in_transit: 'bg-primary/10 text-primary',
    delivered: 'bg-green-500/10 text-green-600'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-1">My Deliveries</h1>
        <p className="text-muted-foreground">Manage your accepted and completed deliveries.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab} ({tab === 'active' ? active.length : completed.length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold mb-2">
            {activeTab === 'active' ? 'No active deliveries' : 'No completed deliveries yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'active' ? 'Accept a delivery request to get started.' : 'Completed deliveries will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((req, i) => (
            <motion.div
              key={req.request_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base">{req.item_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${statusColor[req.status] || ''}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{req.item_description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{req.pickup_location.address.split(',')[0]}</span>
                    <span>→</span>
                    <span className="truncate">{req.drop_location.address.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-0.5 text-sm font-bold text-secondary">
                      <IndianRupee className="h-3.5 w-3.5" />{req.price.toLocaleString('en-IN')}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(req.delivery_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>

                {activeTab === 'active' && (
                  <div className="flex sm:flex-col gap-2 sm:items-end justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4">
                    <button
                      onClick={() => handleMarkDelivered(req)}
                      disabled={updatingId === req.request_id}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-60"
                    >
                      {updatingId === req.request_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Mark Delivered
                    </button>
                  </div>
                )}

                {activeTab === 'completed' && (
                  <div className="flex sm:flex-col gap-2 sm:items-end justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4">
                    <div className="flex items-center gap-1 font-bold text-green-600 text-lg">
                      <IndianRupee className="h-4 w-4" />
                      {req.price.toLocaleString('en-IN')}
                    </div>
                    <p className="text-xs text-green-600 font-semibold">Earned ✓</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
