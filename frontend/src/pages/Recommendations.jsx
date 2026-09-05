import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAiRecommendations, getSavedDestinations } from '@/api.jsx';
import { toast } from 'sonner';
import { Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DestinationCard from '@/components/DestinationCard.jsx';
import MapPlaceholder from '@/components/MapPlaceholder.jsx';
import ActionButton from '@/components/ActionButton.jsx';

const Recommendations = () => {
  const MotionDiv = motion.div;
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [additionalRecommendations, setAdditionalRecommendations] = useState([]);
  const [fromCache, setFromCache] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [data, savedData] = await Promise.all([
          getAiRecommendations(),
          getSavedDestinations().catch(() => ({ data: [] }))
        ]);
        setAiRecommendations(data.aiRecommendations || []);
        setAdditionalRecommendations(data.additionalRecommendations || []);
        setFromCache(data.fromCache || false);
        const ids = new Set(
          (Array.isArray(savedData?.data) ? savedData.data : []).map(d => d._id || d.id)
        );
        setSavedIds(ids);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        if (error.response?.status === 400) {
          toast.error('Please complete the survey first to get recommendations.');
          navigate('/survey', { replace: true });
          return;
        } else {
          setError('Failed to load recommendations. Please try again.');
          toast.error(error.response?.data?.message || 'Failed to load recommendations');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate]);


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
          <ActionButton to="/survey">
            Take Survey
          </ActionButton>
        </div>
      </div>
    );
  }

  const allDestinations = [...aiRecommendations, ...additionalRecommendations];

  return (
    <div data-testid="recommendations-page" className="min-h-screen px-6 md:px-12 lg:px-24 py-20">
      <div className="max-w-7xl mx-auto">
        <MotionDiv
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
        </MotionDiv>

        {/* Map Section */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Map View</h2>
          </div>
          <MapPlaceholder destinations={allDestinations} />
        </MotionDiv>

        {/* AI Recommendations */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary fill-primary/10" strokeWidth={1.5} />
            <h2 className="font-heading text-2xl font-bold text-foreground">AI Recommended</h2>
            {fromCache && (
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono font-medium">
                Cached Result
              </span>
            )}
          </div>
          {aiRecommendations.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 border border-dashed border-border rounded-2xl">No AI recommendations found. Try updating your survey preferences.</p>
          ) : (
            <div data-testid="ai-recommendations-grid" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {aiRecommendations.map((destination, idx) => (
                <MotionDiv
                  key={destination._id || destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <DestinationCard
                    destination={destination}
                    showSaveButton={true}
                    isSaved={savedIds.has(destination._id || destination.id)}
                    isAiRecommended={true}
                  />
                </MotionDiv>
              ))}
            </div>
          )}
        </div>

        {/* Additional Recommendations */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">More Destinations For You</h2>
          {additionalRecommendations.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 border border-dashed border-border rounded-2xl">No additional matching destinations found.</p>
          ) : (
            <div data-testid="additional-recommendations-grid" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {additionalRecommendations.map((destination, idx) => (
                <MotionDiv
                  key={destination._id || destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <DestinationCard
                    destination={destination}
                    showSaveButton={true}
                    isSaved={savedIds.has(destination._id || destination.id)}
                    isAiRecommended={false}
                  />
                </MotionDiv>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;

