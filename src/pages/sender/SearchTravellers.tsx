import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
  Loader2,
  IndianRupee,
  Users
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { User, TravellerDetails, DeliveryRequest } from '../../data/types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function SearchTravellers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const requestId = location.state?.requestId;

  const [searchQuery, setSearchQuery] = useState('');
  const [allTravellers, setAllTravellers] = useState<(User & Partial<TravellerDetails>)[]>([]);
  const [travellers, setTravellers] = useState<(User & Partial<TravellerDetails>)[]>([]);
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (requestId) {
          const req = await deliveryService.getRequestById(requestId);
          if (req) setRequest(req);
        }
        // Fetch travellers from database
        const fetchedTravellers = await deliveryService.searchTravellers(
          { lat: 0, lng: 0, address: '' },
          { lat: 0, lng: 0, address: '' },
          ''
        );
        const filtered = fetchedTravellers.filter(
          (t) => t.user_id !== currentUser?.user_id
        );
        setAllTravellers(filtered);
        setTravellers(filtered);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [requestId, currentUser]);

  // Live search filter
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    if (!q) {
      setTravellers(allTravellers);
    } else {
      setTravellers(
        allTravellers.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q) ||
            t.city?.toLowerCase().includes(q) ||
            t.location?.address.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, allTravellers]);

  const handleAssign = async (travellerId: string) => {
    if (!requestId) {
      toast.error('No request selected. Create a delivery request first.');
      return;
    }
    setIsAssigning(travellerId);
    try {
      await deliveryService.acceptRequest(requestId, travellerId);
      toast.success('Traveller assigned! They have been notified.');
      navigate('/sender/tracking/' + requestId);
    } catch (error) {
      toast.error('Failed to assign traveller');
      setIsAssigning(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Find a Traveller
          </h1>
          {request ?
          <p className="text-muted-foreground flex items-center gap-2">
              Matching for:{' '}
              <span className="font-medium text-foreground">
                {request.item_name}
              </span>
            </p> :

          <p className="text-muted-foreground">
              Browse all registered travellers in the network.
            </p>
          }
        </div>
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
          {travellers.length} traveller{travellers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-2 flex items-center mb-8 shadow-sm">
        <div className="pl-4 pr-2 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, city, or location..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-foreground py-2 outline-none" />
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-muted-foreground px-3 hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ?
      <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading travellers...</p>
        </div> :
      travellers.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {travellers.map((traveller, i) =>
        <motion.div
          key={traveller.user_id}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: i * 0.08
          }}
          className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all group">
        
              <div className="flex items-start gap-4 mb-5">
                <img
              src={traveller.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(traveller.name)}&background=1f5e5b&color=fff`}
              alt={traveller.name}
              className="h-16 w-16 rounded-full border-2 border-border shadow-sm object-cover" />
            
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold flex items-center gap-1.5">
                      {traveller.name}
                      <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                    </h3>
                    {(traveller.rating || 0) > 0 && (
                      <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-md text-sm font-medium">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {(traveller.rating || 0).toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {traveller.email}
                  </p>
                  {(traveller.city || traveller.location?.address) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {traveller.city || traveller.location?.address?.split(',')[0]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {traveller.completed_deliveries || 0} deliveries completed
                  </p>
                </div>
              </div>

              {/* Route Info */}
              {(traveller.routes?.length || 0) > 0 &&
          <div className="bg-background rounded-xl p-4 border border-border mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Current Route
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div className="h-4 w-px bg-border"></div>
                      <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium truncate">
                        {traveller.routes![0].from.address.split(',')[0]}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {traveller.routes![0].to.address.split(',')[0]}
                      </p>
                    </div>
                  </div>
                </div>
          }

              {/* Earnings hint */}
              {(traveller.earnings || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <IndianRupee className="h-3 w-3" />
                  {(traveller.earnings || 0).toLocaleString('en-IN')} earned total
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  (traveller.availability ?? true) ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {(traveller.availability ?? true) ? '● Available' : '○ Busy'}
                </span>

                {requestId ?
            <button
              onClick={() => handleAssign(traveller.user_id)}
              disabled={isAssigning === traveller.user_id || !(traveller.availability ?? true)}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              
                    {isAssigning === traveller.user_id ?
              <>
                        <Loader2 className="h-4 w-4 animate-spin" />{' '}
                        Assigning...
                      </> :

              <>
                        Request <ArrowRight className="h-4 w-4" />
                      </>
              }
                  </button> :

            <button className="bg-card border border-border text-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-muted transition-all">
                    Message
                  </button>
            }
              </div>
            </motion.div>
        )}
        </div> :

      <div className="text-center py-20 bg-card border border-border rounded-3xl border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No travellers found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'No travellers match your search. Try a different name or city.' : 'No registered travellers yet. Check back soon.'}
          </p>
        </div>
      }
    </div>);

}