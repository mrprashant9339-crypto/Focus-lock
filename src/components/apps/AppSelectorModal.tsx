import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Shield, 
  ShieldAlert, 
  Clock, 
  Check, 
  Trash2, 
  Sliders, 
  Sparkles,
  Smartphone,
  Globe,
  Play,
  RotateCw,
  Camera,
  ShoppingBag,
  ArrowUpDown,
  CheckCircle2,
  Lock,
  Flame,
  Info
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { useAuth } from '../../context/AuthContext';
import { SelectedApp, RuleType, InterventionType, AppCategory } from '../../types';

export const AppSelectorModal: React.FC = () => {
  const { 
    apps, 
    toggleAppStatus, 
    updateAppRule, 
    addNewApp, 
    deleteApp,
    triggerInterventionSimulator,
    verifyBiometric
  } = useFocus();

  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'catalog' | 'bag'>('catalog');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'most_used' | 'alphabetical' | 'category'>('most_used');
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = useState<boolean>(false);
  const [isBagUnlocked, setIsBagUnlocked] = useState<boolean>(false);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newCategory, setNewCategory] = useState<AppCategory>('Social');
  const [newRuleType, setNewRuleType] = useState<RuleType>('intervention');
  const [newIntervention, setNewIntervention] = useState<InterventionType>('breathing');

  const categories: (AppCategory | 'All')[] = [
    'All',
    'Social',
    'Games',
    'Video',
    'Shopping',
    'Entertainment',
    'Communication',
    'Productivity',
    'Browsers',
    'Other'
  ];

  // Objective Distraction Detection (Section 13)
  const suggestedApps = apps.filter(a => !a.isEssential && (a.usedTodaySeconds > 1200 || a.launchCountToday >= 15));

  const formatUsageTime = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return `${hrs}h ${rem}m`;
    }
    return `${mins}m`;
  };

  // Sort & Filter
  const filteredApps = apps.filter(app => {
    if (activeCategory !== 'All' && app.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return app.name.toLowerCase().includes(q) || 
             app.packageName.toLowerCase().includes(q) || 
             (app.domain && app.domain.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'most_used') return b.usedTodaySeconds - a.usedTodaySeconds;
    if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
    return a.category.localeCompare(b.category);
  });

  const protectedAppsInBag = apps.filter(a => a.enabled && !a.isEssential);

  const handleSelectAll = () => {
    filteredApps.forEach(a => {
      if (!a.enabled && !a.isEssential) toggleAppStatus(a.id);
    });
  };

  const handleClearAll = () => {
    filteredApps.forEach(a => {
      if (a.enabled && !a.isEssential) toggleAppStatus(a.id);
    });
  };

  const handleOpenFocusBag = async () => {
    if (profile?.settings.biometricProtectedSettings && !isBagUnlocked) {
      const verified = await verifyBiometric('Access Protected Focus Bag');
      if (verified) setIsBagUnlocked(true);
    } else {
      setIsBagUnlocked(true);
    }
    setActiveTab('bag');
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIdentifier.trim()) return;
    addNewApp(newName.trim(), newIdentifier.trim(), newCategory, newRuleType, newIntervention);
    setNewName('');
    setNewIdentifier('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Segmented Controls: Choose What to Protect vs Focus Bag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Choose What to Protect ({apps.length})
          </button>

          <button
            onClick={handleOpenFocusBag}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'bag'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Focus Bag ({protectedAppsInBag.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom App or Domain</span>
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* TAB 1: CATALOG — CHOOSE WHAT TO PROTECT */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Section 13: "Most distracting right now" suggested section */}
          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Most Distracting Right Now
                  </h4>
                </div>
                <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                  Determined by objective usage signals: top time consumer, frequent opens, and high recent usage.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-300 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={smartSuggestionsEnabled}
                  onChange={(e) => setSmartSuggestionsEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Smart Suggestions</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedApps.slice(0, 3).map(app => (
                <div key={app.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{app.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatUsageTime(app.usedTodaySeconds)} today · {app.launchCountToday} opens
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAppStatus(app.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      app.enabled 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {app.enabled ? 'Protected' : 'Protect'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Search, Sort & Bulk Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps, package names, or domains..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="most_used">Sort: Most Used</option>
                <option value="alphabetical">Sort: Alphabetical</option>
                <option value="category">Sort: Category</option>
              </select>

              {/* Bulk Actions */}
              <button
                onClick={handleSelectAll}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Compact App Rows Grid */}
          <div className="space-y-2">
            {filteredApps.map(app => (
              <div
                key={app.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  app.enabled 
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs' 
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* App Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    app.isEssential 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900' 
                      : app.ruleType === 'hard_block'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                  }`}>
                    {app.domain ? <Globe className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>

                  {/* App Name & Today Usage */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {app.name}
                      </h4>
                      {app.isEssential ? (
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded shrink-0">
                          Whitelist
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded capitalize shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {app.ruleType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{app.category}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {formatUsageTime(app.usedTodaySeconds)} today ({app.launchCountToday} opens)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions: Test Challenge & Toggle */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {!app.isEssential && (
                    <button
                      onClick={() => triggerInterventionSimulator(app)}
                      title="Test how FocusLock intercepts this app"
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Test</span>
                    </button>
                  )}

                  {!app.isEssential && (
                    <button
                      onClick={() => toggleAppStatus(app.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        app.enabled 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {app.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 2: FOCUS BAG — PROTECTED APPS COLLECTION (Section 40) */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'bag' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Focus Bag: Currently Guarded Apps
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These applications are actively intercepted according to their rules and remaining daily limits.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              {protectedAppsInBag.length} Apps Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {protectedAppsInBag.map(app => {
              const remainingSeconds = Math.max(0, app.dailyLimitSeconds - app.usedTodaySeconds);

              return (
                <div key={app.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                        {app.domain ? <Globe className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</h4>
                        <span className="text-[10px] text-slate-400 capitalize">{app.ruleType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerInterventionSimulator(app)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100"
                    >
                      Trigger Intercept
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500">Remaining daily allowance:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {app.dailyLimitSeconds > 0 ? formatUsageTime(remainingSeconds) : 'Strict Block'}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 leading-relaxed">
            Note: FocusLock enforces mindful blocking through accessibility & foreground overlay permissions. Focus Bag is a privacy-first guardian, not an OS-level uninstall prevention mechanism.
          </div>
        </div>
      )}

      {/* Add Custom App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Protected App or Domain
            </h3>

            <form onSubmit={handleCreateApp} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application / Site Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. SnapChat, Chess.com"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Domain or Android Package Name
                </label>
                <input
                  type="text"
                  required
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                  placeholder="e.g. chess.com or com.snapchat.android"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AppCategory)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Social">Social</option>
                    <option value="Games">Games</option>
                    <option value="Video">Video</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Communication">Communication</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Browsers">Browsers</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rule Type
                  </label>
                  <select
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value as RuleType)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="intervention">Gentle Intervention</option>
                    <option value="hard_block">Hard Block</option>
                    <option value="daily_limit">Daily Limit</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intervention Style
                </label>
                <select
                  value={newIntervention}
                  onChange={(e) => setNewIntervention(e.target.value as InterventionType)}
                  className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="breathing">Mindful Box Breathing</option>
                  <option value="math">Math Prefrontal Challenge</option>
                  <option value="rotate_phone">Tactile Sensor Rotation</option>
                  <option value="wait_timer">Friction Wait Timer</option>
                  <option value="mirror">Self-Reflection Mirror</option>
                  <option value="typing">Conscious Typing Challenge</option>
                  <option value="strict_block">Hard Block Lock</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs shadow-md"
                >
                  Save App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
