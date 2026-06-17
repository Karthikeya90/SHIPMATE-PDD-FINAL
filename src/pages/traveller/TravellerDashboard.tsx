import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  IndianRupee,
  Package,
  ArrowRight,
  CheckCircle2,
  Search,
  ChevronDown,
  Loader2 } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest, TravellerDetails } from '../../data/types';

import { format } from 'date-fns';
import { toast } from 'sonner';

type StatusOption = 'picked_up' | 'in_transit' | 'delivered';

const STATUS_FLOW: StatusOption[] = ['picked_up', 'in_transit', 'delivered'];

export function TravellerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [details, setDetails] = useState<TravellerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDetails({
        traveller_id: user.user_id,
        routes: [],
        availability: true,
        rating: 4.5,
        earnings: 0,
        completed_deliveries: 0
      });
      deliveryService.getRequestsForTraveller(user.user_id).then((data) => {
        setRequests(data);
        setIsLoading(false);
      });
    }
  }, [user]);

  const activeDeliveries = requests.filter((r) =>
  ['matched', 'picked_up', 'in_transit'].includes(r.status)
  );
  const completedDeliveries = requests.filter((r) => r.status === 'delivered');

  const handleStatusUpdate = async (req: DeliveryRequest, newStatus: StatusOption) => {
    if (!user) return;
    setUpdatingId(req.request_id);
    setOpenStatusId(null);
    try {
      if (newStatus === 'delivered') {
        await deliveryService.markDelivered(req.request_id, user.user_id);
        toast.success(`🎉 Delivery completed! ₹${req.price.toLocaleString('en-IN')} added to your earnings.`);
        // Refresh details to show updated earnings
        setDetails((prev) => prev ? {
          ...prev,
          completed_deliveries: prev.completed_deliveries + 1,
          earnings: prev.earnings + req.price
        } : null);
      } else {
        await deliveryService.updateRequestStatus(req.request_id, newStatus);
        toast.success(`Status updated to "${newStatus.replace('_', ' ')}"`);
      }
      // Refresh requests
      const updated = await deliveryService.getRequestsForTraveller(user.user_id);
      setRequests(updated);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };


  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Welcome, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to hit the road and earn?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Availability:
          </span>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${details?.availability ? 'bg-green-500' : 'bg-muted'}`}>
            
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${details?.availability ? 'translate-x-6' : 'translate-x-1'}`} />
            
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </p>
              <p className="text-2xl font-bold">
                ₹{(details?.earnings || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Deliveries
              </p>
              <p className="text-2xl font-bold">{activeDeliveries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-bold">{completedDeliveries.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content: Active Deliveries */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">
              Your Active Deliveries
            </h2>
            <Link
              to="/traveller/deliveries"
              className="text-sm text-primary hover:underline">
              
              View all
            </Link>
          </div>

          {isLoading ?
          <div className="space-y-4">
              {[1, 2].map((i) =>
            <div
              key={i}
              className="h-32 bg-card border border-border rounded-2xl animate-pulse">
            </div>
            )}
            </div> :
          activeDeliveries.length > 0 ?
          <div className="space-y-4">
              {activeDeliveries.map((req, i) =>
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
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors flex flex-col sm:flex-row gap-4">
            
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{req.item_name}</h3>
                      <span className="text-sm font-bold text-secondary">
                        ₹{req.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">
                        {req.pickup_location.address.split(',')[0]}
                      </span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">
                        {req.drop_location.address.split(',')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between sm:items-end border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4 gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md uppercase tracking-wider w-fit">
                      {req.status.replace('_', ' ')}
                    </span>

                    {/* Status Update Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenStatusId(openStatusId === req.request_id ? null : req.request_id)}
                        disabled={updatingId === req.request_id}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                      >
                        {updatingId === req.request_id ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Updating...</>
                        ) : (
                          <><span>Update Status</span><ChevronDown className="h-3 w-3" /></>
                        )}
                      </button>
                      {openStatusId === req.request_id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenStatusId(null)} />
                          <div className="absolute right-0 mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg py-1 z-20">
                            {STATUS_FLOW.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(req, status)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors capitalize ${
                                  req.status === status ? 'text-primary font-semibold' : 'text-foreground'
                                }`}
                              >
                                {status === 'delivered' ? '✅ Mark Delivered' : status.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}
            </div> :

          <div className="bg-card border border-border border-dashed rounded-2xl p-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No active deliveries</h3>
              <p className="text-muted-foreground text-sm mb-4">
                You don't have any deliveries in progress.
              </p>
              <Link
              to="/traveller/available"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
              
                <Search className="h-4 w-4" /> Find Deliveries
              </Link>
            </div>
          }
        </div>

        {/* Sidebar: Routes & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Your Routes</h3>
            {details?.routes && details.routes.length > 0 ?
            <div className="space-y-4">
                {details.routes.map((route, i) =>
              <div
                key={i}
                className="bg-background rounded-xl p-3 border border-border">
              
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div className="h-4 w-px bg-border"></div>
                        <div className="h-2 w-2 rounded-full bg-secondary"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium truncate">
                          {route.from.address.split(',')[0]}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {route.to.address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {format(new Date(route.date), 'MMM d, yyyy')}
                    </p>
                  </div>
              )}
                <button className="w-full py-2 text-sm font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors">
                  Add New Route
                </button>
              </div> :

            <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Add your travel routes to get matched with deliveries.
                </p>
                <button className="w-full py-2 text-sm font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors">
                  Add Route
                </button>
              </div>
            }
          </div>

          <div className="bg-gradient-to-br from-secondary/20 to-card border border-secondary/20 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Find Deliveries</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse available requests near you or along your routes.
            </p>
            <Link
              to="/traveller/available"
              className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-xl font-medium hover:bg-secondary/90 transition-colors shadow-sm">
              
              <Search className="h-4 w-4" /> Browse Requests
            </Link>
          </div>
        </div>
      </div>
    </div>);

}