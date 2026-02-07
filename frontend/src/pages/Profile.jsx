import React, { useState, useEffect } from 'react';
import { getSavedDestinations, getProfile } from '@/api';
import { toast } from 'sonner';
import { User, Heart, MapPin, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import DestinationCard from '@/components/DestinationCard';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, savedData] = await Promise.all([
          getProfile(),
          getSavedDestinations()
        ]);
        setProfile(profileData || {});
        setSavedDestinations(savedData || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshSavedDestinations = async () => {
    try {
      const savedData = await getSavedDestinations();
      setSavedDestinations(savedData || []);
    } catch (error) {
      console.error('Error refreshing saved destinations:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div data-testid="profile-page" className="min-h-screen px-6 md:px-12 lg:px-24 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-border"
        >
          <div className="flex items-start gap-6">
            <div className="bg-primary/10 rounded-full p-6">
              <User className="w-12 h-12 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-4xl font-bold text-foreground mb-2 tracking-tight">
                {profile?.user?.name}
              </h1>
              <p className="text-muted-foreground mb-4">{profile?.user?.email}</p>

              <div className="flex gap-6 mt-6">
                <div className="bg-muted px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground">Saved</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{profile?.saved_destinations_count || 0}</p>
                </div>

                {profile?.preferences && (
                  <div className="bg-muted px-6 py-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      <span className="text-sm text-muted-foreground">Travel Style</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground capitalize">{profile.preferences.travel_style}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          {profile?.preferences && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Your Preferences</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferences?.interests?.map((interest, idx) => (
                      <span key={idx} className="bg-muted px-4 py-2 rounded-full text-sm font-medium text-foreground">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-3">Budget</h3>
                  <span className="bg-muted px-4 py-2 rounded-full text-sm font-medium text-foreground capitalize">
                    {profile.preferences.budget}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-3">Regions Visited</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferences?.past_travels?.map((region, idx) => (
                      <span key={idx} className="bg-muted px-4 py-2 rounded-full text-sm font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" strokeWidth={1.5} />
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Saved Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl font-bold text-foreground">Saved Destinations</h2>
          </div>

          {savedDestinations.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-muted-foreground mb-4">You haven't saved any destinations yet</p>
              <a
                href="/recommendations"
                className="text-primary hover:opacity-80 font-medium"
              >
                Explore Recommendations
              </a>
            </div>
          ) : (
            <div data-testid="profile-saved-destinations" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {savedDestinations?.length > 0 && savedDestinations.map((destination, idx) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <DestinationCard
                    destination={destination}
                    showSaveButton={true}
                    onSaveChange={refreshSavedDestinations}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;