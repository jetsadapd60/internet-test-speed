"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Mail, Save } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your account information
          </p>
        </div>

        {/* Profile Form */}
        <div className="rounded-2xl border border-white/10 bg-background/50 p-8 backdrop-blur-xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Placeholder */}
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-primary">
                <User className="h-12 w-12" />
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <User className="h-4 w-4" />
                Name
              </label>
              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Enter your name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="Enter your email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button type="submit" className="w-full gap-2" size="lg">
                <Save className="h-4 w-4" />
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>

            {/* Success Message */}
            {saved && (
              <div className="rounded-lg bg-green-500/20 px-4 py-3 text-center text-sm text-green-400">
                Profile updated successfully!
              </div>
            )}
          </form>
        </div>

        {/* Additional Settings Placeholder */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-background/50 p-8 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Auto-save results</div>
                <div className="text-sm text-slate-400">
                  Automatically save test results to history
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Notifications</div>
                <div className="text-sm text-slate-400">
                  Get notified when test is complete
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
