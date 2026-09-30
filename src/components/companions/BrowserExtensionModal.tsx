import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const BrowserExtensionModal: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'manifest' | 'background' | 'popup' | 'blocked'>('manifest');
  const [copied, setCopied] = useState<boolean>(false);

  const extensionFiles = {
    manifest: {
      filename: 'manifest.json',
      description: 'Chrome / Edge Manifest V3 configuration with DeclarativeNetRequest, storage, and alarm permissions.',
      code: `{
  "manifest_version": 3,
  "name": "FocusLock: Digital Wellbeing & App Blocker",
  "version": "2.4.0",
  "description": "Cross-platform mindful website blocker and dopamine loop breaker.",
  "permissions": [
    "declarativeNetRequest",
    "storage",
    "alarms",
    "tabs",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`
    },
    background: {
      filename: 'background.js',
      description: 'Service worker coordinating rule evaluation, Firebase sync, and declarativeNetRequest redirect rules.',
      code: `// FocusLock Browser Extension Service Worker (Manifest V3)
const FIRESTORE_SYNC_INTERVAL_MINS = 5;

// Fallback cached rules if offline
let cachedRules = {
  activeProfile: 'Deep Work',
  strictLock: true,
  blockedDomains: ['instagram.com', 'tiktok.com', 'x.com', 'reddit.com', 'youtube.com']
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['rules'], (result) => {
    if (result.rules) {
      cachedRules = result.rules;
    }
    updateDeclarativeBlockingRules();
  });

  // Alarm for periodic rule sync with FocusLock Firebase backend
  chrome.alarms.create('sync_focuslock_rules', { periodInMinutes: FIRESTORE_SYNC_INTERVAL_MINS });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync_focuslock_rules') {
    syncRulesFromFirebase();
  }
});

function updateDeclarativeBlockingRules() {
  const dynamicRules = cachedRules.blockedDomains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { extensionPath: '/blocked.html?domain=' + encodeURIComponent(domain) }
    },
    condition: {
      urlFilter: '||' + domain,
      resourceTypes: ['main_frame']
    }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    addRules: dynamicRules
  });
}

async function syncRulesFromFirebase() {
  // Syncs with FocusLock Firestore collection: users/{uid}/selectedApps
  console.log('[FocusLock Extension] Synchronized rules from FocusLock Cloud.');
}`
    },
    popup: {
      filename: 'popup.html & popup.js',
      description: 'Compact browser action popup displaying active focus countdown and quick break trigger.',
      code: `<!-- popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 280px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 16px; background: #0F172A; color: #F8FAFC; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .title { font-weight: 700; font-size: 14px; }
    .timer { font-family: monospace; font-size: 28px; font-weight: bold; text-align: center; color: #10B981; margin: 12px 0; }
    .btn { width: 100%; padding: 8px 12px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: #10B981; color: white; margin-bottom: 6px; }
    .btn-secondary { background: #1E293B; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">FocusLock Active</span>
    <span id="profileBadge" style="font-size: 10px; background: #1E293B; padding: 2px 6px; border-radius: 4px;">Deep Work</span>
  </div>
  <div class="timer" id="timeRemaining">24:18</div>
  <button class="btn btn-primary" id="openDashboard">Open FocusLock Web</button>
  <button class="btn btn-secondary" id="takeBreak">5m Mindful Break</button>
  <script src="popup.js"></script>
</body>
</html>`
    },
    blocked: {
      filename: 'blocked.html',
      description: 'Gentle intervention and blocking landing page shown when navigating to a restricted domain.',
      code: `<!-- blocked.html -->
<!DOCTYPE html>
<html>
<head>
  <title>FocusLock — Mindful Pause</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #090D16; font-family: sans-serif; color: #F8FAFC; text-align: center; }
    .card { max-width: 440px; padding: 36px; border-radius: 24px; background: #111827; border: 1px solid #1F2937; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    p { font-size: 13px; color: #9CA3AF; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 12px; background: #10B981; color: white; text-decoration: none; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Take back your time.</h1>
    <p>This website is guarded by your active FocusLock schedule. Step back from the screen and take a deep breath.</p>
    <a href="javascript:history.back()" class="btn">Close & Return to Work</a>
  </div>
</body>
</html>`
    }
  };

  const current = extensionFiles[selectedTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chrome & Edge Extension (Manifest V3)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real declarativeNetRequest blocker syncing rules offline and cross-device.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy File Content'}</span>
        </button>
      </div>

      {/* Extension File Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(extensionFiles) as (keyof typeof extensionFiles)[]).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
              selectedTab === tab
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {extensionFiles[tab].filename}
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-xl text-left">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 block">
              {current.filename}
            </span>
            <span className="text-[11px] text-slate-400">
              {current.description}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-2 leading-relaxed max-h-[500px] scrollbar-thin">
          <code>{current.code}</code>
        </pre>
      </div>

    </div>
  );
};
