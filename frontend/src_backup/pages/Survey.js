import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurvey } from '../api';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Survey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interests: [],
    budget: '',
    travel_style: '',
    past_travels: [],
  });

  const interestOptions = ['Beach', 'Adventure', 'Culture', 'Nature', 'Food', 'History', 'Luxury', 'Wildlife', 'Photography', 'Relaxation'];
  const budgetOptions = ['budget', 'moderate', 'expensive', 'luxury'];
  const travelStyleOptions = ['Solo', 'Couple', 'Family', 'Friends', 'Business'];
  const pastTravelOptions = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania', 'Middle East'];

  const totalSteps = 4;

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handlePastTravelToggle = (region) => {
    setFormData((prev) => ({
      ...prev,
      past_travels: prev.past_travels.includes(region)
        ? prev.past_travels.filter((r) => r !== region)
        : [...prev.past_travels, region],
    }));
  };

  const handleNext = () => {
    if (step === 1 && formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    if (step === 2 && !formData.budget) {
      toast.error('Please select a budget level');
      return;
    }
    if (step === 3 && !formData.travel_style) {
      toast.error('Please select a travel style');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (formData.past_travels.length === 0) {
      toast.error('Please select at least one region you\'ve visited or want to skip');
      return;
    }

    setLoading(true);
    try {
      await submitSurvey(formData);
      toast.success('Survey submitted successfully!');
      setFormData({ interests: [], budget: '', travel_style: '', past_travels: [] });
      navigate('/thank-you');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit survey');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            data-testid="survey-step-1"
          >
            <h2 className="font-heading text-3xl font-bold text-secondary mb-3">What are your interests?</h2>
            <p className="text-gray-600 mb-8">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  data-testid={`interest-${interest.toLowerCase()}`}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 font-medium ${
                    formData.interests.includes(interest)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            data-testid="survey-step-2"
          >
            <h2 className="font-heading text-3xl font-bold text-secondary mb-3">What's your budget?</h2>
            <p className="text-gray-600 mb-8">Choose your preferred budget level</p>
            <div className="space-y-4">
              {budgetOptions.map((budget) => (
                <button
                  key={budget}
                  data-testid={`budget-${budget}`}
                  onClick={() => setFormData({ ...formData, budget })}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                    formData.budget === budget
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-white hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-lg capitalize mb-1">{budget}</div>
                  <div className="text-sm text-gray-600">
                    {budget === 'budget' && 'Affordable options for budget travelers'}
                    {budget === 'moderate' && 'Comfortable mid-range experiences'}
                    {budget === 'expensive' && 'Premium travel experiences'}
                    {budget === 'luxury' && 'Ultimate luxury and exclusivity'}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            data-testid="survey-step-3"
          >
            <h2 className="font-heading text-3xl font-bold text-secondary mb-3">How do you travel?</h2>
            <p className="text-gray-600 mb-8">Select your travel style</p>
            <div className="space-y-4">
              {travelStyleOptions.map((style) => (
                <button
                  key={style}
                  data-testid={`travel-style-${style.toLowerCase()}`}
                  onClick={() => setFormData({ ...formData, travel_style: style })}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left font-medium text-lg ${
                    formData.travel_style === style
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            data-testid="survey-step-4"
          >
            <h2 className="font-heading text-3xl font-bold text-secondary mb-3">Where have you been?</h2>
            <p className="text-gray-600 mb-8">Select regions you've visited</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pastTravelOptions.map((region) => (
                <button
                  key={region}
                  data-testid={`past-travel-${region.toLowerCase().replace(' ', '-')}`}
                  onClick={() => handlePastTravelToggle(region)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 font-medium ${
                    formData.past_travels.includes(region)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div data-testid="survey-page" className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              data-testid="survey-back-button"
              className="bg-transparent border border-secondary text-secondary rounded-full px-8 py-3 hover:bg-secondary hover:text-white transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          )}
          
          <div className="flex-1"></div>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              data-testid="survey-next-button"
              className="bg-primary text-white rounded-full px-8 py-3 hover:bg-[#A04B32] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium flex items-center gap-2"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              data-testid="survey-submit-button"
              disabled={loading}
              className="bg-primary text-white rounded-full px-8 py-3 hover:bg-[#A04B32] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Survey;