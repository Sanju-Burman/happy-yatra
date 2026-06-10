import React, { useState, useEffect } from 'react';
import { getSavedDestinations, getProfile } from '@/api.jsx';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import DestinationCard from '@/components/DestinationCard.jsx';
import ProfileHeader from '@/components/Profile/ProfileHeader.jsx';
import TravelStats from '@/components/Profile/TravelStats.jsx';
import ProfileSettings from '@/components/Profile/ProfileSettings.jsx';
import ChangePassword from '@/components/Profile/ChangePassword.jsx';

const Profile = () => {
  const MotionDiv = motion.div;
  const [profile, setProfile] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const budgetLabels = {
    1: 'budget',
    2: 'moderate',
    3: 'expensive',
    4: 'luxury'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, savedData] = await Promise.all([
          getProfile(),
          getSavedDestinations()
        ]);
        setProfile(profileData || {});
        setSavedDestinations(Array.isArray(savedData?.data) ? savedData.data : []);
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
      setSavedDestinations(Array.isArray(savedData?.data) ? savedData.data : []);
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
    <div data-testid="profile-page" className="min-h-screen overflow-hidden px-4 py-20 sm:px-6 md:px-12 lg:px-24">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(180,89,63,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
      <div className="mx-auto max-w-7xl space-y-8">
        <ProfileHeader
          profile={profile}
          savedDestinationsCount={savedDestinations.length || profile?.saved_destinations_count || 0}
        />

        <TravelStats
          profile={profile}
          savedDestinationsCount={savedDestinations.length || profile?.saved_destinations_count || 0}
        />

        <ProfileSettings
          profile={profile}
          onProfileUpdate={setProfile}
          budgetLabels={budgetLabels}
        />

        <ChangePassword />

        {/* Saved Destinations */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl font-bold text-foreground">Saved Destinations</h2>
          </div>

          {savedDestinations.length === 0 ? (
            <div className="rounded-2xl border border-white/40 bg-card/75 p-8 text-center shadow-lg shadow-black/5 backdrop-blur-xl md:p-12">
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
            <div data-testid="profile-saved-destinations" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedDestinations?.length > 0 && savedDestinations.map((destination, idx) => (
                <MotionDiv
                  key={destination._id || destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <DestinationCard
                    destination={destination}
                    showSaveButton={true}
                    isSaved={true}
                    onSaveChange={refreshSavedDestinations}
                  />
                </MotionDiv>
              ))}
            </div>
          )}
        </MotionDiv>
      </div>
    </div>
  );
};

export default Profile;
