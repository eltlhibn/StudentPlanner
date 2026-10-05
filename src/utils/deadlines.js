/**
 * DUE DATES
 * ---------
 * The student types the deadline as free text, so before we can sort tasks by
 * "nearest deadline" we have to turn that text into a real date.
 * Anything we cannot understand simply sorts last.
 */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_RE = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?';

/** Roll a month/day with no explicit year into the nearest sensible year. */
function withImpliedYear(month, day, now) {
  const candidate = new Date(now.getFullYear(), month, day);
  const sixMonthsMs = 1000 * 60 * 60 * 24 * 183;
  // "Jan 10" typed in December means next January, not eleven months ago.
  if (now.getTime() - candidate.getTime() > sixMonthsMs) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

/**
 * Best-effort parse of free-text due dates such as
 * "Thursday, Dec 5", "December 5th", "5 Dec", "12/5", "12/5/2026" or "2026-12-05".
 * Returns null when nothing recognisable is found.
 */
export function parseDueDate(text, now = new Date()) {
  const typed = text.trim().toLowerCase();
  if (!typed) return null;

  // "2026-12-05"
  let match = typed.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  // "December 5th" / "Dec 5, 2026"
  match = typed.match(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`));
  if (match) {
    const month = MONTHS.indexOf(match[1]);
    const day = Number(match[2]);
    return match[3] ? new Date(Number(match[3]), month, day) : withImpliedYear(month, day, now);
  }

  // "5 December" / "5th Dec 2026"
  match = typed.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${MONTH_RE}(?:,?\\s+(\\d{4}))?`));
  if (match) {
    const month = MONTHS.indexOf(match[2]);
    const day = Number(match[1]);
    return match[3] ? new Date(Number(match[3]), month, day) : withImpliedYear(month, day, now);
  }

  // "12/5" / "12/5/2026"  (month first)
  match = typed.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (match) {
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    if (month < 0 || month > 11 || day < 1 || day > 31) return null;
    if (match[3]) {
      const year = Number(match[3]);
      return new Date(year < 100 ? 2000 + year : year, month, day);
    }
    return withImpliedYear(month, day, now);
  }

  return null;
}

/**
 * Turn a date the student picked in the calendar into the text we save:
 * "2026-12-05". This is the first format parseDueDate() understands, so a picked
 * date always sorts correctly and no extra sorting code is needed.
 */
export function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() starts at 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Sort a list of tasks by nearest deadline:
 *   1. tasks that are not done yet come before completed ones,
 *   2. then the closest deadline first,
 *   3. tasks whose date we cannot read go to the end.
 * The order the list came in is kept for ties (Array.sort never reorders equal items).
 * The input list is never modified: we sort a copy and return that.
 */
export function sortByDeadline(tasks) {
  const now = new Date();

  return [...tasks].sort((first, second) => {
    if (first.done !== second.done) return first.done ? 1 : -1;

    const firstTime = parseDueDate(first.dueDate, now)?.getTime() ?? null;
    const secondTime = parseDueDate(second.dueDate, now)?.getTime() ?? null;

    if (firstTime === null) return secondTime === null ? 0 : 1;
    if (secondTime === null) return -1;
    return firstTime - secondTime;
  });
}