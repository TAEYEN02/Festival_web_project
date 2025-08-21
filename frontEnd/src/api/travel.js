// src/api/travel.js
// 프런트에서 Python 여행 추천 API를 호출하기 위한 유틸.
// 기존 베이스 주소는 프로젝트의 baseUrl 모듈에서 가져옵니다.
import { BASE_URL } from "./baseUrl";

/**
 * @typedef {Object} TravelQuery
 * @property {string=} origin
 * @property {number=} duration_days
 * @property {number=} budget_per_day_usd
 * @property {("solo"|"couple"|"family"|"friends"|"group")=} companions
 * @property {string[]=} travel_styles
 * @property {number[]=} months
 * @property {("warm"|"mild"|"cold"|"dry"|"humid"|"doesn't matter")=} climate
 * @property {string[]=} must_have
 * @property {string[]=} avoid
 * @property {string=} language
 */

/**
 * @typedef {Object} Destination
 * @property {string} name
 * @property {string=} country
 * @property {string} summary
 * @property {string=} best_time
 * @property {string[]} highlights
 * @property {string[]} tags
 * @property {number=} est_budget_per_day_usd
 */

/**
 * @typedef {Object} ItineraryItem
 * @property {number} day
 * @property {string} title
 * @property {string[]} activities
 * @property {string=} notes
 */

/**
 * @typedef {Object} TravelRecResponse
 * @property {Destination} top_pick
 * @property {Destination[]=} alternatives
 * @property {ItineraryItem[]=} itinerary
 * @property {string} rationale
 */

/** ===== URL 보정 유틸 ===== */

/** 스킴 보정: http/https 없으면 http:// 붙임 */
function ensureScheme(url) {
    if (!/^https?:\/\//i.test(url)) {
        return "http://" + url;
    }
    return url;
}

/** 끝의 슬래시 제거 */
function trimTrailingSlash(url) {
    return url.replace(/\/+$/, "");
}

/** 이미 포트가 있으면 그대로, 없으면 지정 포트 추가 */
function addPortIfMissing(url, port) {
    const hasPort = /^https?:\/\/[^/]+:\d+/i.test(url);
    if (hasPort) return url;
    return `${url}:${port}`;
}

/** 최종 Python API 베이스 (기본 8000) */
function resolvePyBase(baseUrl, defaultPort = 8000) {
    let u = baseUrl || "";
    u = ensureScheme(u);
    u = trimTrailingSlash(u);
    u = addPortIfMissing(u, defaultPort);
    return u;
}

/** Python API 베이스 (8000 포트 기준) */
const PY_BASE = resolvePyBase(BASE_URL, 8000);

/** 기본 JSON 헤더 */
const JSON_HEADERS = {
    "Content-Type": "application/json",
};

/**
 * fetch 타임아웃 래퍼 (기본 45초)
 * @param {Promise<Response>} fetchPromise
 * @param {number} ms
 * @returns {Promise<Response>}
 */
function withTimeout(fetchPromise, ms = 45000) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Request timeout")), ms);
    });
    return Promise.race([fetchPromise, timeout]).finally(() => clearTimeout(timeoutId));
}

/** 콘솔 로깅(선택) */
function logCacheMeta(res, url, elapsedMs) {
    try {
        const xCache = res.headers.get("x-cache") || "unknown";
        const xKey = res.headers.get("x-cache-key") || "-";
        const xMode = res.headers.get("x-ai-mode") || "unknown";
        const line = `[TravelAPI] ${url} | cache=${xCache} | ai=${xMode} | key=${xKey} | ${Math.round(
            elapsedMs
        )}ms`;
        if (xCache === "HIT") {
            console.info(line);
        } else if (xCache === "MISS") {
            console.warn(line);
        } else if (xCache === "DISABLED") {
            console.log(line);
        } else {
            console.debug(line + " (headers not exposed)");
        }
    } catch {}
}

/** 메타 추출: UI에서 표시할 값 */
function extractMeta(res, url, elapsedMs) {
    return {
        cache: res.headers.get("x-cache") || "unknown",
        key: res.headers.get("x-cache-key") || "-",
        ai: res.headers.get("x-ai-mode") || "unknown",
        elapsedMs: Math.round(elapsedMs),
        url,
    };
}

/**
 * 샘플 요청 DTO 가져오기 (백엔드에서 제공)
 * @returns {Promise<TravelQuery>}
 */
export async function getTravelSampleQuery() {
    const url = `${PY_BASE}/api/travel/sample-query`;
    const t0 = performance.now();
    const res = await withTimeout(fetch(url), 45000);
    const t1 = performance.now();
    logCacheMeta(res, url, t1 - t0);
    if (!res.ok) return throwHttpError(res);
    return res.json();
}

/**
 * 에러 본문 표준화
 * @param {Response} res
 * @returns {Promise<never>}
 */
async function throwHttpError(res) {
    let detail = `HTTP ${res.status}`;
    try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const data = await res.json();
            if (data && (data.detail || data.message)) detail = data.detail || data.message;
        } else {
            const text = await res.text();
            if (text) detail = text;
        }
    } catch {}
    const err = new Error(detail);
    // @ts-ignore
    err.status = res.status;
    throw err;
}

/**
 * 여행지 추천 생성 (메타 포함)
 * @param {TravelQuery} query
 * @returns {Promise<{data: TravelRecResponse, meta: {cache:string, key:string, ai:string, elapsedMs:number, url:string}}>}
 */
export async function recommendTravelWithMeta(query) {
    const url = `${PY_BASE}/api/travel/recommend`;
    const t0 = performance.now();
    const res = await withTimeout(
        fetch(url, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(query ?? {}),
        }),
        45000
    );
    const t1 = performance.now();
    logCacheMeta(res, url, t1 - t0);
    if (!res.ok) return throwHttpError(res);
    const data = await res.json();
    const meta = extractMeta(res, url, t1 - t0);
    return { data, meta };
}

/**
 * 여행지 추천 생성 (이전과 동일한 반환: 데이터만)
 * @param {TravelQuery} query
 * @returns {Promise<TravelRecResponse>}
 */
export async function recommendTravel(query) {
    const { data } = await recommendTravelWithMeta(query);
    return data;
}

/**
 * UI 폼 상태를 API 스키마로 변환하는 헬퍼 (선택)
 * @param {Object} form
 * @param {string=} form.origin
 * @param {(string|number)=} form.days
 * @param {(string|number)=} form.budget
 * @param {string=} form.companions
 * @param {string[]=} form.styles
 * @param {(string[]|number[])=} form.months
 * @param {string=} form.climate
 * @param {string[]=} form.mustHave
 * @param {string[]=} form.avoid
 * @param {string=} form.language
 * @returns {TravelQuery}
 */
export function buildTravelPayload(form = {}) {
    const toIntOrUndef = (v) => {
        if (v === null || v === undefined || v === "") return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };
    const toIntArray = (arr) => {
        if (!Array.isArray(arr)) return undefined;
        const out = arr
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n) && n >= 1 && n <= 12);
        return out.length ? out : undefined;
    };
    const toStrArray = (arr) => {
        if (!Array.isArray(arr)) return undefined;
        const out = arr.map((v) => String(v).trim()).filter(Boolean);
        return out.length ? out : undefined;
    };

    return {
        origin: form.origin || undefined,
        duration_days: toIntOrUndef(form.days),
        budget_per_day_usd: toIntOrUndef(form.budget),
        companions: form.companions || undefined,
        travel_styles: toStrArray(form.styles),
        months: toIntArray(form.months),
        climate: form.climate || undefined,
        must_have: toStrArray(form.mustHave),
        avoid: toStrArray(form.avoid),
        language: form.language || "ko",
    };
}
