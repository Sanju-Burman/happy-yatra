import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDestination, saveDestination, unsaveDestination, getSavedDestinations } from '../api';
import { toast } from 'sonner';
import { MapPin, Heart, ArrowLeft, DollarSign, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import MapPlaceholder from '../components/MapPlaceholder';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destData, savedData] = await Promise.all([
          getDestination(id),
          getSavedDestinations()
        ]);
        setDestination(destData);
        setIsSaved(savedData.some(d => d.id === id));
      } catch (error) {
        console.error('Error fetching destination:', error);
        toast.error('Failed to load destination details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSaveToggle = async () => {
    setSavingState(true);
    try {
      if (isSaved) {
        await unsaveDestination(id);
        setIsSaved(false);
        toast.success('Removed from saved destinations');
      } else {
        await saveDestination(id);
        setIsSaved(true);
        toast.success('Added to saved destinations');
      }
    } catch (error) {
      toast.error('Failed to update saved status');
    } finally {
      setSavingState(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading destination...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Destination not found</p>
      </div>
    );
  }

  return (
    <div data-testid="destination-detail-page" className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={destination.image_url}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          data-testid="destination-back-button"
          className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-6 h-6 text-secondary" strokeWidth={1.5} />
        </button>

        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          disabled={savingState}
          data-testid="destination-save-button"
          className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-all shadow-lg disabled:opacity-50"
        >
          <Heart
            className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-secondary'}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
              <span className="text-white font-mono text-sm uppercase tracking-wide">{destination.country}</span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              {destination.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-heading text-3xl font-bold text-secondary mb-4">About</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">{destination.description}</p>

              <h3 className="font-heading text-2xl font-bold text-secondary mb-4">Location</h3>
              <MapPlaceholder destinations={[destination]} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#F2EFE9] p-8 rounded-xl sticky top-24"
            >
              <h3 className="font-heading text-2xl font-bold text-secondary mb-6">Details</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="font-medium text-gray-700">Budget Level</span>
                  </div>
                  <span className="inline-block bg-white px-4 py-2 rounded-lg text-sm font-medium text-secondary capitalize">
                    {destination.budget_level}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="font-medium text-gray-700">Category</span>
                  </div>
                  <span className="inline-block bg-white px-4 py-2 rounded-lg text-sm font-medium text-secondary">
                    {destination.category}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="font-medium text-gray-700">Best For</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {destination.best_for.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-3 py-1 rounded-full text-xs font-medium text-secondary capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;