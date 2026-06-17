import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, IndianRupee, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest } from '../../data/types';
import { format } from 'date-fns';

export function SenderHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    deliveryService.getDeliveryHistory(user.user_id).then((data) => {
      setHistory(data);
      setIsLoading(false);
    });
  }, [user]);

  const totalSpent = history.reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Delivery History</h1>
          <p className="text-muted-foreground">All your completed deliveries.</p>
        </div>
        {history.length > 0 && (
          <div className="bg-card border border-border rounded-2xl px-5 py-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
              <p className="font-bold">{history.length} completed &nbsp;·&nbsp; ₹{totalSpent.toLocaleString('en-IN')} paid</p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold mb-2">No history yet</h3>
          <p className="text-muted-foreground text-sm">Completed deliveries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((req, i) => (
            <motion.div
              key={req.request_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-green-500/20 rounded-2xl p-5 hover:border-green-500/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{req.item_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[180px]">{req.pickup_location.address.split(',')[0]}</span>
                      <span>→</span>
                      <span className="truncate max-w-[180px]">{req.drop_location.address.split(',')[0]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(req.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-0.5 font-bold text-lg text-green-600">
                    <IndianRupee className="h-4 w-4" />
                    {req.price.toLocaleString('en-IN')}
                  </div>
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-bold rounded-full">
                    Delivered ✓
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
