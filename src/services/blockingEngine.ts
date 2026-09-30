import { SelectedApp, FocusProfile, EngineDecision } from '../types';

export interface BlockingEngineInput {
  targetPackageOrDomain: string;
  app: SelectedApp | undefined;
  currentTime: string; // "HH:MM" e.g. "14:30"
  currentDayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  activeProfile: FocusProfile | null;
  isFocusSessionActive: boolean;
  isEmergencyStateActive: boolean;
  isBreakStateActive: boolean;
}

export interface EngineResult {
  decision: EngineDecision;
  reason: string;
  ruleExplanation: string;
  remainingDailyAllowanceSeconds?: number;
  activeProfileName?: string;
  interventionType?: string;
}

/**
 * Deterministic rule engine for FocusLock enforcement (Section 41)
 * Evaluates priority hierarchy:
 * 1. Essential Whitelist (Phone, Maps, Emergency) -> ALLOW
 * 2. Active Emergency State -> EMERGENCY
 * 3. Active Mindful Break -> BREAK
 * 4. Active Hard Block during Focus Session -> BLOCK
 * 5. Daily Limit Exceeded -> BLOCK
 * 6. Scheduled Interval Active -> BLOCK
 * 7. Gentle Intervention rule active -> INTERVENE
 * 8. Otherwise -> ALLOW
 */
export function evaluateBlockRule(input: BlockingEngineInput): EngineResult {
  const { 
    app, 
    currentTime, 
    currentDayOfWeek, 
    activeProfile, 
    isFocusSessionActive, 
    isEmergencyStateActive, 
    isBreakStateActive 
  } = input;

  // 1. Whitelist Check
  if (app?.isEssential) {
    return {
      decision: 'ALLOW',
      reason: 'Essential communication & utility application.',
      ruleExplanation: 'RULE 1: IF app is whitelisted THEN ALLOW.'
    };
  }

  // 2. Emergency State Check
  if (isEmergencyStateActive) {
    return {
      decision: 'EMERGENCY',
      reason: 'Temporary emergency unlock is active.',
      ruleExplanation: 'RULE 2: ELSE IF emergency state active THEN ALLOW.'
    };
  }

  // 3. Break Mode Check
  if (isBreakStateActive) {
    return {
      decision: 'BREAK',
      reason: 'Mindful break interval active.',
      ruleExplanation: 'RULE 3: ELSE IF break mode active THEN ALLOW (BREAK).'
    };
  }

  if (!app || !app.enabled) {
    return {
      decision: 'ALLOW',
      reason: 'App protection not enabled.',
      ruleExplanation: 'RULE: App is not in guarded list -> ALLOW.'
    };
  }

  // 4. Active Focus Session Hard Block Check
  if (isFocusSessionActive) {
    if (activeProfile?.selectedApps.includes(app.id) || activeProfile?.type === 'game' || activeProfile?.type === 'social') {
      if (activeProfile?.strictLock || app.ruleType === 'hard_block') {
        return {
          decision: 'BLOCK',
          reason: `Active Focus Session (${activeProfile?.name || 'Deep Work'}) is strictly locking this application.`,
          ruleExplanation: 'RULE 4: ELSE IF active hard block focus session THEN BLOCK.',
          activeProfileName: activeProfile?.name
        };
      }
      return {
        decision: 'INTERVENE',
        reason: `Focus session active: ${activeProfile?.name}. A conscious challenge is required before proceeding.`,
        ruleExplanation: 'RULE 4b: Focus session active with gentle intervention -> INTERVENE.',
        interventionType: app.interventionId || activeProfile?.intervention
      };
    }
  }

  // 5. Daily Limit Check
  if (app.ruleType === 'daily_limit' || (app.dailyLimitSeconds && app.dailyLimitSeconds > 0)) {
    if (app.usedTodaySeconds >= app.dailyLimitSeconds) {
      return {
        decision: 'BLOCK',
        reason: `Daily screen time limit of ${Math.round(app.dailyLimitSeconds / 60)} minutes has been reached for today.`,
        ruleExplanation: 'RULE 5: ELSE IF daily limit exceeded THEN BLOCK.',
        remainingDailyAllowanceSeconds: 0
      };
    }
  }

  // 6. Scheduled Blocking Check
  if (app.ruleType === 'scheduled' && app.scheduleIntervals && app.scheduleIntervals.length > 0) {
    for (const interval of app.scheduleIntervals) {
      if (interval.days.includes(currentDayOfWeek)) {
        if (isTimeInInterval(currentTime, interval.start, interval.end)) {
          return {
            decision: 'BLOCK',
            reason: `Scheduled block is active (${interval.start} - ${interval.end}).`,
            ruleExplanation: 'RULE 6: ELSE IF scheduled block active THEN BLOCK.'
          };
        }
      }
    }
  }

  // Also check if an active profile schedule matches
  if (activeProfile && activeProfile.enabled && activeProfile.days.includes(currentDayOfWeek)) {
    if (isTimeInInterval(currentTime, activeProfile.startTime, activeProfile.endTime)) {
      if (activeProfile.selectedApps.includes(app.id)) {
        if (activeProfile.strictLock || activeProfile.intervention === 'strict_block') {
          return {
            decision: 'BLOCK',
            reason: `Active scheduled profile: ${activeProfile.name} (${activeProfile.startTime} - ${activeProfile.endTime}).`,
            ruleExplanation: 'RULE 6b: Active profile schedule in effect -> BLOCK.',
            activeProfileName: activeProfile.name
          };
        } else {
          return {
            decision: 'INTERVENE',
            reason: `Scheduled profile ${activeProfile.name} is active. Complete challenge to open.`,
            ruleExplanation: 'RULE 7: ELSE IF intervention rule active THEN INTERVENE.',
            interventionType: activeProfile.intervention
          };
        }
      }
    }
  }

  // 7. Standalone Gentle Intervention Rule Check
  if (app.ruleType === 'intervention') {
    return {
      decision: 'INTERVENE',
      reason: `Gentle intervention configured for ${app.name}.`,
      ruleExplanation: 'RULE 7: ELSE IF intervention rule active THEN INTERVENE.',
      interventionType: app.interventionId
    };
  }

  // 8. Default Allow
  return {
    decision: 'ALLOW',
    reason: 'No blocking policies triggered.',
    ruleExplanation: 'RULE 8: ELSE ALLOW.'
  };
}

function isTimeInInterval(current: string, start: string, end: string): boolean {
  // If start <= end, standard interval: e.g. 09:00 - 17:00
  if (start <= end) {
    return current >= start && current <= end;
  }
  // Overnight interval: e.g. 22:00 - 07:00
  return current >= start || current <= end;
}
