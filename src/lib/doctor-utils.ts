// Specialties list
export const specialties = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Ophthalmology",
  "Psychiatry",
  "Radiology",
  "Urology",
  "Gynecology",
];

// Days of the week (MON..SUN) — kept for UI order
export const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --- Types ---
export type Doctor = {
  userId?: string;
  hospitalId?: number;
  role?: string;
  user: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    doctorProfiles?: {
      id: number;
      speciality?: string;
      aboutDetails?: string;
    }[];
  };
};

export type Availability = {
  day: string;
  ranges: { start: string; end: string }[]; // local times "HH:mm"
};

/* ------------- small helpers ------------- */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* ------------- utility: get local date for a weekday ------------- */
// targetWeekday is JS weekday number 0=Sunday ... 6=Saturday
function getNextLocalDateForWeekday(targetWeekday: number) {
  const today = new Date();
  const todayWeekday = today.getDay(); // 0=Sun
  const diff = (targetWeekday - todayWeekday + 7) % 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/* ---------------------------
   UTC <-> Local conversion helpers
   --------------------------- */

/**
 * Convert API availabilities (UTC times + days[] where days are 0=Sun..6=Sat)
 * into UI selections where times are local and grouped by day name (Monday..Sunday).
 */
export function convertApiAvailabilitiesToSelections(
  apiAvailabilities: any[]
): Availability[] {
  const map = new Map<string, Set<string>>(); // dayName -> set of "HH:mm-HH:mm"

  for (const a of apiAvailabilities || []) {
    const startParts = (a.startTime || "00:00:00").split(":").map(Number);
    const endParts = (a.endTime || "00:00:00").split(":").map(Number);

    for (const utcDay of a.days || []) {
      // Build a UTC Date at the correct upcoming weekday + UTC start time
      const todayUtc = new Date();
      const todayUtcDay = todayUtc.getUTCDay();
      const diff = (utcDay - todayUtcDay + 7) % 7;

      const utcStartTimestamp = Date.UTC(
        todayUtc.getUTCFullYear(),
        todayUtc.getUTCMonth(),
        todayUtc.getUTCDate() + diff,
        startParts[0] || 0,
        startParts[1] || 0,
        startParts[2] || 0
      );
      const utcStartDate = new Date(utcStartTimestamp);

      // UTC end (may be same day or next day)
      let utcEndTimestamp = Date.UTC(
        utcStartDate.getUTCFullYear(),
        utcStartDate.getUTCMonth(),
        utcStartDate.getUTCDate(),
        endParts[0] || 0,
        endParts[1] || 0,
        endParts[2] || 0
      );
      if (utcEndTimestamp <= utcStartTimestamp) {
        // assume end is next day
        utcEndTimestamp += 24 * 60 * 60 * 1000;
      }
      const utcEndDate = new Date(utcEndTimestamp);

      // Convert to local Date objects (same timestamps)
      const localStart = new Date(utcStartDate.getTime());
      const localEnd = new Date(utcEndDate.getTime());

      const localStartKey = `${pad(localStart.getHours())}:${pad(
        localStart.getMinutes()
      )}`;
      const localEndKey = `${pad(localEnd.getHours())}:${pad(
        localEnd.getMinutes()
      )}`;

      // daysOfWeek index 0 = Monday, so map JS getDay() (0=Sun) to this by (d + 6) % 7
      const localDayIndexForDaysOfWeek = (localStart.getDay() + 6) % 7;
      const localDayName = daysOfWeek[localDayIndexForDaysOfWeek];

      const rangeKey = `${localStartKey}-${localEndKey}`;
      if (!map.has(localDayName)) map.set(localDayName, new Set<string>());
      map.get(localDayName)!.add(rangeKey);
    }
  }

  const result: Availability[] = [];
  for (const dayName of daysOfWeek) {
    const set = map.get(dayName);
    if (set && set.size > 0) {
      const ranges = Array.from(set)
        .sort()
        .map((r) => {
          const [start, end] = r.split("-");
          return { start, end };
        });
      result.push({ day: dayName, ranges });
    }
  }
  return result;
}

/**
 * Convert UI selections (local day names + ranges "HH:mm") back to API payload
 * where times are in UTC "HH:MM:SS" and days are 0=Sun..6=Sat (UTC weekday numbers).
 */
export function convertSelectionsToUtcPayload(selections: Availability[]) {
  const map = new Map<string, Set<number>>(); // key "HH:MM:SS-HH:MM:SS" -> set of utc weekday numbers

  for (const dayEntry of selections) {
    const localDayName = dayEntry.day;
    // Map local day name (Monday..Sunday) to JS weekday number (0=Sun..6=Sat)
    const localWeekdayNumber = (daysOfWeek.indexOf(localDayName) + 1) % 7; // 0..6 (JS getDay)
    for (const range of dayEntry.ranges) {
      const [startLocal, endLocal] = [range.start, range.end]; // "HH:mm"
      const [sH, sM] = startLocal.split(":").map(Number);
      const [eH, eM] = endLocal.split(":").map(Number);

      const startLocalDate = getNextLocalDateForWeekday(localWeekdayNumber);
      startLocalDate.setHours(sH, sM, 0, 0);

      const endLocalDate = new Date(startLocalDate.getTime());
      endLocalDate.setHours(eH, eM, 0, 0);
      if (endLocalDate.getTime() <= startLocalDate.getTime()) {
        // if end <= start, assume end is next day
        endLocalDate.setDate(endLocalDate.getDate() + 1);
      }

      // Convert to UTC fields
      const utcStartTime = `${pad(startLocalDate.getUTCHours())}:${pad(
        startLocalDate.getUTCMinutes()
      )}:00`;
      const utcEndTime = `${pad(endLocalDate.getUTCHours())}:${pad(
        endLocalDate.getUTCMinutes()
      )}:00`;
      const utcStartDay = startLocalDate.getUTCDay(); // 0=Sun..6=Sat

      const key = `${utcStartTime}-${utcEndTime}`;
      if (!map.has(key)) map.set(key, new Set<number>());
      map.get(key)!.add(utcStartDay);
    }
  }

  const payload: { days: number[]; startTime: string; endTime: string }[] = [];
  for (const [k, setOfDays] of map.entries()) {
    const [startTime, endTime] = k.split("-");
    payload.push({
      days: Array.from(setOfDays).sort((a, b) => a - b),
      startTime,
      endTime,
    });
  }
  return payload;
}

export const extractDoctorProfileId = (doctorObj: Doctor | null) => {
  return doctorObj?.user?.doctorProfiles?.[0]?.id ?? null;
};
