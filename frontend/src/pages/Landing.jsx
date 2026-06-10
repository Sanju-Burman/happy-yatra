import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, MapPin, Heart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { getDestinations, getSavedDestinations } from "@/api.jsx";
import DestinationCard from "@/components/DestinationCard.jsx";
import ActionButton from "@/components/ActionButton.jsx";

const Landing = ({ user }) => {
  const MotionDiv = motion.div;
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [otherDestinations, setOtherDestinations] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [viewLimit, setViewLimit] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setViewLimit(6);
      else if (width < 1024) setViewLimit(8);
      else setViewLimit(10);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const [response, savedData] = await Promise.all([
          getDestinations(1, 20),
          user ? getSavedDestinations().catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ]);
        const data = Array.isArray(response.data) ? response.data : [];

        const trending = data.filter((d) => d.trending === true);
        const others = data.filter((d) => d.trending !== true);

        setTrendingDestinations(trending);
        setOtherDestinations(others);

        const ids = new Set(
          (Array.isArray(savedData?.data) ? savedData.data : []).map(d => d._id || d.id)
        );
        setSavedIds(ids);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [user]);

  const displayedTrending = trendingDestinations.slice(0, viewLimit);
  const remainingLimit = Math.max(0, viewLimit - displayedTrending.length);
  const displayedOthers = otherDestinations.slice(0, remainingLimit);

  return (
    <div data-testid="landing-page" className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1732808460864-b8e5eb489a52?auto=format,compress&q=80&w=1200&fm=webp"
            alt="Hero Background"
            className="w-full h-full object-cover"
            width="1200"
            height="800"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20">
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="font-heading text-white text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              Discover Your Perfect Destination
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              Personalized travel recommendations powered by AI. Tell us your
              preferences, and we'll guide you to unforgettable places.
            </p>
            <div className="flex gap-4 flex-wrap">
              {user ? (
                <ActionButton
                  to="/survey"
                  data-testid="hero-start-survey-button"
                  size="lg"
                >
                  Start Your Journey{" "}
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </ActionButton>
              ) : (
                <>
                  <ActionButton
                    to="/signup"
                    data-testid="hero-signup-button"
                    size="lg"
                  >
                    Get Started{" "}
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </ActionButton>
                  <ActionButton
                    to="/login"
                    data-testid="hero-login-button"
                    variant="heroSecondary"
                    size="lg"
                  >
                    Login
                  </ActionButton>
                </>
              )}
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Why Choose Happy Yatraa
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Intelligent recommendations tailored just for you
            </p>
          </MotionDiv>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Recommendations",
                desc: "Advanced algorithms analyze your preferences to suggest perfect destinations",
              },
              {
                icon: MapPin,
                title: "Interactive Maps",
                desc: "Visualize destinations with integrated Google Maps for better planning",
              },
              {
                icon: Heart,
                title: "Save Your Favorites",
                desc: "Build your travel wishlist by saving destinations you love",
              },
            ].map((feature, idx) => (
              <MotionDiv
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                data-testid={`feature-card-${idx}`}
                className="bg-muted p-8 rounded-xl border border-transparent hover:border-primary/20 transition-all duration-300"
              >
                <feature.icon
                  className="w-12 h-12 text-primary mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-background">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp
                  className="w-6 h-6 text-primary"
                  strokeWidth={1.5}
                />
                <span className="font-mono text-xs uppercase tracking-wide text-primary">
                  Popular Picks
                </span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Trending Destinations
              </h2>
            </div>
          </MotionDiv>

          {loading ? (
            <div className="text-center py-12">Loading destinations...</div>
          ) : (
            <>
              {displayedTrending.length === 0 &&
              displayedOthers.length === 0 ? (
                <div
                  data-testid="empty-state"
                  className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border-2 border-dashed border-border"
                >
                  <p className="text-lg">
                    No destinations available at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-16">
                  {/* Trending Section */}
                  {displayedTrending.length > 0 && (
                    <div data-testid="trending-section">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp
                              className="w-5 h-5 text-primary"
                              strokeWidth={1.5}
                            />
                            <span className="font-mono text-xs uppercase tracking-wide text-primary">
                              Featured
                            </span>
                          </div>
                          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                            Trending Destinations
                          </h2>
                        </div>
                      </div>
                      <div
                        data-testid="trending-grid"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                      >
                        {displayedTrending.map((destination, idx) => (
                          <MotionDiv
                            key={destination._id || destination.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.6,
                              delay: (idx % 4) * 0.1,
                            }}
                            viewport={{ once: true }}
                          >
                            <DestinationCard
                              destination={destination}
                              showSaveButton={!!user}
                              isSaved={savedIds.has(destination._id || destination.id)}
                            />
                          </MotionDiv>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Section (Independent) */}
                  {displayedOthers.length > 0 && (
                    <div data-testid="others-section">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles
                              className="w-5 h-5 text-primary"
                              strokeWidth={1.5}
                            />
                            <span className="font-mono text-xs uppercase tracking-wide text-primary">
                              Discover More
                            </span>
                          </div>
                          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                            Explore Our Recommendations
                          </h2>
                        </div>
                      </div>
                      <div
                        data-testid="others-grid"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                      >
                        {displayedOthers.map((destination, idx) => (
                          <MotionDiv
                            key={destination._id || destination.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.6,
                              delay: (idx % 4) * 0.1,
                            }}
                            viewport={{ once: true }}
                          >
                            <DestinationCard
                              destination={destination}
                              showSaveButton={!!user}
                              isSaved={savedIds.has(destination._id || destination.id)}
                            />
                          </MotionDiv>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;
