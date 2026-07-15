import { addDays, addMinutes, isBefore, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export type AvailabilityRule = {
  day_of_week: number; // 0 = Sunday
  start_time: string; // "HH:mm:ss"
  end_time: string;
};

export type DateOverride = {
  date: string; // "yyyy-MM-dd"
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type BusyInterval = { start: Date; end: Date };

export type Slot = {
  start: Date;
  end: Date;
  spotsRemaining: number;
};

export type SlotComputationInput = {
  rules: AvailabilityRule[];
  overrides: DateOverride[];
  existingBookings: BusyInterval[];
  /** Host's bookings under a *different* event type — any overlap hard-blocks the slot regardless of group capacity. */
  otherHostBookings?: BusyInterval[];
  hostTimezone: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeMinutes: number;
  groupCapacity: number;
  rangeStart: Date;
  rangeEnd: Date;
  slotIntervalMinutes?: number;
  now?: Date;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Local wall-clock date+time in `timezone` -> UTC instant. */
function localToUtc(dateStr: string, minutesFromMidnight: number, timezone: string): Date {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const iso = `${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  return fromZonedTime(iso, timezone);
}

function toDateStr(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // en-CA gives yyyy-MM-dd
}

function dayOfWeekInTz(dateStr: string): number {
  // dateStr is a plain calendar date; construct at noon UTC to avoid DST edge issues
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

export function computeAvailableSlots(input: SlotComputationInput): Slot[] {
  const {
    rules,
    overrides,
    existingBookings,
    otherHostBookings = [],
    hostTimezone,
    durationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    minNoticeMinutes,
    groupCapacity,
    rangeStart,
    rangeEnd,
    slotIntervalMinutes = 15,
    now = new Date(),
  } = input;

  const earliestStart = addMinutes(now, minNoticeMinutes);
  const overridesByDate = new Map(overrides.map((o) => [o.date, o]));
  const rulesByDay = new Map<number, AvailabilityRule[]>();
  for (const rule of rules) {
    const list = rulesByDay.get(rule.day_of_week) ?? [];
    list.push(rule);
    rulesByDay.set(rule.day_of_week, list);
  }

  const slots: Slot[] = [];
  let cursorDay = startOfDay(rangeStart);

  while (isBefore(cursorDay, rangeEnd)) {
    const dateStr = toDateStr(cursorDay, hostTimezone);
    const override = overridesByDate.get(dateStr);

    let windows: { start: number; end: number }[];
    if (override) {
      windows = override.is_available && override.start_time && override.end_time
        ? [{ start: parseTimeToMinutes(override.start_time), end: parseTimeToMinutes(override.end_time) }]
        : [];
    } else {
      const dow = dayOfWeekInTz(dateStr);
      windows = (rulesByDay.get(dow) ?? []).map((r) => ({
        start: parseTimeToMinutes(r.start_time),
        end: parseTimeToMinutes(r.end_time),
      }));
    }

    for (const window of windows) {
      for (
        let minute = window.start;
        minute + durationMinutes <= window.end;
        minute += slotIntervalMinutes
      ) {
        const slotStart = localToUtc(dateStr, minute, hostTimezone);
        const slotEnd = addMinutes(slotStart, durationMinutes);

        if (isBefore(slotStart, earliestStart)) continue;

        const busyWindowStart = addMinutes(slotStart, -bufferBeforeMinutes);
        const busyWindowEnd = addMinutes(slotEnd, bufferAfterMinutes);

        const hostBusyElsewhere = otherHostBookings.some(
          (b) => b.start < busyWindowEnd && b.end > busyWindowStart
        );
        if (hostBusyElsewhere) continue;

        const overlapping = existingBookings.filter(
          (b) => b.start < busyWindowEnd && b.end > busyWindowStart
        ).length;

        const spotsRemaining = groupCapacity - overlapping;
        if (spotsRemaining > 0) {
          slots.push({ start: slotStart, end: slotEnd, spotsRemaining });
        }
      }
    }

    cursorDay = addDays(cursorDay, 1);
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function groupSlotsByLocalDate(slots: Slot[], timezone: string) {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = toDateStr(slot.start, timezone);
    const list = groups.get(key) ?? [];
    list.push(slot);
    groups.set(key, list);
  }
  return groups;
}
