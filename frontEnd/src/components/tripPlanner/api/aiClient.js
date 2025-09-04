import axios from "axios";

const BASE = process.env.REACT_APP_AI_BASE || "http://localhost:8000";

export async function createItinerary(payload, signal) {
    const url = `${BASE}/api/ai/itinerary`;
    const res = await axios.post(url, payload, {
        signal,
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
    });
    return res.data; // { model?, plan: { title, days, summary, daily[], notes? } } or just plan
}
