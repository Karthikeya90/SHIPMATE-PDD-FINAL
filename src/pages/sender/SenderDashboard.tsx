import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  PlusCircle,
  Search,
  ArrowRight,
  Activity,
  CheckCircle,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest } from '../../data/types';
import { format } from 'date-fns';
export function SenderDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [history, setHistory] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (user) {
      Promise.all([
        deliveryService.getRequestsForSender(user.user_id),
        deliveryService.getDeliveryHistory(user.user_id)
      ]).then(([reqs, hist]) => {
        setRequests(reqs);
        setHistory(hist);
        setIsLoading(false);
      });
    }
  }, [user]);
  const activeRequests = requests.filter((r) =>
  ['requested', 'matched', 'picked_up', 'in_transit'].includes(r.status)
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'matched':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'picked_up':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'in_transit':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your deliveries today.
          </p>
        </div>
        <Link
          to="/sender/create"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-glow w-fit">
          
          <PlusCircle className="h-5 w-5" /> New Delivery
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Deliveries
              </p>
              <p className="text-2xl font-bold">{activeRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-bold">
                {requests.filter((r) => r.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Search className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Matches
              </p>
              <p className="text-2xl font-bold">
                {requests.filter((r) => r.status === 'requested').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">
            Active Deliveries
          </h2>
          <Link
            to="/sender/tracking"
            className="text-sm text-primary hover:underline flex items-center gap-1">
            
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) =>
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-6 h-48 animate-pulse">
          </div>
          )}
          </div> :
        activeRequests.length > 0 ?
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req, i) =>
          <motion.div
            key={req.request_id}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.1
            }}
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors group">
          
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{req.item_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(req.delivery_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <span
              className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(req.status)}`}>
              
                  {req.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3 mb-6 relative">
                <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-border"></div>
                <div className="flex items-start gap-3 relative z-10">
                  <div className="h-5 w-5 rounded-full bg-background border-2 border-primary flex-shrink-0 mt-0.5"></div>
                  <p className="text-sm text-muted-foreground truncate">
                    {req.pickup_location.address}
                  </p>
                </div>
                <div className="flex items-start gap-3 relative z-10">
                  <div className="h-5 w-5 rounded-full bg-background border-2 border-secondary flex-shrink-0 mt-0.5"></div>
                  <p className="text-sm text-muted-foreground truncate">
                    {req.drop_location.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <IndianRupee className="h-4 w-4 text-secondary" />
                  {req.price.toLocaleString('en-IN')}
                </div>
                <Link
              to={`/sender/tracking/${req.request_id}`}
              className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              
                  Track <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}
          </div> :

        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have any deliveries in progress right now. Create a new
              request to get started.
            </p>
            <Link
            to="/sender/create"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-all">
            
              <PlusCircle className="h-5 w-5" /> Create Request
            </Link>
          </div>
        }
      </div>

      {/* Delivery History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Delivery History
            </h2>
            <Link to="/sender/history" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.slice(0, 4).map((req, i) => (
              <motion.div
                key={req.request_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-green-500/20 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{req.item_name}</h3>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded-full">
                    Delivered ✓
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2 truncate">
                  {req.pickup_location.address.split(',')[0]} → {req.drop_location.address.split(',')[0]}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                    <IndianRupee className="h-3.5 w-3.5" />{req.price.toLocaleString('en-IN')} paid
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(req.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>);

}