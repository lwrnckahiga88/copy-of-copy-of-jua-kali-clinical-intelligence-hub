import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Settings</h1>
          <p className="text-slate-300 mb-6">Please sign in to access this module</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">Settings</h1>
          <p className="text-slate-400">Application preferences and configuration</p>
        </div>

        <div className="cosmic-panel">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-300">User Preferences</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Theme', value: 'Dark Cosmic' },
              { label: 'Notification Level', value: 'All Alerts' },
              { label: 'Data Refresh Rate', value: 'Real-time' },
              { label: 'Language', value: 'English' },
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-300">{pref.label}</span>
                <span className="font-semibold text-cyan-300">{pref.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
