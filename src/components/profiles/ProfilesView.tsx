import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  Lock, 
  Sliders, 
  Trash2,
  Zap,
  Moon,
  Dumbbell,
  Smartphone,
  Gamepad2,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { FocusProfile, ProfileType, InterventionType } from '../../types';

export const ProfilesView: React.FC = () => {
  const { 
    profiles, 
    activeProfile, 
    setActiveProfile, 
    toggleProfileStatus, 
    updateProfile,
    apps 
  } = useFocus();

  const [editingProfile, setEditingProfile] = useState<FocusProfile | null>(null);
  const [completionModalData, setCompletionModalData] = useState<{ title: string; subtitle: string } | null>(null);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Four Core Profiles (Section 23)
  const coreGameProfile = profiles.find(p => p.type === 'game');
  const coreSleepProfile = profiles.find(p => p.type === 'sleep');
  const coreWorkoutProfile = profiles.find(p => p.type === 'workout');
  const coreSocialProfile = profiles.find(p => p.type === 'social');

  const customProfiles = profiles.filter(p => p.type === 'custom');

  const handleOpenEdit = (profile: FocusProfile) => {
    setEditingProfile({ ...profile });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    // Strict validation: enforce max 4 hours for game & social media
    if ((editingProfile.type === 'game' || editingProfile.type === 'social') && (editingProfile.dailyLimitHours || 0) > 4) {
      editingProfile.dailyLimitHours = 4;
    }

    updateProfile(editingProfile);
    const savedName = editingProfile.name;
    setEditingProfile(null);

    // Section 24: Profile Completion Animated Popup
    setCompletionModalData({
      title: 'Your life just got one step more intentional.',
      subtitle: `${savedName} profile ready. Your focus rules are now prepared.`
    });
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Focus Profiles
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Four core digital wellbeing routines plus customizable focus schedules.
          </p>
        </div>

        <button
          onClick={() => setEditingProfile({
            id: `custom_${Date.now()}`,
            name: 'Study / Reading',
            type: 'custom',
            enabled: true,
            days: [1, 2, 3, 4, 5],
            startTime: '14:00',
            endTime: '17:00',
            selectedApps: ['instagram', 'tiktok'],
            blockedDomains: ['tiktok.com', 'instagram.com'],
            intervention: 'strict_block',
            strictLock: true,
            color: 'indigo'
          })}
          className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Profile</span>
        </button>
      </div>

      {/* Priority Resolution Notice (Section 25) */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Priority Resolution Order:</strong> Emergency Unlock &gt; Whitelist &gt; Active Hard Block &gt; Active Schedule &gt; Daily Limit &gt; Intervention.
        </span>
      </div>

      {/* SECTION 23: FOUR MAIN CORE PROFILE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. GAME PROFILE CARD */}
        {coreGameProfile && (
          <div className={`p-5 rounded-2xl border transition-all ${
            activeProfile.id === coreGameProfile.id
              ? 'bg-white dark:bg-slate-900 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Games</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Cap: {coreGameProfile.dailyLimitHours || 2}h max/day
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleProfileStatus(coreGameProfile.id)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  coreGameProfile.enabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  coreGameProfile.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Guards against infinite mobile gaming loops. Hard-locked maximum of 4 hours daily engagement.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveProfile(coreGameProfile)}
                className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                {activeProfile.id === coreGameProfile.id ? 'Currently Active' : 'Activate Games Mode'}
              </button>

              <button
                onClick={() => handleOpenEdit(coreGameProfile)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Configure Form
              </button>
            </div>
          </div>
        )}

        {/* 2. SLEEP MODE CARD */}
        {coreSleepProfile && (
          <div className={`p-5 rounded-2xl border transition-all ${
            activeProfile.id === coreSleepProfile.id
              ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sleep Mode</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {coreSleepProfile.startTime} → {coreSleepProfile.endTime}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleProfileStatus(coreSleepProfile.id)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  coreSleepProfile.enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  coreSleepProfile.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Total sanctuary during sleep hours. Wake-up buffer ({coreSleepProfile.wakeUpBufferMinutes || 15}m) and wind-down protection.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveProfile(coreSleepProfile)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {activeProfile.id === coreSleepProfile.id ? 'Currently Active' : 'Activate Sleep Sanctuary'}
              </button>

              <button
                onClick={() => handleOpenEdit(coreSleepProfile)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Configure Form
              </button>
            </div>
          </div>
        )}

        {/* 3. WORKOUT PROFILE CARD */}
        {coreWorkoutProfile && (
          <div className={`p-5 rounded-2xl border transition-all ${
            activeProfile.id === coreWorkoutProfile.id
              ? 'bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workout</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {coreWorkoutProfile.workoutDurationMinutes || 60}m session + recovery
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleProfileStatus(coreWorkoutProfile.id)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  coreWorkoutProfile.enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  coreWorkoutProfile.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Blocks social and video feeds during training while keeping fitness & music apps available.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveProfile(coreWorkoutProfile)}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                {activeProfile.id === coreWorkoutProfile.id ? 'Currently Active' : 'Activate Workout Mode'}
              </button>

              <button
                onClick={() => handleOpenEdit(coreWorkoutProfile)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Configure Form
              </button>
            </div>
          </div>
        )}

        {/* 4. SOCIAL MEDIA PROFILE CARD */}
        {coreSocialProfile && (
          <div className={`p-5 rounded-2xl border transition-all ${
            activeProfile.id === coreSocialProfile.id
              ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Social Media</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Cap: {coreSocialProfile.dailyLimitHours || 1}h max/day
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleProfileStatus(coreSocialProfile.id)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  coreSocialProfile.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  coreSocialProfile.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Enforces conscious friction and strict daily limits (max 4h) on infinite scroll networks.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveProfile(coreSocialProfile)}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                {activeProfile.id === coreSocialProfile.id ? 'Currently Active' : 'Activate Social Detox'}
              </button>

              <button
                onClick={() => handleOpenEdit(coreSocialProfile)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Configure Form
              </button>
            </div>
          </div>
        )}

      </div>

      {/* SECTION 23: "MY CUSTOM PROFILES" COMPACT SECTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            My Custom Profiles
          </h4>
          <span className="text-xs text-slate-400">
            {customProfiles.length} custom schedules
          </span>
        </div>

        {customProfiles.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No custom profiles yet. Tap "New Custom Profile" above to create one.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customProfiles.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white block">{p.name}</strong>
                  <span className="text-[11px] text-slate-400">{p.startTime} - {p.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveProfile(p)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEPARATE FORMS MODAL AS SPECIFIED IN SECTION 23 */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Configure {editingProfile.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Type: {editingProfile.type.toUpperCase()}
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Profile Name</label>
                <input
                  type="text"
                  required
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              {/* GAME / SOCIAL MEDIA PROFILE SPECIFIC: Allowed max 4h daily limit */}
              {(editingProfile.type === 'game' || editingProfile.type === 'social') && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Daily Engagement Limit (Maximum allowed: 4 hours)
                  </label>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[1, 2, 3, 4].map(h => (
                      <button
                        type="button"
                        key={h}
                        onClick={() => setEditingProfile({ ...editingProfile, dailyLimitHours: h })}
                        className={`h-9 rounded-lg font-bold transition-colors ${
                          editingProfile.dailyLimitHours === h
                            ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        {h} {h === 1 ? 'Hour' : 'Hours'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SLEEP MODE SPECIFIC: Sleep start, end, wake-up buffer, wind-down */}
              {editingProfile.type === 'sleep' && (
                <div className="space-y-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block">Sleep Schedule Parameters</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5">Sleep Start</label>
                      <input
                        type="time"
                        value={editingProfile.startTime}
                        onChange={(e) => setEditingProfile({ ...editingProfile, startTime: e.target.value })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">Sleep End</label>
                      <input
                        type="time"
                        value={editingProfile.endTime}
                        onChange={(e) => setEditingProfile({ ...editingProfile, endTime: e.target.value })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-slate-500 block mb-0.5">Wake-up Buffer</label>
                      <select
                        value={editingProfile.wakeUpBufferMinutes || 15}
                        onChange={(e) => setEditingProfile({ ...editingProfile, wakeUpBufferMinutes: parseInt(e.target.value) })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value={0}>None</option>
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">Wind-down Protection</label>
                      <select
                        value={editingProfile.windDownMinutes || 30}
                        onChange={(e) => setEditingProfile({ ...editingProfile, windDownMinutes: parseInt(e.target.value) })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value={0}>None</option>
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={60}>60 mins</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* WORKOUT PROFILE SPECIFIC: Duration, prep time, recovery time */}
              {editingProfile.type === 'workout' && (
                <div className="space-y-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">Workout Configuration</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5">Workout Start</label>
                      <input
                        type="time"
                        value={editingProfile.startTime}
                        onChange={(e) => setEditingProfile({ ...editingProfile, startTime: e.target.value })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">Session Duration</label>
                      <select
                        value={editingProfile.workoutDurationMinutes || 60}
                        onChange={(e) => setEditingProfile({ ...editingProfile, workoutDurationMinutes: parseInt(e.target.value) })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                        <option value={90}>90 mins</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">Recovery Time</label>
                      <select
                        value={editingProfile.recoveryTimeMinutes || 15}
                        onChange={(e) => setEditingProfile({ ...editingProfile, recoveryTimeMinutes: parseInt(e.target.value) })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value={10}>10 mins</option>
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Days Selector */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Active Days</label>
                <div className="flex gap-1.5">
                  {dayLabels.map((day, idx) => {
                    const isSelected = editingProfile.days.includes(idx);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          const updated = isSelected 
                            ? editingProfile.days.filter(d => d !== idx)
                            : [...editingProfile.days, idx].sort();
                          setEditingProfile({ ...editingProfile, days: updated });
                        }}
                        className={`flex-1 h-8 rounded-lg font-bold transition-colors ${
                          isSelected ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold shadow-md"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 24: PROFILE COMPLETION POPUP MODAL */}
      {completionModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 p-7 text-center shadow-2xl relative overflow-hidden">
            {/* Ambient Confetti / Particle Glow */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">
              {completionModalData.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {completionModalData.subtitle}
            </p>

            <button
              onClick={() => setCompletionModalData(null)}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
