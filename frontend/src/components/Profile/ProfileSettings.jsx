import React, { useMemo, useState } from "react";
import { Camera, ImagePlus, Save, Settings2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ActionButton from "@/components/ActionButton.jsx";

const ProfileSettings = ({ profile, onProfileUpdate, budgetLabels = {} }) => {
  const MotionSection = motion.section;
  const [bio, setBio] = useState(profile?.bio || "");
  const [travelStyle, setTravelStyle] = useState(
    profile?.preferences?.travelStyle || "",
  );
  const [budget, setBudget] = useState(profile?.preferences?.budget || "");
  const [interests, setInterests] = useState(
    (profile?.preferences?.interests || []).join(", "),
  );

  const budgetOptions = useMemo(
    () => Object.entries(budgetLabels),
    [budgetLabels],
  );

  const readImage = (file, key) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onProfileUpdate((currentProfile) => ({
        ...currentProfile,
        [key]: reader.result,
      }));
      toast.success(
        key === "avatarUrl"
          ? "Avatar preview updated"
          : "Cover preview updated",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextInterests = interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

    onProfileUpdate((currentProfile) => ({
      ...currentProfile,
      bio,
      preferences: {
        ...(currentProfile?.preferences || {}),
        travelStyle,
        budget,
        interests: nextInterests,
      },
    }));

    toast.success("Profile settings updated");
  };

  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="rounded-2xl border border-white/40 bg-card/75 p-5 shadow-lg shadow-black/5 backdrop-blur-xl md:p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Settings2 className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Profile Settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Refresh your dashboard details and travel preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="profile-bio"
            className="text-sm font-semibold text-foreground"
          >
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Tell fellow travellers what inspires your journeys."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="profile-style"
              className="text-sm font-semibold text-foreground"
            >
              Travel Style
            </label>
            <input
              id="profile-style"
              value={travelStyle}
              onChange={(event) => setTravelStyle(event.target.value)}
              className="mt-2 w-full rounded-full border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Adventure, culture, wellness..."
            />
          </div>

          <div>
            <label
              htmlFor="profile-budget"
              className="text-sm font-semibold text-foreground"
            >
              Budget
            </label>
            <select
              id="profile-budget"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="mt-2 w-full rounded-full border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Select budget</option>
              {budgetOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-interests"
            className="text-sm font-semibold text-foreground"
          >
            Interests
          </label>
          <input
            id="profile-interests"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            className="mt-2 w-full rounded-full border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Beaches, food, trekking"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
            <Camera className="h-5 w-5" strokeWidth={1.5} />
            <span>Upload avatar</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                readImage(event.target.files?.[0], "avatarUrl")
              }
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
            <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
            <span>Upload cover</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                readImage(event.target.files?.[0], "coverImageUrl")
              }
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            Updates apply instantly to this profile dashboard.
          </div>
          <ActionButton
            type="submit"
            size="sm"
          >
            <Save
              className="h-4 w-4 transition-transform duration-500 group-hover:rotate-6"
              strokeWidth={1.5}
            />
            Save Settings
          </ActionButton>
        </div>
      </form>
    </MotionSection>
  );
};

export default ProfileSettings;
