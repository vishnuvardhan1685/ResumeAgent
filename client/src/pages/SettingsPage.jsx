import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Save, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';

const Section = ({ icon: Icon, title, description, children }) => (
  <div className="overflow-hidden border bg-surface border-border rounded-xl">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
        <Icon size={15} className="text-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
    </div>
    <div className="px-5 py-5 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block mb-1 text-xs font-medium text-text-primary">{label}</label>
    {hint && <p className="mb-2 text-2xs text-text-muted">{hint}</p>}
    {children}
  </div>
);

const Toggle = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm text-text-primary">{label}</p>
      {description && <p className="text-xs text-text-secondary">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        value ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

const inputCls = 'w-full h-9 px-3 text-sm rounded-lg bg-base border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors';

const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    analysisComplete: true,
    newJobMatches: true,
    weeklyDigest: false,
  });

  const handleSaveProfile = () => {
    // TODO: call PATCH /api/user/profile with { name: displayName }
    // then: updateUser({ name: displayName })
    updateUser({ name: displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account preferences and application settings.
        </p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile" description="Your public identity in the app">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center text-xl font-bold border w-14 h-14 rounded-2xl bg-accent/20 border-accent/30 text-accent shrink-0">
            {displayName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{user?.email}</p>
            <p className="text-xs text-text-muted mt-0.5">Signed in with Google</p>
          </div>
        </div>

        <Field label="Display name" hint="Used across the app and in analysis reports">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </Field>

        <div className="flex justify-end">
          <Button
            size="sm"
            variant={saved ? 'secondary' : 'primary'}
            icon={saved ? <Check size={13} className="text-emerald-400" /> : <Save size={13} />}
            onClick={handleSaveProfile}
          >
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" description="Control what alerts you receive">
        <Toggle
          label="Analysis complete"
          description="Get notified when a pipeline finishes running"
          value={notifications.analysisComplete}
          onChange={(v) => setNotifications((n) => ({ ...n, analysisComplete: v }))}
        />
        <div className="border-t border-border" />
        <Toggle
          label="New job matches"
          description="Alerts when new high-match jobs are discovered"
          value={notifications.newJobMatches}
          onChange={(v) => setNotifications((n) => ({ ...n, newJobMatches: v }))}
        />
        <div className="border-t border-border" />
        <Toggle
          label="Weekly digest"
          description="A weekly summary of your activity and top job matches"
          value={notifications.weeklyDigest}
          onChange={(v) => setNotifications((n) => ({ ...n, weeklyDigest: v }))}
        />
        <p className="pt-1 text-2xs text-text-muted">
          ✦ Notification delivery requires backend integration — preferences are saved locally for now.
        </p>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance" description="Visual preferences">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Theme</p>
            <p className="text-xs text-text-secondary">Currently dark mode only</p>
          </div>
          <div className="flex items-center gap-2 p-1 border rounded-lg bg-elevated border-border">
            <button className="px-3 py-1 text-xs font-medium rounded-md bg-accent/20 text-accent">
              Dark
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-md opacity-50 cursor-not-allowed text-text-muted" disabled>
              Light
            </button>
          </div>
        </div>
      </Section>

      {/* Account / danger zone */}
      <Section icon={Shield} title="Account" description="Manage your account data">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">Export data</p>
              <p className="text-xs text-text-secondary">Download all your resumes and analysis results</p>
            </div>
            <Button size="sm" variant="secondary" disabled>
              Coming soon
            </Button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-sm text-red-400">Delete account</p>
              <p className="text-xs text-text-muted">Permanently remove all data</p>
            </div>
            <Button size="sm" variant="danger" disabled>
              Delete
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default SettingsPage;