import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2 } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
// Mock map component since we can't easily do interactive Leaflet picking in a short file without complex state
const LocationPicker = ({
  label,
  value,
  onChange




}: {label: string;value: string;onChange: (v: string) => void;}) =>
<div className="space-y-2">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      placeholder="Enter address..."
      required />
    
    </div>
    {/* Mock Map Visual */}
    <div className="h-32 bg-muted rounded-xl border border-border mt-2 relative overflow-hidden flex items-center justify-center">
      <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}>
    </div>
      <MapPin className="h-8 w-8 text-primary relative z-10 animate-bounce" />
    </div>
  </div>;

async function geocodeAddress(address: string, isDrop = false): Promise<{ lat: number; lng: number }> {
  const cleanQuery = (q: string) => {
    return q
      .replace(/collage/gi, 'college')
      .replace(/collaga/gi, 'college')
      .replace(/sathyabhama/gi, 'sathyabama')
      .trim();
  };

  // Hardcoded locations for common demo colleges
  const lcQuery = address.toLowerCase();
  if (lcQuery.includes('saveetha') && lcQuery.includes('chennai')) {
    return { lat: 13.0270, lng: 79.9958 }; // Saveetha Engineering College
  }
  if (lcQuery.includes('srm') && lcQuery.includes('chennai')) {
    return { lat: 12.8231, lng: 80.0453 }; // SRM University
  }


  const attemptGeocode = async (q: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Shipmate-App/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (e) {
      console.error('Geocoding error for query:', q, e);
    }
    return null;
  };

  // Step 1: Try the exact query with spelling corrections
  const q1 = cleanQuery(address);
  let coords = await attemptGeocode(q1);
  if (coords) return coords;

  // Step 2: Try stripping "college", "collage", "collaga", "university"
  const q2 = q1
    .replace(/college/gi, '')
    .replace(/university/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  coords = await attemptGeocode(q2);
  if (coords) return coords;

  // Step 3: Try first word + "chennai"
  const words = q2.split(/[\s,]+/);
  if (words.length > 0 && words[0].length > 2) {
    const q3 = `${words[0]} chennai`;
    coords = await attemptGeocode(q3);
    if (coords) return coords;

    // Step 4: Try just the first word
    const q4 = words[0];
    coords = await attemptGeocode(q4);
    if (coords) return coords;
  }

  // Step 5: Fallback coordinates in Chennai with offset if it is the dropoff
  return isDrop 
    ? { lat: 13.1227, lng: 80.3107 } 
    : { lat: 13.0827, lng: 80.2707 };
}

export function CreateRequest() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    itemDescription: '',
    pickupAddress: '',
    dropAddress: '',
    date: '',
    price: ''
  });
  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  const handleSubmit = async () => {
    if (!user) return;
    
    // Validate inputs
    if (!formData.itemName || !formData.pickupAddress || !formData.dropAddress || !formData.date || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Diagnostic check to see if profile exists in database
      const { data: profileCheck, error: checkError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', user.user_id)
        .single();
      console.log('Diagnostic - Profile check:', profileCheck, checkError);

      // Geocode addresses to retrieve real coordinates with fallback safety
      const pickupCoords = await geocodeAddress(formData.pickupAddress, false);
      const dropCoords = await geocodeAddress(formData.dropAddress, true);

      const newReq = await deliveryService.createRequest({
        sender_id: user.user_id,
        item_name: formData.itemName,
        item_description: formData.itemDescription,
        pickup_location: {
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
          address: formData.pickupAddress
        },
        drop_location: {
          lat: dropCoords.lat,
          lng: dropCoords.lng,
          address: formData.dropAddress
        },
        delivery_date: new Date(formData.date).toISOString(),
        price: parseFloat(formData.price)
      });
      toast.success('Delivery request created!');
      navigate('/sender/search', {
        state: {
          requestId: newReq.request_id
        }
      });
    } catch (error: any) {
      console.error('Create Request Error:', error);
      toast.error(error?.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };
  const steps = [
  {
    id: 1,
    title: 'Item Details',
    icon: Package
  },
  {
    id: 2,
    title: 'Locations',
    icon: MapPin
  },
  {
    id: 3,
    title: 'Schedule & Price',
    icon: Calendar
  },
  {
    id: 4,
    title: 'Review',
    icon: CheckCircle2
  }];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">
          Create Delivery Request
        </h1>
        <p className="text-muted-foreground">
          Fill in the details to find a traveller for your item.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full -z-10"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
          style={{
            width: `${(step - 1) / 3 * 100}%`
          }}>
        </div>

        {steps.map((s) =>
        <div
          key={s.id}
          className="flex flex-col items-center gap-2 bg-background px-2">
          
            <div
            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
            
              <s.icon className="h-5 w-5" />
            </div>
            <span
            className={`text-xs font-medium hidden sm:block ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
            
              {s.title}
            </span>
          </div>
        )}
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 &&
          <motion.div
            key="step1"
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-6 flex-1">
            
              <h2 className="text-xl font-semibold mb-4">
                What are you sending?
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Item Name</label>
                  <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => updateForm('itemName', e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="e.g. Vintage Camera, Documents" />
                
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description & Instructions
                  </label>
                  <textarea
                  value={formData.itemDescription}
                  onChange={(e) =>
                  updateForm('itemDescription', e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 outline-none min-h-[120px] resize-none"
                  placeholder="Describe the item, size, weight, and any special handling instructions..." />
                
                </div>
              </div>
            </motion.div>
          }

          {step === 2 &&
          <motion.div
            key="step2"
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-6 flex-1">
            
              <h2 className="text-xl font-semibold mb-4">Where is it going?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <LocationPicker
                label="Pickup Location"
                value={formData.pickupAddress}
                onChange={(v) => updateForm('pickupAddress', v)} />
              
                <LocationPicker
                label="Drop-off Location"
                value={formData.dropAddress}
                onChange={(v) => updateForm('dropAddress', v)} />
              
              </div>
            </motion.div>
          }

          {step === 3 &&
          <motion.div
            key="step3"
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-6 flex-1">
            
              <h2 className="text-xl font-semibold mb-4">When and how much?</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => updateForm('date', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none" />
                  
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Offer Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="1500" />
                  
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set a fair price to attract travellers faster.
                  </p>
                </div>
              </div>
            </motion.div>
          }

          {step === 4 &&
          <motion.div
            key="step4"
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-6 flex-1">
            
              <h2 className="text-xl font-semibold mb-4">Review Request</h2>
              <div className="bg-background rounded-2xl p-6 border border-border space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {formData.itemName || 'Unnamed Item'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.itemDescription || 'No description'}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-primary">
                    ₹{formData.price || '0.00'}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        Pickup
                      </p>
                      <p className="text-sm font-medium">
                        {formData.pickupAddress || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        Drop-off
                      </p>
                      <p className="text-sm font-medium">
                        {formData.dropAddress || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        Date
                      </p>
                      <p className="text-sm font-medium">
                        {formData.date || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 4 ?
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-all">
            
              Next <ArrowRight className="h-4 w-4" />
            </button> :

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-glow disabled:opacity-70">
            
              {isSubmitting ?
            <Loader2 className="h-5 w-5 animate-spin" /> :

            'Post Request'
            }
            </button>
          }
        </div>
      </div>
    </div>);

}