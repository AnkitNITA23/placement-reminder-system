import { quotes } from '../quotes';

/**
 * Pads a number to 2 digits (e.g., 7 -> "07")
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Formats a Date object as a DTSTART/DTEND value in IST (UTC+5:30)
 * Returns string like: 20260720T073000
 */
function formatDateTimeIST(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Formats a Date object as a UTC timestamp for DTSTAMP (UID generation)
 * Returns string like: 20260720T020000Z
 */
function formatUTC(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Wraps long iCalendar lines at 75 octets (RFC 5545 requirement)
 */
function foldLine(line) {
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  let result = '';
  let remaining = line;
  result += remaining.slice(0, maxLen) + '\r\n';
  remaining = remaining.slice(maxLen);
  while (remaining.length > 0) {
    result += ' ' + remaining.slice(0, maxLen - 1) + '\r\n';
    remaining = remaining.slice(maxLen - 1);
  }
  return result;
}

/**
 * Escapes special characters in iCalendar text values
 */
function escapeICS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate the full .ics file content for all 54 placement days.
 *
 * @param {string} startDateStr - ISO date string for Day 1 (e.g., "2026-07-20")
 * @param {number} reminderHour - 24-hour format hour for the daily reminder (e.g., 7 for 7:30 AM)
 * @param {number} reminderMinute - Minute for the daily reminder (e.g., 30 for 7:30 AM)
 * @param {number} alarmOffsetMin - Minutes BEFORE the event to trigger the pop-up alarm (0 = at event time)
 * @returns {string} Full RFC 5545 .ics file content
 */
export function generateICS(startDateStr, reminderHour = 7, reminderMinute = 30, alarmOffsetMin = 0) {
  // Parse start date as local date (avoid UTC offset issues)
  const [year, month, day] = startDateStr.split('-').map(Number);

  const nowUTC = formatUTC(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Placement Basecamp//54 Day Sprint//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:📚 Placement Sprint — 54 Days',
    'X-WR-CALDESC:Daily placement preparation reminders for Ankit Kumar · NIT Agartala',
    'X-WR-TIMEZONE:Asia/Kolkata',
    // Embed IST timezone definition for full compatibility
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Kolkata',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  for (let dayIndex = 1; dayIndex <= 54; dayIndex++) {
    // Build event date (start date + dayIndex - 1 days)
    const eventDate = new Date(year, month - 1, day + (dayIndex - 1));
    const eventDateEnd = new Date(year, month - 1, day + (dayIndex - 1));

    // Set reminder time
    eventDate.setHours(reminderHour, reminderMinute, 0, 0);
    // Event lasts 10 minutes
    eventDateEnd.setHours(reminderHour, reminderMinute + 10, 0, 0);

    // Adjust if minute overflow
    if (reminderMinute + 10 >= 60) {
      eventDateEnd.setHours(reminderHour + 1, (reminderMinute + 10) - 60, 0, 0);
    }

    // Get quote for this day
    const quoteObj = quotes.find(q => q.day === dayIndex) || quotes[0];
    const daysLeft = 54 - dayIndex;

    const summary = `📚 Day ${dayIndex}/54 — Placement Basecamp`;

    const descriptionRaw = [
      `Day ${dayIndex} of 54 · ${daysLeft} days remaining`,
      `Topic: ${quoteObj.topic}`,
      ``,
      `"${quoteObj.quote}"`,
      ``,
      `✅ Open Placement Basecamp to review your checklist for today.`,
      `Stay calibrated, Ankit!`,
    ].join('\n');

    const alarmDescription =
      alarmOffsetMin > 0
        ? `Day ${dayIndex}/54 reminder — ${alarmOffsetMin} min until your prep session!`
        : `Day ${dayIndex}/54 — Open Placement Basecamp & start your session!`;

    const uid = `placement-day-${dayIndex}-${startDateStr}@placement-basecamp`;

    // TRIGGER: negative duration means "before event", zero means "at event time"
    const triggerValue = alarmOffsetMin > 0 ? `-PT${alarmOffsetMin}M` : 'PT0S';

    lines.push(
      'BEGIN:VEVENT',
      foldLine(`UID:${uid}`).trimEnd(),
      foldLine(`DTSTAMP:${nowUTC}`).trimEnd(),
      foldLine(`DTSTART;TZID=Asia/Kolkata:${formatDateTimeIST(eventDate)}`).trimEnd(),
      foldLine(`DTEND;TZID=Asia/Kolkata:${formatDateTimeIST(eventDateEnd)}`).trimEnd(),
      foldLine(`SUMMARY:${escapeICS(summary)}`).trimEnd(),
      foldLine(`DESCRIPTION:${escapeICS(descriptionRaw)}`).trimEnd(),
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      `CATEGORIES:${escapeICS(quoteObj.category || 'study')}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      foldLine(`DESCRIPTION:${escapeICS(alarmDescription)}`).trimEnd(),
      `TRIGGER:${triggerValue}`,
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Trigger a browser download of the .ics file
 */
export function downloadICS(icsContent, filename = 'placement-sprint-54days.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
