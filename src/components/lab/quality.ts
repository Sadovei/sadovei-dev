export type QualityTier = "low" | "medium" | "high";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export const qualitySettings: Record<QualityTier, { dpr: [number, number]; antialias: boolean }> = {
  low: { dpr: [1, 1], antialias: false },
  medium: { dpr: [1, 1.5], antialias: false },
  high: { dpr: [1, 2], antialias: true },
};

// Picks a starting quality from cheap, synchronous device hints.
export function detectQualityTier(): QualityTier {
  const nav = navigator as NavigatorHints;
  const connection = nav.connection;
  if (connection?.saveData || /2g|3g/.test(connection?.effectiveType ?? "")) return "low";

  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return "low";

  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch || memory <= 4 || cores <= 4) return "medium";
  return "high";
}

const STORAGE_KEY = "lab-quality";

export function readSavedTier(): QualityTier | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "low" || value === "medium" || value === "high" ? value : null;
  } catch {
    return null;
  }
}

export function saveTier(tier: QualityTier) {
  try {
    window.localStorage.setItem(STORAGE_KEY, tier);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
}
