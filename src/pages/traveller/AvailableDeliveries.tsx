import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Filter,
  Loader2,
  Package
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest } from '../../data/types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function AvailableDeliveries() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await deliveryService.getAvailableRequests();
        setRequests(data);
      } catch (error) {
        toast.error('Failed to load available deliveries');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  const handleAccept = async (requestId: string) => {
    if (!user) return;
    setAcceptingId(requestId);
    try {
      // Use acceptRequest which notifies the sender automatically
      await deliveryService.acceptRequest(requestId, user.user_id);
      toast.success('Delivery accepted! The sender has been notified.');
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    } catch (error: any) {
      console.error('Accept Delivery Error:', error);
      toast.error(error?.message || 'Failed to accept delivery');
    } finally {
      setAcceptingId(null);
    }
  };
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            Available Deliveries
          </h1>
          <p className="text-muted-foreground">
            Find requests along your route and start earning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {isLoading ?
      <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div> :
      requests.length > 0 ?
      <div className="grid gap-4">
          {requests.map((req, i) =>
        <motion.div
          key={req.request_id}
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: i * 0.05
          }}
          className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors flex flex-col md:flex-row gap-6">
          
              {/* Item Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {req.item_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {req.item_description}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-secondary md:hidden">
                    ₹{req.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pickup
                      </p>
                      <p className="text-sm font-medium">
                        {req.pickup_location.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Drop-off
                      </p>
                      <p className="text-sm font-medium">
                        {req.drop_location.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 md:w-48 shrink-0">
                <div className="hidden md:block text-right">
                  <p className="text-sm text-muted-foreground mb-1">Earn</p>
                  <p className="text-2xl font-bold text-secondary">
                    ₹{req.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground md:hidden">
                  <Calendar className="h-4 w-4" />{' '}
                  {format(new Date(req.delivery_date), 'MMM d')}
                </div>

                <button
              onClick={() => handleAccept(req.request_id)}
              disabled={acceptingId === req.request_id}
              className="w-full md:w-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              
                  {acceptingId === req.request_id ?
              <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Accepting...
                    </> :

              'Accept Request'
              }
                </button>
              </div>
            </motion.div>
        )}
        </div> :

      <div className="text-center py-20 bg-card border border-border rounded-3xl border-dashed">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            There are no available delivery requests matching your criteria
            right now.
          </p>
        </div>
      }
    </div>);

}