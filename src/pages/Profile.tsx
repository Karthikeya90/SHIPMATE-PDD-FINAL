import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, MapPin, Save, ArrowLeft, Check, Camera, Loader2, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const AVATAR_TEMPLATES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop'
];

export function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.location?.address || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profile_image || AVATAR_TEMPLATES[0]);
  const [isSaving, setIsSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    fastShipping: true,
    fragileHandling: false,
    flexibleSchedule: true,
    highValue: false
  });

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      await updateUser({
        name,
        email,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        profile_image: selectedAvatar,
        location: {
          lat: user?.location?.lat || 19.0760,
          lng: user?.location?.lng || 72.8777,
          address: address.trim() || city.trim()
        }
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Back Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-full bg-card hover:bg-muted text-foreground border border-border transition-colors flex items-center justify-center"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">
            Personal Details
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings, avatar, and delivery preferences
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-soft">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Picture Picker */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-muted/30 p-5 rounded-2xl border border-border">
              <div className="relative group">
                <img
                  src={selectedAvatar}
                  alt="Selected Avatar"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-3">
                  Choose a picture from our library of curated avatars:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_TEMPLATES.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative rounded-full h-11 w-11 overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedAvatar === avatar ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border'
                      }`}
                    >
                      <img src={avatar} alt={`Avatar ${index + 1}`} className="h-full w-full object-cover" />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info Fields */}
          <div className="space-y-5">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" /> Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  placeholder="Mumbai, Delhi, Bengaluru..."
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Home / Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2">
              Shipment & Delivery Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'fastShipping', label: 'Express Shipping', desc: 'Prefer same day or express matching.' },
                { key: 'fragileHandling', label: 'Fragile Carrier', desc: 'Capable/Prefer handling fragile items.' },
                { key: 'flexibleSchedule', label: 'Flexible Timing', desc: 'Accept packages with extended delivery times.' },
                { key: 'highValue', label: 'Secure/High Value', desc: 'Verified for handling electronics or high-cost goods.' }
              ].map((pref) => {
                const checked = preferences[pref.key as keyof typeof preferences];
                return (
                  <div
                    key={pref.key}
                    onClick={() => handlePreferenceToggle(pref.key as keyof typeof preferences)}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                      checked ? 'bg-primary/5 border-primary/40' : 'bg-background border-border hover:bg-muted/30'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        checked ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{pref.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pref.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-glow flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
