import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryRequest, User } from '../../data/types';


export function DeliveryTracking() {
  const { id } = useParams<{
    id: string;
  }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [traveller, setTraveller] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) {
          if (!user) return;
          const reqs = await deliveryService.getRequestsForSender(user.user_id);
          const active = reqs.filter(r => ['requested', 'matched', 'picked_up', 'in_transit', 'delivered'].includes(r.status));
          if (active.length > 0) {
            const req = active[0];
            setRequest(req);
            if (req.traveller_id) {
              const t = await deliveryService.getUserById(req.traveller_id);
              if (t) setTraveller(t);
            }
          }
          return;
        }
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
  }, [id, user]);

  const statuses = ['requested', 'matched', 'picked_up', 'in_transit', 'delivered'];
  const currentStatusIndex = request ? statuses.indexOf(request.status) : -1;

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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Status */}
        <div className="space-y-6">

          {/* Timeline */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-6">Delivery Status</h3>
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-700"
                style={{
                  height: currentStatusIndex >= 4
                    ? 'calc(100% - 20px)'
                    : currentStatusIndex >= 2
                    ? 'calc(50% - 10px)'
                    : currentStatusIndex >= 1
                    ? '0%'
                    : '0%'
                }}
              />
              <div className="space-y-6">
              {[
              {
                statusIndex: 1,
                id: 'matched',
                label: 'Accepted',
                desc: traveller ? 'Request accepted by traveller' : 'Waiting for traveller to accept',
                icon: CheckCircle2
              },
              {
                statusIndex: 2,
                id: 'picked_up',
                label: 'Picked Up',
                desc: 'Package collected from sender',
                icon: Package
              },
              {
                statusIndex: 4,
                id: 'delivered',
                label: 'Delivered',
                desc: 'Package delivered successfully',
                icon: CheckCircle2
              }].
              map((step) => {
                const isCompleted = currentStatusIndex >= step.statusIndex;
                const showCurrentBadge =
                  (step.id === 'picked_up' && currentStatusIndex === 1) ||
                  (step.id === 'delivered' && currentStatusIndex >= 4);

                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-4 relative z-10">

                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 shadow-sm transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-card border-border text-muted-foreground'
                      }`}>
                      <step.icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-semibold ${
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </h4>
                        {showCurrentBadge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">
                            Current
                          </span>
                        )}
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