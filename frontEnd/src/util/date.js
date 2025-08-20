export function formatDateRange(start, end) {
    if (!start && !end) return "";
    const s = formatDate(start);
    const e = formatDate(end);
    if (s === e) return s;
    return `${s} ~ ${e}`;
}

export function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = toDate(dateStr);
    if (!d) return dateStr;
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}.${m}.${day}`;
}

/* ========= 추가 유틸 ========= */
export function toDate(dateStr) {
    if (!dateStr) return null;
    // YYYY-MM-DD → 로컬 자정 기준 Date
    const d = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export function isOngoing(startStr, endStr) {
    const s = toDate(startStr);
    const e = toDate(endStr ?? startStr);
    if (!s || !e) return false;
    const t = todayMidnight();
    return s <= t && t <= e;
}

export function isUpcoming(startStr) {
    const s = toDate(startStr);
    if (!s) return false;
    const t = todayMidnight();
    return s > t;
}

export function isPast(endStr) {
    const e = toDate(endStr);
    const t = todayMidnight();
    if (!e) return false;
    return e < t;
}

/* 'YYYY-MM' 키 만들기 */
export function toMonthKey(dateStr) {
    const d = toDate(dateStr);
    if (!d) return "";
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    return `${y}-${m}`;
}
