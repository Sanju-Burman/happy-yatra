import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurvey } from '@/api.jsx';
import { toast } from 'sonner';
import {
  BriefcaseBusiness,
  Camera,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Heart,
  Landmark,
  Leaf,
  Luggage,
  Mountain,
  Palmtree,
  Plane,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  Waves,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionButton from '@/components/ActionButton.jsx';

const Survey = () => {
  const navigate = useNavigate();
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [formData, setFormData] = useState({
    interests: [],
    budget: '',
    travelStyle: '',
    activities: [],
  });

  const loadingMessages = [
    'Analyzing your travel personality...',
    'Finding perfect destinations...',
  ];

  const budgetOptions = [
    { value: 'budget', title: 'Smart Escape', description: 'Charming stays, local favorites, and great value.', icon: Wallet },
    { value: 'moderate', title: 'Comfort Seeker', description: 'Balanced hotels, memorable meals, and smooth pacing.', icon: Luggage },
    { value: 'expensive', title: 'Premium Journey', description: 'Boutique properties, elevated routes, and curated moments.', icon: Compass },
    { value: 'luxury', title: 'Signature Luxury', description: 'Exceptional stays, private touches, and refined experiences.', icon: Crown },
  ];

  const travelStyleOptions = [
    { value: 'Solo', title: 'Solo Reset', description: 'Independent days with space to wander.', icon: Plane },
    { value: 'Couple', title: 'Couple Retreat', description: 'Romantic pacing with memorable shared moments.', icon: Heart },
    { value: 'Family', title: 'Family Ready', description: 'Comfortable plans that work for every age.', icon: Users },
    { value: 'Friends', title: 'Friends Getaway', description: 'High-energy routes with room for spontaneity.', icon: Sparkles },
    { value: 'Business', title: 'Business Blend', description: 'Efficient travel with polished downtime.', icon: BriefcaseBusiness },
  ];

  const interestOptions = [
    { value: 'Beach', title: 'Beaches', icon: Waves },
    { value: 'Adventure', title: 'Adventure', icon: Mountain },
    { value: 'Culture', title: 'Culture', icon: Landmark },
    { value: 'Nature', title: 'Nature', icon: Leaf },
    { value: 'Food', title: 'Food', icon: Utensils },
    { value: 'History', title: 'History', icon: Landmark },
    { value: 'Luxury', title: 'Luxury', icon: Crown },
    { value: 'Wildlife', title: 'Wildlife', icon: Palmtree },
    { value: 'Photography', title: 'Photography', icon: Camera },
  ];

  const steps = [
    {
      eyebrow: 'Travel budget',
      title: 'How should your journey feel financially?',
      description: 'Pick the comfort level you want your concierge recommendations to respect.',
      key: 'budget',
      testIdPrefix: 'budget',
      multi: false,
      options: budgetOptions,
    },
    {
      eyebrow: 'Travel style',
      title: 'Who are we planning this for?',
      description: 'Your route changes when the trip is a reset, a celebration, or a shared adventure.',
      key: 'travelStyle',
      testIdPrefix: 'travel-style',
      multi: false,
      options: travelStyleOptions,
    },
    {
      eyebrow: 'Travel interests',
      title: 'What should your itinerary orbit around?',
      description: 'Choose every theme that should shape your recommendations.',
      key: 'interests',
      testIdPrefix: 'interest',
      multi: true,
      options: interestOptions,
    },
  ];

  const totalSteps = steps.length;
  const activeStep = steps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleOptionSelect = (value) => {
    if (activeStep.multi) {
      handleInterestToggle(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [activeStep.key]: value,
    }));
  };

  const isStepComplete = () => {
    if (activeStep.key === 'budget') return Boolean(formData.budget);
    if (activeStep.key === 'travelStyle') return Boolean(formData.travelStyle);
    return formData.interests.length > 0;
  };

  const handleNext = () => {
    if (activeStep.key === 'budget' && !formData.budget) {
      toast.error('Please select a budget level');
      return;
    }
    if (activeStep.key === 'travelStyle' && !formData.travelStyle) {
      toast.error('Please select a travel style');
      return;
    }
    if (activeStep.key === 'interests' && formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    if (step < totalSteps - 1) {
      setStep((currentStep) => currentStep + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((currentStep) => currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setLoading(true);
    setLoadingMessageIndex(0);

    try {
      await submitSurvey({
        ...formData,
        activities: formData.interests,
      });
      toast.success('Survey submitted successfully!');
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setLoadingMessageIndex(1);
      await new Promise((resolve) => setTimeout(resolve, 1800));
      navigate('/recommendations', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit survey');
      setLoading(false);
    }
  };

  const isOptionSelected = (value) => {
    if (activeStep.multi) {
      return formData.interests.includes(value);
    }
    return formData[activeStep.key] === value;
  };

  if (loading) {
    return (
      <div data-testid="survey-loading" className="min-h-screen overflow-hidden px-6 py-20">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full overflow-hidden rounded-2xl border border-white/40 bg-card/80 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl md:p-14"
          >
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <MotionDiv
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"
            >
              <Sparkles className="h-10 w-10" strokeWidth={1.5} />
            </MotionDiv>
            <AnimatePresence mode="wait">
              <MotionDiv
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  {loadingMessages[loadingMessageIndex]}
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  Your preferences are being translated into a destination shortlist.
                </p>
              </MotionDiv>
            </AnimatePresence>
            <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-muted">
              <MotionDiv
                className="h-full rounded-full bg-primary"
                initial={{ width: '15%' }}
                animate={{ width: loadingMessageIndex === 0 ? '55%' : '100%' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
              />
            </div>
          </MotionDiv>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="survey-page" className="min-h-screen overflow-hidden px-4 py-20 sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(180,89,63,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
      <div className="mx-auto max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step {step + 1} of {totalSteps}</span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <MotionDiv
              className="bg-primary h-2 rounded-full transition-all duration-300"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/40 bg-card/80 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl md:p-10">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={activeStep.key}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              data-testid={`survey-step-${step + 1}`}
            >
              <div className="mb-8 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {activeStep.eyebrow}
                </div>
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  {activeStep.title}
                </h1>
                <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
                  {activeStep.description}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeStep.options.map(({ value, title, description, icon }) => {
                  const selected = isOptionSelected(value);

                  return (
                    <MotionButton
                      key={value}
                      type="button"
                      data-testid={`${activeStep.testIdPrefix}-${value.toLowerCase().replace(' ', '-')}`}
                      onClick={() => handleOptionSelect(value)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`min-h-36 rounded-2xl border p-5 text-left transition-all duration-300 ${selected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                        : 'border-border bg-background/80 hover:border-primary/40 hover:bg-background'
                        }`}
                    >
                      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${selected ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                        {React.createElement(icon, { className: 'h-6 w-6', strokeWidth: 1.5 })}
                      </div>
                      <div className="text-lg font-bold text-foreground">{title}</div>
                      {description && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                      )}
                    </MotionButton>
                  );
                })}
              </div>
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          {step > 0 && (
            <ActionButton
              onClick={handleBack}
              data-testid="survey-back-button"
              variant="secondary"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </ActionButton>
          )}

          <div className="flex-1"></div>

          {step < totalSteps - 1 ? (
            <ActionButton
              onClick={handleNext}
              disabled={!isStepComplete()}
              data-testid="survey-next-button"
            >
              Next <ChevronRight className="w-5 h-5" />
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleSubmit}
              data-testid="survey-submit-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Survey;
