import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { saveDestination, unsaveDestination, getSavedDestinations } from '../api';
import { toast } from 'sonner';

const DestinationCard = ({ destination, showSaveButton, onSaveChange }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (showSaveButton) {
        try {
          const savedData = await getSavedDestinations();
          setIsSaved(savedData.some(d => d.id === destination.id));
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    checkSavedStatus();
  }, [destination.id, showSaveButton]);

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    setSavingState(true);
    
    try {
      if (isSaved) {
        await unsaveDestination(destination.id);
        setIsSaved(false);
        toast.success('Removed from saved destinations');
      } else {
        await saveDestination(destination.id);
        setIsSaved(true);
        toast.success('Added to saved destinations');
      }
      if (onSaveChange) {
        onSaveChange();
      }
    } catch (error) {
      toast.error('Failed to update saved status');
    } finally {
      setSavingState(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/destination/${destination.id}`);
  };

  return (
    <div
      data-testid={`destination-card-${destination.id}`}
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-200">
        <img
          src={destination.image_url}
          alt={destination.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 lazy-image ${imageLoaded ? 'loaded' : ''}`}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Save Button */}
        {showSaveButton && (
          <button
            onClick={handleSaveToggle}
            disabled={savingState}
            data-testid={`save-button-${destination.id}`}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all shadow-lg z-10 disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
              strokeWidth={1.5}
            />
          </button>
        )}

        {/* Trending Badge */}
        {destination.trending && (
          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
            Trending
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-1 mb-2 text-white/90">
            <MapPin className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-mono uppercase tracking-wide">{destination.country}</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-white mb-2 tracking-tight">
            {destination.name}
          </h3>
          <p className="text-white/80 text-sm line-clamp-2">{destination.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
              {destination.category}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
              {destination.budget_level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;