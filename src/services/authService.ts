import { User, Role } from '../data/types';
import { supabase } from '../lib/supabase';

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) throw new Error(error.message);

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw new Error('Failed to load profile');

    const user: User = {
      user_id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || undefined,
      city: profile.city || undefined,
      role: profile.role as Role,
      profile_image: profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1f5e5b&color=fff`,
      location: profile.location_lat ? {
        lat: profile.location_lat,
        lng: profile.location_lng,
        address: profile.location_address || ''
      } : undefined,
      created_at: profile.created_at
    };

    return { user, token: data.session.access_token };
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: Role
  ): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');

    const user: User = {
      user_id: data.user.id,
      name,
      email: normalizedEmail,
      role,
      profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f5e5b&color=fff`,
      created_at: new Date().toISOString()
    };

    return { user, token: data.session?.access_token || '' };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return null;

    return {
      user_id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || undefined,
      city: profile.city || undefined,
      role: profile.role as Role,
      profile_image: profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1f5e5b&color=fff`,
      location: profile.location_lat ? {
        lat: profile.location_lat,
        lng: profile.location_lng,
        address: profile.location_address || ''
      } : undefined,
      created_at: profile.created_at
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async updateProfile(userId: string, fields: Partial<User>): Promise<void> {
    const updateData: Record<string, any> = {};
    if (fields.name) updateData.name = fields.name;
    if (fields.phone) updateData.phone = fields.phone;
    if (fields.city) updateData.city = fields.city;
    if (fields.profile_image) updateData.profile_image = fields.profile_image;
    if (fields.location) {
      updateData.location_lat = fields.location.lat;
      updateData.location_lng = fields.location.lng;
      updateData.location_address = fields.location.address;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw new Error('Failed to update profile');
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }
};