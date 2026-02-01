import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../api';
import { toast } from 'sonner';
import { Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DestinationCard from '../components/DestinationCard';
import MapPlaceholder from '../components/MapPlaceholder';

const Recommendations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setDestinations(data || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        if (error.response?.status === 400) {
          setError('Please complete the survey first to get recommendations.');
        } else {
          setError('Failed to load recommendations. Please try again.');
        }
        toast.error(error.response?.data?.detail || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div data-testid="recommendations-loading" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Generating your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="recommendations-error" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-muted-foreground mb-6">{error}</p>
          <a
            href="/survey"
            className="bg-primary text-white rounded-full px-8 py-3 hover:bg-[#A04B32] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium inline-block"
          >
            Take Survey
          </a>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="recommendations-page" className="min-h-screen px-6 md:px-12 lg:px-24 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="font-mono text-xs uppercase tracking-wide text-primary">Your Personalized Picks</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Recommended Destinations
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Based on your preferences, we've curated these perfect destinations for your next adventure.
          </p>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Map View</h2>
          </div>
          <MapPlaceholder destinations={destinations} />
        </motion.div>

        {/* Destinations Grid */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">All Recommendations</h2>
          {destinations.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No recommendations found. Please try updating your survey.</p>
          ) : (
            <div data-testid="recommendations-grid" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {destinations?.length > 0 && destinations.map((destination, idx) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <DestinationCard destination={destination} showSaveButton={true} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;