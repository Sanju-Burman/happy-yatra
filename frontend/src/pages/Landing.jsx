import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, Heart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDestinations } from '@/api.jsx';
import DestinationCard from '@/components/DestinationCard.jsx';

const Landing = ({ user }) => {
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getDestinations(1, 6, true);
        setTrendingDestinations(data.destinations || []);
      } catch (error) {
        console.error('Error fetching trending destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div data-testid="landing-page" className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1732808460864-b8e5eb489a52?auto=format,compress&q=80&w=1200&fm=webp"
            alt="Hero Background"
            className="w-full h-full object-cover"
            fetchpriority="high"
            decoding="async"
            loading="eager"
            width="1200"
            height="800"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="font-heading text-white text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              Discover Your Perfect Destination
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              Personalized travel recommendations powered by AI. Tell us your preferences, and we'll guide you to unforgettable places.
            </p>
            <div className="flex gap-4 flex-wrap">
              {user ? (
                <Link
                  to="/survey"
                  data-testid="hero-start-survey-button"
                  className="bg-primary text-white rounded-full px-8 py-4 hover:bg-[#A04B32] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium tracking-wide inline-flex items-center gap-2"
                >
                  Start Your Journey <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    data-testid="hero-signup-button"
                    className="bg-primary text-primary-foreground rounded-full px-8 py-4 hover:bg-[#A04B32] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium tracking-wide inline-flex items-center gap-2"
                  >
                    Get Started <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </Link>
                  <Link
                    to="/login"
                    data-testid="hero-login-button"
                    className="bg-transparent border-2 border-white text-white rounded-full px-8 py-4 hover:bg-[#A04B32] hover:text-secondary transition-all duration-300 font-medium tracking-wide"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Why Choose Happy Yatraa</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Intelligent recommendations tailored just for you</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'AI-Powered Recommendations', desc: 'Advanced algorithms analyze your preferences to suggest perfect destinations' },
              { icon: MapPin, title: 'Interactive Maps', desc: 'Visualize destinations with integrated Google Maps for better planning' },
              { icon: Heart, title: 'Save Your Favorites', desc: 'Build your travel wishlist by saving destinations you love' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                data-testid={`feature-card-${idx}`}
                className="bg-muted p-8 rounded-xl border border-transparent hover:border-primary/20 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <span className="font-mono text-xs uppercase tracking-wide text-primary">Popular Picks</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">Trending Destinations</h2>
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">Loading trending destinations...</div>
          ) : (
            <div data-testid="trending-destinations-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingDestinations?.length > 0 ? (
                trendingDestinations.map((destination, idx) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <DestinationCard destination={destination} showSaveButton={!!user} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No trending destinations available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;