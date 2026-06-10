import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ActionButton from '@/components/ActionButton.jsx';

const ThankYou = () => {
  const MotionDiv = motion.div;
  const navigate = useNavigate();

  return (
    <div data-testid="thank-you-page" className="min-h-screen flex items-center justify-center px-6 py-20">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="bg-card rounded-2xl shadow-lg p-12 md:p-16 border border-border">
          <MotionDiv
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" strokeWidth={1.5} />
          </MotionDiv>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Thank You!
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Your preferences have been saved. We're now preparing personalized destination recommendations just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ActionButton
              onClick={() => navigate('/recommendations')}
              data-testid="thank-you-recommendations-button"
            >
              <Sparkles className="w-5 h-5" /> View Recommendations
            </ActionButton>
            <ActionButton
              onClick={() => navigate('/')}
              data-testid="thank-you-home-button"
              variant="secondary"
            >
              Back to Home
            </ActionButton>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default ThankYou;
