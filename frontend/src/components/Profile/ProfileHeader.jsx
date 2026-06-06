import React from 'react';
import { Camera, Globe2, Instagram, Linkedin, Mail, MapPin, Twitter, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileHeader = ({ profile, savedDestinationsCount = 0 }) => {
  const MotionSection = motion.section;
  const user = profile?.user || {};
  const name = user.name || profile?.name || 'Happy Traveller';
  const email = user.email || profile?.email || '';
  const bio = profile?.bio || 'Curating memorable journeys, saved escapes, and future adventures in one place.';
  const avatarUrl = profile?.avatarUrl || profile?.avatar || user.avatarUrl || user.avatar;
  const coverUrl = profile?.coverImageUrl || profile?.coverImage || profile?.coverUrl;
  const homeBase = profile?.location || profile?.homeBase || 'Ready for the next destination';

  const socialLinks = [
    { label: 'Email', href: email ? `mailto:${email}` : '', icon: Mail },
    { label: 'Website', href: profile?.socialLinks?.website || profile?.website || '', icon: Globe2 },
    { label: 'Instagram', href: profile?.socialLinks?.instagram || profile?.instagram || '', icon: Instagram },
    { label: 'Twitter', href: profile?.socialLinks?.twitter || profile?.twitter || '', icon: Twitter },
    { label: 'LinkedIn', href: profile?.socialLinks?.linkedin || profile?.linkedin || '', icon: Linkedin },
  ].filter((link) => link.href);

  return (
    <MotionSection
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden rounded-2xl border border-white/40 bg-card/70 shadow-xl shadow-black/5 backdrop-blur-xl"
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary/30 via-background to-muted md:h-72">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={`${name} cover`}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
          {savedDestinationsCount} saved places
        </div>
      </div>

      <div className="relative px-5 pb-8 pt-0 md:px-8 lg:px-10">
        <div className="-mt-16 flex flex-col gap-6 md:-mt-20 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <User className="h-14 w-14 text-primary" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute bottom-2 right-2 rounded-full bg-background/90 p-2 shadow-sm backdrop-blur">
                <Camera className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <div className="min-w-0 pb-1">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="truncate">{homeBase}</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {name}
              </h1>
              {email && <p className="mt-2 text-sm text-muted-foreground md:text-base">{email}</p>}
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-primary"
                >
                  {React.createElement(Icon, { className: 'h-4 w-4', strokeWidth: 1.6 })}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Bio</p>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{bio}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Travel Style</p>
            <p className="mt-3 text-2xl font-bold capitalize text-foreground">
              {profile?.preferences?.travelStyle || 'Explorer'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Personalized from your travel preferences.</p>
          </div>
        </div>
      </div>
    </MotionSection>
  );
};

export default ProfileHeader;
