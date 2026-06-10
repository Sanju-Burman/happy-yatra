import React from 'react';
import { Flag, Heart, Map, MessageSquareText, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

const TravelStats = ({ profile, savedDestinationsCount = 0 }) => {
  const MotionDiv = motion.div;
  const countriesVisited = Array.isArray(profile?.countriesVisited)
    ? profile.countriesVisited.length
    : profile?.countries_visited || profile?.countriesVisited || profile?.preferences?.activities?.length || 0;

  const stats = [
    {
      label: 'Total Trips',
      value: profile?.totalTrips || profile?.total_trips || savedDestinationsCount,
      icon: Plane,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Countries Visited',
      value: countriesVisited,
      icon: Flag,
      tone: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Reviews',
      value: profile?.reviewsCount || profile?.reviews_count || profile?.reviews?.length || 0,
      icon: MessageSquareText,
      tone: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Saved Places',
      value: profile?.saved_destinations_count || savedDestinationsCount,
      icon: Heart,
      tone: 'bg-rose-500/10 text-rose-600',
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone }, idx) => (
        <MotionDiv
          key={label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.08 }}
          className="rounded-2xl border border-white/40 bg-card/75 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value || 0}</p>
            </div>
            <div className={`rounded-2xl p-3 ${tone}`}>
              {React.createElement(Icon, { className: 'h-6 w-6', strokeWidth: 1.5 })}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Map className="h-3.5 w-3.5" strokeWidth={1.5} />
            Travel dashboard
          </div>
        </MotionDiv>
      ))}
    </section>
  );
};

export default TravelStats;
